import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Papa from "papaparse";
import API from "../services/api";

const HEADERS = [
  "testNumber",
  "section",
  "question",
  "option1",
  "option2",
  "option3",
  "option4",
  "correct",
  "explanation",
];
const REQUIRED = ["question", "option1", "option2", "option3", "option4", "correct"];
const SAMPLE = [
  ["1", "Maths", "What is 15% of 200?", "20", "25", "30", "35", "3", "15% of 200 = (15 x 200) / 100 = 30"],
  ["1", "English", "Choose the synonym of Rapid.", "Slow", "Quick", "Weak", "Late", "2", "Rapid and quick both mean fast"],
  ["2", "Reasoning", "Find the odd one out: 2, 4, 8, 16, 20", "4", "8", "16", "20", "4", "Baaki sab 2 ki powers hain, 20 nahi"],
];

function AdminBulkUpload() {
  const [exams, setExams] = useState([]);
  const [examId, setExamId] = useState("");
  const [defaultTest, setDefaultTest] = useState(1);
  const [fileName, setFileName] = useState("");
  const [rows, setRows] = useState([]);
  const [parseError, setParseError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    API.get("/exams")
      .then((res) => {
        setExams(res.data);
        if (res.data.length > 0) setExamId(res.data[0]._id);
      })
      .catch((err) => setError(err.message));
  }, []);

  const downloadSample = () => {
    const csv = Papa.unparse({ fields: HEADERS, data: SAMPLE });
    // BOM se Excel Hindi aur special akshar sahi kholta hai
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "questions-sample.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    setResult(null);
    setError("");
    setParseError("");
    setRows([]);
    setFileName("");
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".csv")) {
      setParseError("Sirf .csv file chuno");
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: "greedy",
      transformHeader: (h) => h.replace(/^\uFEFF/, "").trim(),
      complete: (res) => {
        const fields = res.meta.fields || [];
        const missing = REQUIRED.filter((h) => !fields.includes(h));
        if (missing.length > 0) {
          setParseError(`Yeh columns nahi mile: ${missing.join(", ")}`);
          return;
        }
        if (res.data.length === 0) {
          setParseError("File mein koi row nahi hai");
          return;
        }
        if (res.data.length > 500) {
          setParseError("Ek baar mein maximum 500 questions. File chhoti karo.");
          return;
        }
        setFileName(file.name);
        setRows(res.data);
      },
      error: (err) => setParseError(err.message),
    });
  };

  const handleUpload = async () => {
    setError("");
    setResult(null);
    setUploading(true);
    try {
      const { data } = await API.post("/questions/bulk", {
        exam: examId,
        defaultTest,
        questions: rows,
      });
      setResult(data);
      setRows([]);
      setFileName("");
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
    setUploading(false);
  };

  return (
    <div className="section">
      <h1>Bulk Upload Questions</h1>
      <Link to="/admin/questions" className="card-btn">Back to Manage Questions</Link>

      <div className="auth-box" style={{ margin: "20px 0", maxWidth: "640px" }}>
        <h2>CSV se questions daalo</h2>

        <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "14px" }}>
          Columns: testNumber, section, question, option1 se option4, correct (1 se 4).
          testNumber aur section khaali chhod sakte ho. Excel se save karte waqt
          <b> CSV UTF-8 (Comma delimited)</b> chuno.
        </p>

        <button
          type="button"
          onClick={downloadSample}
          style={{ marginBottom: "16px", background: "#64748b" }}
        >
          Sample CSV download karo
        </button>

        <label style={{ display: "block", fontWeight: 600, marginBottom: "6px" }}>
          Exam
        </label>
        <select
          value={examId}
          onChange={(e) => setExamId(e.target.value)}
          style={{ width: "100%", padding: "12px", marginBottom: "14px" }}
        >
          {exams.map((ex) => (
            <option key={ex._id} value={ex._id}>{ex.name}</option>
          ))}
        </select>

        <label style={{ display: "block", fontWeight: 600, marginBottom: "6px" }}>
          Default test number (jin rows mein testNumber khaali ho)
        </label>
        <input
          type="number"
          min="1"
          value={defaultTest}
          onChange={(e) => setDefaultTest(e.target.value)}
        />

        <label style={{ display: "block", fontWeight: 600, marginBottom: "6px" }}>
          CSV file
        </label>
        <input type="file" accept=".csv" onChange={handleFile} />

        {parseError && (
          <p style={{ color: "#b91c1c", marginBottom: "12px" }}>{parseError}</p>
        )}
        {error && <p style={{ color: "#b91c1c", marginBottom: "12px" }}>{error}</p>}

        {rows.length > 0 && (
          <>
            <p style={{ margin: "8px 0" }}>
              <b>{fileName}</b>: {rows.length} questions mile. Pehle 5 ka preview:
            </p>
            <div style={{ overflowX: "auto", marginBottom: "14px" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                <thead>
                  <tr style={{ background: "#e0e7ff", textAlign: "left" }}>
                    <th style={{ padding: "6px" }}>Test</th>
                    <th style={{ padding: "6px" }}>Section</th>
                    <th style={{ padding: "6px" }}>Question</th>
                    <th style={{ padding: "6px" }}>Sahi</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 5).map((r, i) => (
                    <tr key={i} style={{ borderTop: "1px solid #e5e7eb" }}>
                      <td style={{ padding: "6px" }}>{r.testNumber || defaultTest}</td>
                      <td style={{ padding: "6px" }}>{r.section || "General"}</td>
                      <td style={{ padding: "6px" }}>{r.question}</td>
                      <td style={{ padding: "6px" }}>{r.correct}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button onClick={handleUpload} disabled={uploading || !examId}>
              {uploading ? "Upload ho raha hai..." : `${rows.length} questions upload karo`}
            </button>
          </>
        )}
      </div>

      {result && (
        <div className="exam-card" style={{ maxWidth: "640px" }}>
          <h3 style={{ color: "#047857" }}>{result.added} questions add ho gaye</h3>

          {result.failed.length > 0 && (
            <>
              <p style={{ color: "#b91c1c", margin: "10px 0 6px" }}>
                {result.failed.length} rows mein galti thi (wo add nahi hui):
              </p>
              <ul style={{ paddingLeft: "18px" }}>
                {result.failed.slice(0, 30).map((f, i) => (
                  <li key={i}>Line {f.line}: {f.reason}</li>
                ))}
              </ul>
              {result.failed.length > 30 && <p>...aur bhi hain.</p>}
              <p style={{ marginTop: "8px", color: "#64748b" }}>
                Sirf galat rows theek karke dobara upload karo, sahi wali dobara mat bhejna.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminBulkUpload;