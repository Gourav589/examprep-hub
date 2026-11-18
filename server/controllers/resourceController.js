const mongoose = require("mongoose");
const Resource = require("../models/Resource");

const clean = (v, max) => String(v ?? "").trim().slice(0, max);
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function build(body) {
  const type = body.type === "link" ? "link" : "note";
  const data = {
    title: clean(body.title, 120),
    category: clean(body.category, 40) || "General",
    type,
    description: clean(body.description, 300),
    url: "",
    content: "",
  };

  if (!data.title) return { error: "Title zaroori hai" };

  if (type === "link") {
    data.url = clean(body.url, 500);
    if (!/^https?:\/\//i.test(data.url)) {
      return { error: "Link http:// ya https:// se shuru hona chahiye" };
    }
  } else {
    data.content = clean(body.content, 8000);
    if (!data.content) return { error: "Note ka text likho" };
  }

  return { data };
}

exports.getResources = async (req, res) => {
  try {
    const filter = {};
    if (typeof req.query.category === "string" && req.query.category) {
      filter.category = req.query.category;
    }
    if (typeof req.query.q === "string" && req.query.q.trim()) {
      const rx = new RegExp(escapeRegex(req.query.q.trim().slice(0, 60)), "i");
      filter.$or = [{ title: rx }, { description: rx }];
    }

    const rows = await Resource.find(filter).sort({ createdAt: -1 }).limit(200);

    res.json(
      rows.map((r) => ({
        _id: r._id,
        title: r.title,
        category: r.category,
        type: r.type,
        url: r.url,
        description: r.description || r.content.slice(0, 160),
        createdAt: r.createdAt,
      }))
    );
  } catch (error) {
    res.status(500).json({ message: "Study material nahi mila" });
  }
};

exports.getResource = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid id" });
    }
    const r = await Resource.findById(req.params.id);
    if (!r) {
      return res.status(404).json({ message: "Material nahi mila" });
    }
    res.json(r);
  } catch (error) {
    res.status(500).json({ message: "Material nahi khul paya" });
  }
};

exports.createResource = async (req, res) => {
  try {
    const { data, error } = build(req.body);
    if (error) return res.status(400).json({ message: error });
    const created = await Resource.create(data);
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ message: "Material save nahi hua" });
  }
};

exports.updateResource = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid id" });
    }
    const { data, error } = build(req.body);
    if (error) return res.status(400).json({ message: error });

    const updated = await Resource.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!updated) return res.status(404).json({ message: "Material nahi mila" });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Material update nahi hua" });
  }
};

exports.deleteResource = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid id" });
    }
    const deleted = await Resource.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Material nahi mila" });
    res.json({ message: "Material hata diya gaya" });
  } catch (error) {
    res.status(500).json({ message: "Material nahi hata" });
  }
};