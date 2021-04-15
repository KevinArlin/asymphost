const express = require("express");
const port = process.env.PORT || 3000;
const app = express();

const fs = require("fs");
const uuid = require("uuid");
const { exec } = require("child_process");

const cors = require("cors");
const http = require("http").createServer(app).listen(port);

app.use(cors());
app.use(express.json());
app.use(express.static("client"));

app.post("/host-asy", (req, res) => {
  let id = uuid.v4();
  let filename = "files/" + id + ".asy";
  fs.closeSync(fs.openSync("./" + filename, "w"));
  fs.writeFile("./" + filename, req.body.asy, "utf-8", (err) => {
    if (err) {
      console.log(err);
      res.json({ success: false });
    } else {
      exec(
        "asy -f html -o client/asy/ " + filename,
        (error, stdout, stderr) => {
          if (error) {
            console.log(error);
            res.json({ success: false, error: error.message, path: null });
          } else {
            res.json({
              success: true,
              path: "https://asymphost.xyz/asy/" + id + ".html",
              error: null,
            });
          }
        }
      );
    }
  });
});
