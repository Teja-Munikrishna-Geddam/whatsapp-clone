require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

/* 🔥 CORS MUST BE FIRST */
app.use(cors({
  origin: "https://teja-munikrishna-geddam.github.io"
}));

app.use(express.json());

/* 🔍 TEST ROUTE */
app.get("/", (req, res) => {
  res.send("Backend OK");
});

/* 🔐 LOGIN ROUTE */
app.post("/api/login", (req, res) => {
  res.json({ status: "login route reached" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
