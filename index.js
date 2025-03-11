const http = require('http');
require("dotenv").config();
const connectMangoDb = require("./config/db");
const { register, login } = require("./controllers/authControllers");
const User = require("./models/userModel");
const jwt = require("jsonwebtoken");

connectMangoDb();
http.createServer((req, res) => 
{
    if(req.method === "POST" && req.url === "/register")
    {
        register(req, res);
    }
    else if(req.method === "POST" && req.url === "/login")
        {
            login(req, res);
        }
        else {
            res.writeHead(404, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Route not found" }));
        }
}).listen(process.env.PORT);