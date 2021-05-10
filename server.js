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

app.post("/host-asy-text", (req, res) => {
  let id = uuid.v4();
  let filename = "files/" + id + ".asy";
  fs.closeSync(fs.openSync("./" + filename, "w"));
  fs.writeFile("./" + filename, req.body.asy, "utf-8", (err) => {
    if (err) {
      console.log(err);
      res.json({ success: false });
    } else {
      exec(
        "asy -f html -safe -offline -o client/asy/ " + filename,
        (error, stdout, stderr) => {
          fs.unlinkSync("./" + filename);
          if (error) {
            console.log(error);
            res.json({ success: false, error: error.message, path: null });
          } else {
            let extension = stderr.includes("htmltosvg") ? ".svg" : ".html";
            if (req.body.asy_del) {
              setTimeout(() => {
                fs.unlinkSync("./client/asy/" + id + extension);
              }, 3600000);
            }
            let error_out = null;
            if (req.body.asy_em && extension !== ".svg") {
              fs.readFile(
                "./client/asy/" + id + extension,
                "utf8",
                (err, data) => {
                  if (err) {
                    console.log(err);
                    error_out = err.message;
                    return;
                  }
                  var result = data.replace(
                    /embedded=window.top.document!=document/g,
                    "embedded=true"
                  );

                  result = result.replace(/window.top.document/g, "document");

                  fs.writeFile(
                    "./client/asy/" + id + extension,
                    result,
                    "utf8",
                    (err) => {
                      if (err) {
                        console.log(err);
                        error_out = err.message;
                      }
                    }
                  );
                }
              );
            }
            res.json({
              success: error_out === null,
              path: "https://asymphost.xyz/asy/" + id + extension,
              error: error_out,
            });
          }
        }
      );
    }
  });
});
