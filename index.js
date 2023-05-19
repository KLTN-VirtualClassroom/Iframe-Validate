import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import fs from "fs";
import * as dotenv from "dotenv";
dotenv.config();
const app = express();
import cors from "cors";
import http, { createServer } from "http";
import { corsData } from "./utils/corsLink.js";
import { socketData } from "./utils/socketLink.js";
import { Server } from "socket.io";
import socketMng from "./listeners/sockets.js";
import session from "express-session";
import mongoose from "mongoose";
import UserModel from "./components/model/User.model.js";
import UserRoute from "./components/User/User.route.js";
//import fileUpload from "express-fileupload"
import MaterialRoute from "./components/Material/Material.route.js";
import TopicRoute from "./components/Topic/Topic.route.js";
import CourseRoute from "./components/Course/Course.route.js";
import FormData from "form-data";
import multer from "multer";
import * as MaterialService from "./components/Material/Material.service.js";

import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(express.json({limit: '50mb'}))
// app.use(express.urlencoded({limit: '50mb'}))
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: false }));

//const upload = multer({ dest: "uploads/" });
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

var upload = multer({ storage: storage });

var whitelist = corsData;

var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

// var authToken = "";
// var pdfInfo = {
//   pdfStatus: 0,
//   pdfId: "",
// };
// var current_student_permission = "";
// var zoom_pdf = 1;
// var scroll_position = {
//   ratioX: null,
//   ratioY: null,
// };

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Private-Network", "true");
  res.setHeader("Access-Control-Request-Private-Network", "true");
  next();
});

const getAuthInfo = app.use((req, res, next) => {next()});

app.use(cors(corsOptions));
app.set("trust proxy", 1); // trust first proxy

app.use(
  session({
    secret: "SECRET_KEY",
    resave: false,
    saveUninitialized: true,
    cookie: {
      // secure: false
    },
  })
);

// app.use((req, res, next) => {
//   res.set("Access-Control-Allow-Origin", "http://localhost:3000"); // this is the rocket.chat URL
//   res.set("Access-Control-Allow-Credentials", "true");

//   next();
// });

app.post("/getInfor", async function (req, res) {
  console.log("hello");

  let currentAccount = {
    username: "",
    password: "",
    role: "",
    roomId: "",
    id: "",
    authToken: "",
  };

  let authTokenAdmin = "";
  let userIdAdmin = "";

  const roomId = req.body.roomId;
  let role = req.body.role;
  if (role === "tutor") role = "teacher";

  currentAccount.username = req.body.username;
  currentAccount.password = "12345678";
  currentAccount.roomId = roomId;
  currentAccount.role = role;

  if (currentAccount.role === "tutor") currentAccount.role = "teacher";

  await axios
    .post("https://chat.kltnvirtualclassroom.online/api/v1/login", {
      username: "nghianguyen",
      password: "12345678",
    })
    .then(async function (responseMain) {
      authTokenAdmin = responseMain.data.data.authToken;
      userIdAdmin = responseMain.data.data.userId;
      console.log(userIdAdmin);
  // })
  // .catch(function () {
  //   res.sendStatus(401);
  // });

  // ===================================== Check user exsit =========================================

  await axios
    .get(`https://chat.kltnvirtualclassroom.online/api/v1/users.list`, {
      headers: {
        "X-Auth-Token": authTokenAdmin,
        "X-User-Id": userIdAdmin,
      },
    })
    .then(async function (response) {
      const data = response.data.users.find((element) => {
        if (element.username === currentAccount.username) return true;
        return false;
      });
      if (data) {
        await axios
          .post("https://chat.kltnvirtualclassroom.online/api/v1/login", {
            username: currentAccount.username,
            password: currentAccount.password,
          })
          .then(async function (response) {
            if (response.data.status === "success") {
              currentAccount.authToken = response.data.data.authToken;
              currentAccount.id = response.data.data.userId;
              res.json(currentAccount);
            }
          });
      } else {
        await axios
          .post(
            "https://chat.kltnvirtualclassroom.online/api/v1/users.register",
            {
              username: currentAccount.username,
              pass: currentAccount.password,
              name: currentAccount.username,
              email: "lol1olo@gmail.com",
            }
          )
          .then(async function (response) {
            await axios
              .post("https://chat.kltnvirtualclassroom.online/api/v1/login", {
                username: currentAccount.username,
                password: currentAccount.password,
              })
              .then(async function (response) {
                if (response.data.status === "success") {
                  currentAccount.authToken = response.data.data.authToken;
                  currentAccount.id = response.data.data.userId;
                  res.json(currentAccount);
                }
              });
          });
      }
    })
    .catch(function () {
      console.log("user FAIL")
      res.sendStatus(401);
    });

  //=========================================== Check room exist ======================================
  await axios
    .get(`https://chat.kltnvirtualclassroom.online/api/v1/channels.list`, {
      headers: {
        "X-Auth-Token": authTokenAdmin,
        "X-User-Id": userIdAdmin,
      },
    })
    .then(async function (response) {
      const data = response.data.channels.find((element) => {
        if (element.fname === currentAccount.roomId) return true;
        return false;
      });
      if (!data) {
        await axios
          .post(
            "https://chat.kltnvirtualclassroom.online/api/v1/channels.create",
            {
              name: currentAccount.roomId,
            },
            {
              headers: {
                "X-Auth-Token": authTokenAdmin,
                "X-User-Id": userIdAdmin,
              },
            }
          )
          .then(async function (response) {
            console.log(response.data);
          });
      }
    })
    .catch(function () {
      console.log("channel FAIL")
      res.sendStatus(401);
    });
  })
  .catch(function () {
    console.log("AUTH FAIL")
    res.sendStatus(401);
  });
});

app.get("/currentInfor", function (req, res) {
  //console.log(currentAccount);
  res.json(currentAccount);
});

// this is the endpoint configured as API URL
app.post("/sso", function (req, res) {
  console.log(
    "sso: " + currentAccount.username + " " + currentAccount.password
  );

  // otherwise create a rocket.chat session using rocket.chat's API
  axios
    .post("https://chatvirtual.click/api/v1/login", {
      username: currentAccount.username,
      password: currentAccount.password,
    })
    .then(function (response) {
      if (response.data.status === "success") {
        res.json({
          loginToken: response.data.data.authToken,
        });
      }
    })
    .catch(function () {
      res.sendStatus(401);
    });
});

// just render the form for the user authenticate with us
app.get("/login", function (req, res) {
  res.set("Content-Type", "text/html");
  fs.createReadStream("login.html").pipe(res);
});

app.get("/home", function (req, res) {
  res.set("Content-Type", "text/html");
  fs.createReadStream("home.html").pipe(res);
});

// receives login information
app.post("/login", function (req, res) {
  // currentAccount.username = req.body.username;
  // currentAccount.password = req.body.password;
  console.log("user: " + currentAccount.username);
  axios
    .post("https://chatvirtual.click/api/v1/login", {
      username: currentAccount.username,
      password: currentAccount.password,
    })
    .then(function (response) {
      if (response.data.status === "success") {
        // since this endpoint is loaded within the iframe, we need to communicate back to rocket.chat using `postMessage` API
        //         res.send(`

        //         <!DOCTYPE html>
        // <html lang="en">
        // <head>
        //     <meta charset="UTF-8">
        //     <meta http-equiv="X-UA-Compatible" content="IE=edge">
        //     <meta name="viewport" content="width=device-width, initial-scale=1.0">
        //     <title>Document</title>
        //     <style>
        //         iframe{
        //             height: 93vh !important
        //         }
        //     </style>
        // </head>
        // <body style="text-align: center;">
        //     <iframe src="http://localhost:3000/channel/general" title="myframe"></iframe>
        // </body>
        //         <script>
        //         document.querySelector('iframe').contentWindow.postMessage({
        //  event: 'login-with-token',
        //  loginToken: '${response.data.data.authToken}'
        //  }, '*');
        //  </script>
        //  </html>`);

        //------------
        //         res.set("Content-Type", "text/html");
        //         res.send(`

        // <script>
        // document.querySelector('iframe').contentWindow.postMessage({
        // event: 'login-with-token',
        // loginToken: '${response.data.data.authToken}'
        // }, '*');
        // </script>`);
        res.sendStatus(200);
      }
    })
    .catch(function () {
      res.sendStatus(401);
    });
});

//===============route=============
app.use("/user", UserRoute);
app.use("/material", MaterialRoute);
app.use("/topic", TopicRoute);
app.use("/course", CourseRoute);

//================Upload PDF===================
app.post("/uploadPdf", upload.single("file"), async function (req, res) {
  const teacherID = req.query.teacherID;
  let fileName = req.file.filename;
  const data = fs.readFileSync(`${__dirname}/uploads/${fileName}`);

  axios({
    method: "post",
    url: "https://pdfserver.kltnvirtualclassroom.online/api/documents",
    data: data,
    headers: {
      "Content-Type": "application/pdf",
      Authorization: "Token token=secret",
    },
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
  })
    .then(async function (response) {
      const fileInfo = response.data.data;
      const fileTitle = fileName.split(".")[0];
      const fileUploaded = {
        fileId: fileInfo.document_id,
        fileName: fileTitle,
        teacherID,
        topic: "personal",
      };

      const payload = await MaterialService.uploadMaterial(fileUploaded);
      fs.unlinkSync(`./uploads/${fileName}`);
      res.json(payload);
    })
    .catch(function (e) {
      console.log(e.message);
      res.sendStatus(400);
    });
});

//========MONGOOSE==========
mongoose.set("strictQuery", false);

mongoose
  .connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Database connected");
  })
  .catch((error) => {
    console.log(error);
    //process.exit(1);
  });

//=========SOCKET============
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: socketData,
  },
});
var socketsManager = socketMng(io);

httpServer.listen(3030, function () {
  console.log("App listening on port 3030!");
});
