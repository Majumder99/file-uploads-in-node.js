const express = require("express");
const path = require("path");
const crypto = require("crypto");
const mongoose = require("mongoose");
const multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage");
const Grid = require("gridfs-stream");
const methodOverride = require("method-override");
const bodyParser = require("body-parser");

const app = express();
//Middleware
app.use(bodyParser.json());
//this tells us that we are going to create a query string
app.use(methodOverride("_method"));
app.set("view engine", "ejs");

//mongo uri
const mongoURI =
  "mongodb+srv://root:root@cluster0.yizcs.mongodb.net/fileUploads";
//create connection
const conn = mongoose.createConnection(mongoURI);
//init gfs
let gfs;
conn.once("open", () => {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection("uploads");
});

//create storage engine
const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString("hex") + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: "uploads",
        };
        resolve(fileInfo);
      });
    });
  },
});
const upload = multer({ storage });

//@Route GET /
//@desc loads form
app.get("/", (req, res) => {
  res.render("index");
});

//@Route POST /upload
//@desc uploads file to db
app.post("/upload", upload.single("file"), (req, res) => {
  res.json({ file: req.file });
});

const port = 5000;
app.listen(port, () => {
  console.log(`Listen on ${port}`);
});
