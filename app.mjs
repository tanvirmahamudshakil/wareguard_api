// const express = require("express");

import express from 'express';
import { config1 } from "./Wireguard/wireguard.mjs"


const app = express();





app.get("/header", async (req, res) => {
    var data = await config1.generateKeys()
    var config = await config1.writeToFile()

    // bring up
    await config1.up()
    res.status(200).send(config);
});



export default app;