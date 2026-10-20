const mongoose = require("mongoose");
const Job = require("../models/Job");

exports.getJobs = async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createJob = async (req, res) => {
  try {
    const { title, organization, lastDate, eligibility, link } = req.body;

    if (!title || !organization || !lastDate) {
      return res
        .status(400)
        .json({ message: "Title, organization and last date are required" });
    }
    if (link && !/^https?:\/\//i.test(link)) {
      return res.status(400).json({ message: "Link must start with http:// or https://" });
    }

    const job = await Job.create({
      title: title.trim(),
      organization: organization.trim(),
      lastDate,
      eligibility: eligibility || "",
      link: link || "",
    });
    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteJob = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid job id" });
    }
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    res.json({ message: "Job deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};