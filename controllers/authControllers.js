const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const SECRET_KEY = "mytemporarykey123";

const register = async (req, res) => {
let body = "";
        req.on("data", chunk => {
            body += chunk.toString();
        });
        req.on("end", async () => {
        const { name, email, password } = JSON.parse(body);   
        try
        {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                res.writeHead(400, { "Content-Type": "application/json" });
                return res.end(JSON.stringify({ error: "User already exists. Please use a different email." }));
            }
            const hashedPassword = await bcrypt.hash(password, 10);     
            const newUser = await User.create({ name, email, password: hashedPassword });
            res.writeHead(200, { "Content-Type": "application/json" });  
            res.end(JSON.stringify({ message: "User registered successfully", user: newUser }));
        }
        catch(error)
        {
            if (error.code === 11000) {
                res.writeHead(400, { "Content-Type": "application/json" });
                return res.end(JSON.stringify({ error: "Email already exists. Please use a different email." }));
            }
            
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Server Error " }));
        }

    });
};

const login = async (req, res) => {
    let body = "";
    req.on("data", chunk => {
        body += chunk.toString();
    });
    req.on("end", async () => {
        try {
        const { email, password } = JSON.parse(body);
        const user = await User.findOne({email});
        if (!user || !user.password) {
            res.writeHead(400, { "Content-Type": "application/json" });
            return res.end(JSON.stringify({ error: "User not found" }));
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.writeHead(401, { "Content-Type": "application/json" });
            return res.end(JSON.stringify({ error: "Invalid credentials" }));
        }
        const token = jwt.sign({ email: user.email }, SECRET_KEY, { expiresIn: "1h" });
        res.writeHead(200, { "Content-Type": "application/json" });  
        res.end(JSON.stringify({ message: "Login successful", token }));
    }
    catch(err)
    {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: err?.message || "An unknown error occurred" })); // Improved error handling
    }
    });
}

module.exports = { register, login };