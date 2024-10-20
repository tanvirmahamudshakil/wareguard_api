// const express = require("express");

import express from 'express';
import {
    NewServerCreate, ServerRun, ClientRun, serverDown, journalctl, NewClientCreate, serverConf,
    clientConf
} from "./Wireguard/wireguard.mjs"




const app = express();


app.get("/route", async (req, res) => {

    res.status(200).send(req.query.userid);
});


app.get("/new_server", async (req, res) => {
    var d = await NewServerCreate()
    res.status(200).send(d);
});

app.get("/client", async (req, res) => {
    var d = await clientConf()
    res.status(200).send(d);
});

app.get("/server", async (req, res) => {
    var d = await serverConf()
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

app.get("/stop", async (req, res) => {
    // await ServerConfiger()
    // await ClientConfigure()
    serverDown()

    res.status(200).send({ "message": "successfull" });
});


app.get("/new_client", async (req, res) => {
    // await ServerConfiger()
    // await ClientConfigure()
    NewClientCreate(req, res)

    // res.status(200).send({ "message": "successfull" });
});



export default app;