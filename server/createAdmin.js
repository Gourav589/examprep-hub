require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

const [name, email, password] = process.argv.slice(2);

const run = async () => {
  if (!name || !email || !password) {
    console.log('Use: node createAdmin.js "Name" email password');
    process.exit();
  }

  await mongoose.connect(process.env.MONGO_URI);
  const hashed = await bcrypt.hash(password, 10);

  let user = await User.findOne({ email: email.toLowerCase() });
  if (user) {
    user.role = "admin";
    user.password = hashed;
    await user.save();
    console.log(`Admin updated (password changed): ${user.email}`);
  } else {
    user = await User.create({ name, email, password: hashed, role: "admin" });
    console.log(`Admin created: ${user.email}`);
  }

  process.exit();
};

run();