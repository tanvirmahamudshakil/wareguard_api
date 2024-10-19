// const express = require("express");

import express from 'express';
import { config1 } from "./Wireguard/wireguard.mjs"


const app = express();





app.get("/header", async (req, res) => {
    var data = await config1.generateKeys()
    res.status(200).send(data.publicKey);
});



export default app;