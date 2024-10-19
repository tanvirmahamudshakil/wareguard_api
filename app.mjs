// const express = require("express");

import express from 'express';
import { ServerConfiger, ClientConfigure, ServerRun, ClientRun, serverDown, journalctl, NewClient } from "./Wireguard/wireguard.mjs"




const app = express();



app.get("/server", async (req, res) => {
    var d = await ServerConfiger()
    res.status(200).send(d);
});

app.get("/client", async (req, res) => {
    var d = await ClientConfigure()
    res.status(200).send(d);
});

app.get("/wireguard_setup", async (req, res) => {
    journalctl()
    res.status(200).send({ "message": "successfull" });
});
app.get("/run", async (req, res) => {
    // await ServerConfiger()
    // await ClientConfigure()
    ServerRun()

    res.status(200).send({ "message": "successfull" });
});


app.get("/new_client", async (req, res) => {
    // await ServerConfiger()
    // await ClientConfigure()
    NewClient(req, res)

    // res.status(200).send({ "message": "successfull" });
});



export default app;