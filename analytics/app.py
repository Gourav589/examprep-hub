import base64
import io
import os
import secrets

import matplotlib

matplotlib.use("Agg")

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import seaborn as sns
from bson import ObjectId
from bson.errors import InvalidId
from dotenv import load_dotenv
from fastapi import FastAPI, Header, HTTPException
from pymongo import MongoClient

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://127.0.0.1:27017/examprep")
API_KEY = os.getenv("ANALYTICS_KEY", "")

client = MongoClient(MONGO_URI)
db = client.get_default_database()

app = FastAPI()


def load_attempts():
    rows = list(db.attempts.find({}))
    if not rows:
        return pd.DataFrame()
    df = pd.DataFrame(rows)
    df["user"] = df["user"].astype(str)
    df["exam"] = df["exam"].astype(str)
    df["pct"] = np.where(df["total"] > 0, df["correct"] / df["total"] * 100, 0)
    return df


def section_frame(df):
    recs = []
    for _, row in df.iterrows():
        secs = row.get("sections")
        if not isinstance(secs, dict):
            continue
        for name, s in secs.items():
            recs.append(
                {
                    "user": row["user"],
                    "section": name,
                    "correct": s.get("correct", 0),
                    "total": s.get("total", 0),
                }
            )
    return pd.DataFrame(recs)


def fig_to_b64(fig):
    buf = io.BytesIO()
    fig.savefig(buf, format="png", dpi=110, bbox_inches="tight")
    plt.close(fig)
    return "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode()


@app.get("/analytics/{user_id}")
def analytics(user_id: str, x_api_key: str = Header(default="")):
    if not API_KEY or not secrets.compare_digest(x_api_key, API_KEY):
        raise HTTPException(status_code=401, detail="Unauthorized")

    try:
        ObjectId(user_id)
    except (InvalidId, TypeError):
        raise HTTPException(status_code=400, detail="Invalid user id")

    df = load_attempts()
    if df.empty or user_id not in set(df["user"]):
        return {"hasData": False}

    mine = df[df["user"] == user_id].sort_values("createdAt")
    exam_names = {str(e["_id"]): e.get("name", "Exam") for e in db.exams.find({}, {"name": 1})}

    user_avg = df.groupby("user")["pct"].mean()
    my_avg = float(user_avg[user_id])
    others = user_avg.drop(user_id)
    percentile = int(round((others <= my_avg).mean() * 100)) if len(others) else None

    secs = section_frame(df)
    sections = []
    chart_sections = None
    weakest = None

    if not secs.empty:
        mine_secs = secs[secs["user"] == user_id]
        my_sec = mine_secs.groupby("section")[["correct", "total"]].sum()
        all_sec = secs.groupby("section")[["correct", "total"]].sum()

        for name in my_sec.index:
            t = my_sec.loc[name, "total"]
            you = float(my_sec.loc[name, "correct"] / t * 100) if t else 0.0
            at = all_sec.loc[name, "total"]
            avg = float(all_sec.loc[name, "correct"] / at * 100) if at else 0.0
            sections.append({"name": name, "you": round(you), "classAvg": round(avg)})

        if sections:
            weakest = min(sections, key=lambda s: s["you"])["name"]

            plot_df = pd.DataFrame(
                [{"Section": s["name"], "Accuracy": s["you"], "Who": "You"} for s in sections]
                + [
                    {"Section": s["name"], "Accuracy": s["classAvg"], "Who": "Class average"}
                    for s in sections
                ]
            )
            sns.set_theme(style="whitegrid")
            fig, ax = plt.subplots(figsize=(7, 3.6))
            sns.barplot(
                data=plot_df,
                x="Section",
                y="Accuracy",
                hue="Who",
                palette={"You": "#2563eb", "Class average": "#94a3b8"},
                ax=ax,
            )
            ax.set_ylim(0, 100)
            ax.set_ylabel("Accuracy (%)")
            ax.set_xlabel("")
            ax.set_title("Section-wise accuracy: You vs Class")
            ax.legend(title="")
            chart_sections = fig_to_b64(fig)

    trend = []
    for _, r in mine.iterrows():
        trend.append(
            {
                "date": r["createdAt"].strftime("%d %b"),
                "pct": round(float(r["pct"])),
                "exam": exam_names.get(r["exam"], "Exam"),
            }
        )

    chart_trend = None
    if len(trend) >= 2:
        fig, ax = plt.subplots(figsize=(7, 3.2))
        ax.plot(
            range(1, len(trend) + 1),
            [t["pct"] for t in trend],
            marker="o",
            color="#10b981",
            linewidth=2,
        )
        ax.set_ylim(0, 100)
        ax.set_xticks(range(1, len(trend) + 1))
        ax.set_xlabel("Test number")
        ax.set_ylabel("Score (%)")
        ax.set_title("Your score trend")
        ax.grid(True, alpha=0.3)
        chart_trend = fig_to_b64(fig)

    return {
        "hasData": True,
        "testsTaken": int(len(mine)),
        "averagePct": round(my_avg),
        "bestPct": round(float(mine["pct"].max())),
        "percentile": percentile,
        "peers": int(len(others)),
        "sections": sections,
        "weakest": weakest,
        "trend": trend,
        "charts": {"sections": chart_sections, "trend": chart_trend},
    }