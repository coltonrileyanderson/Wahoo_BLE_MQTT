const express = require("express");
const path = require("path");

const app = express();

module.exports = app;

app.use(express.static(path.join(__dirname, '/')));
console.log(path.join(__dirname, '/'));
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "index.html"));
}); 