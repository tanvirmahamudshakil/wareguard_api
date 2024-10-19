// const express = require("express");

import express from 'express';
import { config1 } from "./Wireguard/wireguard.mjs"


const app = express();





app.get("/header", async (req, res) => {
    res.status(200).send(config1.toJson);
});



export default app;