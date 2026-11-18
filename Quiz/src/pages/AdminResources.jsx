import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

const emptyForm = {
  title: "",
  category: "",
  type: "note",
  description: "",
  content: "",
  url: "",
};

function AdminResources() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");

  const load = () => {
    API.get("/resources")
      .then((res) => setItems(res.data))
      .catch((err) => setMessage(err.message));
  };

  useEffect(() => {
    load();
  }, []);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      if (editingId) {
        await API.put(`/resources/${editingId}`, form);
        setMessage("Material update ho gaya");
      } else {
        await API.post("/resources", form);
        setMessage("Material add ho gaya");
      }
      setForm(emptyForm);
      setEditingId(null);
      load();
    } catch (err) {
      setMessage(err.response?.data?.message || err.message);
    }
  };

  const startEdit = async (item) => {
    try {
      const { data } = await API.get(`/resources/${item._id}`);
      setEditingId(data._id);
      setForm({
        title: data.title,
        category: data.category,
        type: data.type,
        description: data.description || "",
        content: data.content || "",
        url: data.url || "",
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setMessage(err.response?.data?.message || err.message);
    }
  };

  const remove = async (id, title) => {
    if (!window.confirm(`"${title}" hata dein?`)) return;
    try {
      await API.delete(`/resources/${id}`);
      setMessage("Material hata diya gaya");
      load();
    } catch (err) {
      setMessage(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="section">
      <h1>Manage Study Material</h1>
      <Link to="/admin" className="card-btn">Back to Admin Panel</Link>

      {message && <p style={{ margin: "15px 0", color: "#4f46e5" }}>{message}</p>}

      <div className="auth-box" style={{ margin: "20px 0", maxWidth: "640px" }}>
        <h2>{editingId ? "Material edit karo" : "Naya material jodo"}</h2>
        <form onSubmit={submit}>
          <input
            name="title"
            placeholder="Title (jaise MS Excel ke zaroori shortcuts)"
            maxLength={120}
            value={form.title}
            onChange={change}
            required
          />
          <input
            name="category"
            placeholder="Category (jaise Computer, HP State, SSC, General)"
            maxLength={40}
            value={form.category}
            onChange={change}
          />
          <select
            name="type"
            value={form.type}
            onChange={change}
            style={{ width: "100%", padding: "12px", marginBottom: "15px" }}
          >
            <option value="note">Note (text yahin likho)</option>
            <option value="link">Link (official ya bharosemand site ka)</option>
          </select>
          <input
            name="description"
            placeholder="Chhota parichay (zaroori nahi, 300 akshar tak)"
            maxLength={300}
            value={form.description}
            onChange={change}
          />

          {form.type === "link" ? (
            <input
              name="url"
              placeholder="https://..."
              value={form.url}
              onChange={change}
              required
            />
          ) : (
            <textarea
              name="content"
              rows={10}
              maxLength={8000}
              placeholder="Note ka poora text (line badalne ke liye Enter dabao)"
              value={form.content}
              onChange={change}
              required
              style={{
                width: "100%",
                padding: "12px",
                marginBottom: "15px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                fontSize: "15px",
                fontFamily: "inherit",
              }}
            />
          )}

          <button type="submit">{editingId ? "Save Changes" : "Add Material"}</button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm(emptyForm);
              }}
              style={{ marginTop: "10px", background: "#64748b" }}
            >
              Cancel
            </button>
          )}
        </form>
      </div>

      <h2 style={{ marginBottom: "15px" }}>Sab material ({items.length})</h2>
      {items.map((it) => (
        <div
          key={it._id}
          className="exam-card"
          style={{
            marginBottom: "12px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h3>{it.title}</h3>
            <p>{it.category} | {it.type === "link" ? "Link" : "Note"}</p>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={() => startEdit(it)}
              style={{ padding: "8px 16px", background: "#2563eb", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}
            >
              Edit
            </button>
            <button
              onClick={() => remove(it._id, it.title)}
              style={{ padding: "8px 16px", background: "#ef4444", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default AdminResources;