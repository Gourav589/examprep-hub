require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const res = await User.updateMany(
    { emailVerified: { $ne: true } },
    { $set: { emailVerified: true } }
  );
  console.log("Purane accounts verified mark hue:", res.modifiedCount);
  process.exit();
};

run();