// const express = require("express");

import express from 'express';
import { ServerConfiger, ClientConfigure, ServerRun, ClientRun } from "./Wireguard/wireguard.mjs"




const app = express();





app.get("/header", async (req, res) => {

    await ServerConfiger()
    await ClientConfigure()
    // ServerRun()
    res.status(200).send({ "message": "successfull" });
});



export default app;