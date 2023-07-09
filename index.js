import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import fs, { lutimes } from "fs";
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
import MaterialRoute from "./components/Material/Material.route.js";
import TopicRoute from "./components/Topic/Topic.route.js";
import CourseRoute from "./components/Course/Course.route.js";
import MaterialStatisticRoute from "./components/MaterialStatistic/MaterialStatistic.route.js";

import FormData from "form-data";
import multer from "multer";
import * as MaterialService from "./components/Material/Material.service.js";

import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: false }));

let authTokenAdmin = "";
let userIdAdmin = "";
let dateGetAuth = null;
var HALF_HOUR = 30 * 60 * 1000; /* ms */

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

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Private-Network", "true");
  res.setHeader("Access-Control-Request-Private-Network", "true");
  next();
});

const getAuthInfo = app.use((req, res, next) => {
  next();
});

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

app.post("/getInfor", async function (req, res) {
  let currentAccount = {
    username: "",
    password: "",
    email: "",
    role: "",
    roomId: "",
    id: "",
    authToken: "",
  };

  // let authTokenAdmin = "";
  // let userIdAdmin = "";
  console.log(authTokenAdmin)

  currentAccount.username = req.body.username.replaceAll("%20", "");
  currentAccount.password = process.env.PASSWORD_USER;
  currentAccount.roomId = req.body.roomId;
  currentAccount.role = req.body.role;
  currentAccount.email = req.body.email;

  if (currentAccount.role === "tutor") currentAccount.role = "teacher";
  if(dateGetAuth === null || new Date() - dateGetAuth > HALF_HOUR){
  await axios
    .post("https://chat3.virtedy.com/api/v1/login", {
      username: process.env.USER_ADMIN,
      password: process.env.PASSWORD_ADMIN,
    })
    .then(async function (responseMain) {
      authTokenAdmin = responseMain.data.data.authToken;
      userIdAdmin = responseMain.data.data.userId;
      dateGetAuth = new Date();
    })
    .catch(function () {
      console.log("AUTH FAIL");
      //res.sendStatus(401);
    });
  }

  //=========================================== Check room exist ======================================
  await axios
    .get(`https://chat3.virtedy.com/api/v1/channels.list`, {
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
            "https://chat3.virtedy.com/api/v1/channels.create",
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
      console.log("channel FAIL");
      //res.sendStatus(401);
    });

  // ===================================== Check user exsit =========================================

  await axios
    .get(`https://chat3.virtedy.com/api/v1/users.list`, {
      headers: {
        "X-Auth-Token": authTokenAdmin,
        "X-User-Id": userIdAdmin,
      },
    })
    .then(async function (response) {
      const listUser = response.data.users;
      let dataCheck = null;
      console.log("Check user");

      //async function checkUser() {
      for (let i = 0; i < listUser.length; i++) {
        if (listUser[i].username === currentAccount.username) {
          await axios
            .post("https://chat3.virtedy.com/api/v1/login", {
              username: currentAccount.username,
              password: currentAccount.password,
            })
            .then(async function (response) {
              if (response.data.status === "success") {
                currentAccount.authToken = response.data.data.authToken;
                currentAccount.id = response.data.data.userId;
                await axios.post(
                  `https://chat3.virtedy.com/api/v1/chat.postMessage`,
                  {
                    channel: `${currentAccount.roomId}`,
                    alias: " ",
                    emoji: ":none:",
                    text: `**${currentAccount.username}** online`,
                  },
                  {
                    headers: {
                      "X-Auth-Token": authTokenAdmin,
                      "X-User-Id": userIdAdmin,
                    },
                  }
                );
                res.json(currentAccount);
              }
            });
          break;
        }

        //console.log(listUser[i]);
        else {
          if (listUser[i].emails[0].address === currentAccount.email) {
            //console.log("Checking email " + listUser[i].emails[0].address);
            await axios
              .post(
                `https://chat3.virtedy.com/api/v1/users.update`,
                {
                  userId: listUser[i]._id,
                  data: {
                    name: currentAccount.username,
                    username: currentAccount.username,
                  },
                },
                {
                  headers: {
                    "X-Auth-Token": authTokenAdmin,
                    "X-User-Id": userIdAdmin,
                  },
                }
              )
              .then(async function (response) {
                //console.log(response.data);
                await axios
                  .post("https://chat3.virtedy.com/api/v1/login", {
                    username: currentAccount.username,
                    password: currentAccount.password,
                  })
                  .then(async function (response) {
                    if (response.data.status === "success") {
                      currentAccount.authToken = response.data.data.authToken;
                      currentAccount.id = response.data.data.userId;
                      await axios.post(
                        `https://chat3.virtedy.com/api/v1/chat.postMessage`,
                        {
                          channel: `${currentAccount.roomId}`,
                          alias: " ",
                          emoji: ":none:",
                          text: `**${currentAccount.username}** online`,
                        },
                        {
                          headers: {
                            "X-Auth-Token": authTokenAdmin,
                            "X-User-Id": userIdAdmin,
                          },
                        }
                      );
                      res.json(currentAccount);
                    }
                  });
              });
          }
        }
        console.log("Check no email or user");

        if (i === listUser.length - 1) {
          await axios
            .post("https://chat3.virtedy.com/api/v1/users.register", {
              username: currentAccount.username,
              pass: currentAccount.password,
              name: currentAccount.username,
              email: currentAccount.email,
            })
            .then(async function (response) {
              await axios
                .post("https://chat3.virtedy.com/api/v1/login", {
                  username: currentAccount.username,
                  password: currentAccount.password,
                })
                .then(async function (response) {
                  if (response.data.status === "success") {
                    currentAccount.authToken = response.data.data.authToken;
                    currentAccount.id = response.data.data.userId;
                    await axios.post(
                      `https://chat3.virtedy.com/api/v1/chat.postMessage`,
                      {
                        channel: `${currentAccount.roomId}`,
                        alias: " ",
                        emoji: ":none:",
                        text: `**${currentAccount.username}** online`,
                      },
                      {
                        headers: {
                          "X-Auth-Token": authTokenAdmin,
                          "X-User-Id": userIdAdmin,
                        },
                      }
                    );
                    res.json(currentAccount);
                  }
                });
            });
        }
      }
      dataCheck = false;
    })
    .catch(function (e) {
      console.log("Checking user FAIL " + e);
      //res.sendStatus(401);
    });
  // })
  // .catch(function () {
  //   console.log("AUTH FAIL");
  //   //res.sendStatus(401);
  // });
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
      //res.sendStatus(401);
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
app.use("/materialstatistic", MaterialStatisticRoute);


//================Upload PDF===================
app.post("/uploadPdf", upload.single("file"), async function (req, res) {
  const teacherID = req.query.teacherID;
  let fileName = req.file.filename;
  const data = fs.readFileSync(`${__dirname}/uploads/${fileName}`);

  axios({
    method: "post",
    url: "https://pdfserver.virtedy.com/api/documents",
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
