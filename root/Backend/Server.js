const express = require("express");

const app = express();

//Middleware
//Use ????
app.use(express.static("src"));
app.use(express.json());

app.get("/", (req, res) => {});

app.post("/", (req, res) => {
  console.log(req.body);
});
//Use dotenv file for port
app.listen(8888, () => console.log("Server is Running"));
