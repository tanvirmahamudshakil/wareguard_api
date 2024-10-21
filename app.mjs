// const express = require("express");

import express from 'express';
import middle from "./middleware/auth.mjs";
import {
    NewServerCreate, ServerRun, ClientRun, serverDown, journalctl, NewClientCreate, serverConf,
    clientConf, getWireGuardPeers, singleClientProfile
} from "./Wireguard/wireguard.mjs"





const app = express();


app.get("/single-profile", middle, async (req, res) => {
    singleClientProfile(req, res)
});

app.get("/inactive-profile", middle, async (req, res) => {
    getWireGuardPeers(req, res)
});


app.get("/get-ip", middle, async (req, res) => {
    const host = req.get('host');
    res.status(200).send(host);
});


app.get("/route", middle, async (req, res) => {

    res.status(200).send(req.query.userid);
});


app.get("/new_server", middle, async (req, res) => {
    var d = await NewServerCreate()
    res.status(200).send(d);
});

app.get("/client", middle, async (req, res) => {
    var d = await clientConf()
    res.status(200).send(d);
});

app.get("/server", middle, async (req, res) => {
    var d = await serverConf()
    res.status(200).send(d);
});


app.get("/wireguard_setup", middle, async (req, res) => {
    journalctl()
    res.status(200).send({ "message": "successfull" });
});
app.get("/run", middle, async (req, res) => {
    // await ServerConfiger()
    // await ClientConfigure()
    ServerRun()

    res.status(200).send({ "message": "successfull" });
});

app.get("/stop", middle, async (req, res) => {
    // await ServerConfiger()
    // await ClientConfigure()
    serverDown()

    res.status(200).send({ "message": "successfull" });
});


app.get("/new_client", middle, async (req, res) => {
    // await ServerConfiger()
    // await ClientConfigure()
    NewClientCreate(req, res)

    // res.status(200).send({ "message": "successfull" });
});



export default app;