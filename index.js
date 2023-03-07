import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import fs from "fs";
import * as dotenv from 'dotenv'
dotenv.config();
const app = express();
import cors from "cors";
import http, { createServer } from "http";
import {corsData}from "./utils/corsLink.js";
import {socketData} from "./utils/socketLink.js";
import { Server } from "socket.io";
import socketMng from "./listeners/sockets.js";
import session from "express-session";
import mongoose from "mongoose";
import UserRoute from './components/User/User.route.js'
import UserModel from "./components/model/User.model.js";
import multer from "multer";
import fileUpload from "express-fileupload"


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now())
  }
})
 
var upload = multer({ storage: storage })

var currentAccount = {
  username: "",
  password: "",
  role: "",
  roomId: ""
};

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

var pdfInfo = {
  pdfStatus: 0,
  pdfId: "",
};

var current_student_permission = "";
var zoom_pdf = 1;
var scroll_position = {
  ratioX: null,
  ratioY: null,
};

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Private-Network", "true");
  res.setHeader("Access-Control-Request-Private-Network", "true");
  next();
});

//app.use(cors(corsOptions));
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

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Credentials", true);
  res.header("Access-Control-Allow-Origin", req.headers.origin);
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  res.header(
    "Access-Control-Allow-Headers",
    "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept"
  );
  if ("OPTIONS" == req.method) {
    res.send(200);
  } else {
    next();
  }
});

// app.use((req, res, next) => {
//   res.set("Access-Control-Allow-Origin", "http://localhost:3000"); // this is the rocket.chat URL
//   res.set("Access-Control-Allow-Credentials", "true");

//   next();
// });

app.post("/getInfor", async function (req, res) {
  
  const result = await UserModel.find({username: req.body.username, password: req.body.password})
  if(result){
    const userInfo = result[0];
    console.log(result)
    currentAccount.username = userInfo.username;
    currentAccount.password = userInfo.password;
    currentAccount.role = userInfo.role;
    currentAccount.roomId = userInfo.roomId;

    res.sendStatus(201);
  }
  else 
    return res.sendStatus(401);
});

app.post("/uploadPdf", fileUpload({createParentPath: true}), function (req, res) {
  const files = req.files;
  console.log(files)
  res.sendStatus(201);

});

app.get("/currentInfor", function (req, res) {
  res.json(currentAccount);
});

// this is the endpoint configured as API URL
app.post("/sso", function (req, res) {
  console.log(
    "sso: " + currentAccount.username + " " + currentAccount.password
  );
  const currentAccountSSO = {username: currentAccount.username, password: currentAccount.password}

  // otherwise create a rocket.chat session using rocket.chat's API
  axios
    //.post("http://localhost:3000/api/v1/login", currentAccount)
    .post("http://115.78.232.219:3122/api/v1/login", {username: currentAccount.username, password: currentAccount.password})
    .then(function (response) {
      console.log("Check complete")
      if (response.data.status === "success") {
        res.json({
          loginToken: response.data.data.authToken,
        });
      }
    })
    .catch(function () {
      console.log("SSO failed")
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
  console.log("Login: " + currentAccount.username);
  axios
    //.post("http://localhost:3000/api/v1/login", currentAccount)
    .post("http://115.78.232.219:3122/api/v1/login", {username: currentAccount.username, password: currentAccount.password})
    .then(function (response) {
      if (response.data.status === "success") {
        // since this endpoint is loaded within the iframe, we need to communicate back to rocket.chat using `postMessage` API
        res.set("Content-Type", "text/html");
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
        res.send(`
        
<script>
document.querySelector('iframe').contentWindow.postMessage({
event: 'login-with-token',
loginToken: '${response.data.data.authToken}'
}, '*');
</script>
</html>`);
      }
    })
    .catch(function () {
      res.sendStatus(401);
    });
});


//===============route=============
app.use('/user', UserRoute)

//========MONGOOSE==========
mongoose.set("strictQuery", false);

mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(()=> {
    console.log('Database connected');
  })
  .catch((error)=> {
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
