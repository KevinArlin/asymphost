const express = require("express");
const port = process.env.PORT || 3000;
const app = express();

const fs = require("fs");
const uuid = require("uuid");
const { exec } = require("child_process");

const cors = require("cors");
const multer = require("multer");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dest = "./files/" + req.body.id;
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest);
    }
    return cb(null, dest);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });
const http = require("http").createServer(app).listen(port);

app.use(cors());
app.use(express.json());
app.use(express.static("client"));

app.post("/host-asy-files", upload.any(), (req, res) => {
  const dest = "./files/" + req.body.id;
  const id = uuid.v4();
  const main = req.body.main ? req.body.main : req.files[0].originalname;

  exec(
    "asy -f html -safe -offline " + main,
    {
      cwd: dest,
    },
    (error, stdout, stderr) => {
      if (error) {
        console.log(error);
        res.json({ success: false, error: error.message, path: null });
      } else {
        let error_out = null;
        let extension = stderr.includes("htmltosvg") ? ".svg" : ".html";
        fs.rename(
          dest + "/" + main.replace(".asy", "") + extension,
          "client/asy/" + id + extension,
          (err) => {
            if (err) {
              console.log(err);
              error_out = err.message;
            }
          }
        );
        fs.rmdirSync(dest, { recursive: true });
        if (req.body.asy_del && error_out === null) {
          setTimeout(() => {
            fs.unlinkSync("./client/asy/" + id + extension);
          }, 3600000);
        }

        if (req.body.asy_em && extension !== ".svg" && error_out === null) {
          fs.readFile("./client/asy/" + id + extension, "utf8", (err, data) => {
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
          });
        }
        res.json({
          success: error_out === null,
          path: "https://asymphost.xyz/asy/" + id + extension,
          error: error_out,
        });
      }
    }
  );
});

app.post("/host-asy-text", upload.none(), (req, res) => {
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
          console.log(stdout, stderr);
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
