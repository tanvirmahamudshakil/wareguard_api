// const http = require("http");

import http from 'http'
// const app = require("./app.mjs");
import app from './app.mjs';

const port = 3002;

const server = http.createServer(app);
server.listen(port, () => {
    console.log(`connect ${port}`)
})
