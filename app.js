const express = require("express");


const app = express();


app.get("/header", async (req, res) => {
    res.status(200).send(req.headers);
});

module.exports = app;