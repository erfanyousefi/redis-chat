const express = require("express");
const app = express();
const http = require("http");
const SocketIO = require("socket.io");
const {createClient} = require("redis");
const redisClient = createClient();
app.set("view engine", "ejs");
const server = http.createServer(app);
const PORT = 4001;
const io = SocketIO(server, {cors: {origin:"*"}});
async function sendMessages(socket){
    redisClient.lrange("messages", 0, -1, (err, data) => {
        data.map(item => {
            const [username, message] = item.split(":");
            socket.emit("message", {
                username, message
            })
        })
    })
}
io.on("connection", async socket => {
    sendMessages(socket)
    socket.on("message",async ({username, message}) => {
        redisClient.rpush("messages", `${username}:${message}`)
        io.emit("message", {username, message})
    })
})
app.get("/", (req, res) => {
    res.render("login")
})
app.get("/chat", (req, res) => {
    const {username} = req.query;
    res.render("chat", {username})
})
server.listen(PORT, () => {
    console.log(`Server Run At ${PORT}`);
})