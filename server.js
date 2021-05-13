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

app.post("/host-asy", upload.any(), (req, res) => {
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
        let extension = stderr.includes("htmltosvg") ? ".svg" : ".html";
        fs.rename(
          dest + "/" + main.replace(".asy", "") + extension,
          "client/asy/" + id + extension,
          (err) => {
            console.log("test");
            if (err) {
              console.log(err);
              res.json({ success: false, error: err.message, path: null });
            } else if (req.body.asy_em === "false" || extension === ".svg") {
              res.json({
                success: true,
                path: "https://asymphost.xyz/asy/" + id + extension,
                error: null,
              });
            }
          }
        );

        fs.rmdir(dest, { recursive: true }, (err) => {
          if (err) {
            console.log(err);
          }
        });
        if (req.body.asy_del) {
          setTimeout(() => {
            fs.unlink("./client/asy/" + id + extension, (err) => {
              if (err) {
                console.log(err);
              }
            });
          }, 3600000);
        }

        if (req.body.asy_em === "true" && extension !== ".svg") {
          fs.readFile("./client/asy/" + id + extension, "utf8", (err, data) => {
            if (err) {
              console.log(err);
              res.json({ success: false, error: err.message, path: null });
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
                  res.json({ success: false, error: err.message, path: null });
                } else {
                  res.json({
                    success: true,
                    path: "https://asymphost.xyz/asy/" + id + extension,
                    error: null,
                  });
                }
              }
            );
          });
        }
      }
    }
  );
});
