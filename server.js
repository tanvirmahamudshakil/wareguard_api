const http = require("http");
const app = require("./app.js");

const port = 3002;

const server = http.createServer(app);
server.listen(port, () => {
    console.log(`connect ${port}`)
})
