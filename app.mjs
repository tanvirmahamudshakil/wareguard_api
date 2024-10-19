// const express = require("express");

import express from 'express';
import { ServerConfiger, ClientConfigure, ServerRun, ClientRun, serverDown } from "./Wireguard/wireguard.mjs"




const app = express();





app.get("/wireguard", async (req, res) => {
    await ServerConfiger()
    await ClientConfigure()
    ServerRun()
    res.status(200).send({ "message": "successfull" });
});



export default app;