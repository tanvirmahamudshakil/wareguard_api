// const express = require("express");

import express from 'express';
import { config1 } from "./Wireguard/wireguard.mjs"




const app = express();





app.get("/header", async (req, res) => {

    var data = await config1.generateKeys()
    config1.wgInterface.name = 'tanvir'
    config1.wgInterface.dns = ['1.1.1.1']
    config1.writeToFile()

    // but make sure you restart the interface for your changes to take effect
    await config1.restart()

    res.status(200).send(config1.toJson());
});



export default app;