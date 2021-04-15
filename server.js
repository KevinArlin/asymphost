const express = require("express");
const port = process.env.PORT || 3000;
const app = express();

const fs = require("fs");
const exec = require("child_process");

const cors = require("cors");
const http = require("http").createServer(app).listen(port);

app.use(cors());
app.use(express.json());
app.use(express.static("client"));

app.post("/host-asy", (req, res) => {});
