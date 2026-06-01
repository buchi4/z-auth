const express = require("express");
const zauth = require("./index");

const app = express();
app.use(zauth());

app.get("/", (req, res) => {
    res.json({ message: "z-auth test server running!" });
});

app.listen(3000, () => {
    console.log("Test server running on http://localhost:3000");
});