var express = require("express");
var bodyParser = require("body-parser");
var axios = require("axios");
var fs = require("fs");
var app = express();
var cors = require("cors");
const http = require("http").createServer(app);

var io = require("socket.io")(http, {
  cors: {
    origin: "http://localhost:4200",
  },
});

const session = require("express-session");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var currentAccount = {
  username: "",
  password: "",
};
var whitelist = [
  "http://localhost:3000",
  "http://localhost:4200",
  "http://localhost:3001",
];

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


//var pdfStatus = 0;
var pdfInfo = {
  pdfStatus: 0,
  pdfId: "",
};

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.emit("get-pdf-status", pdfInfo);

  socket.on("pdf-status", (pobject) => {
    pdfStatus = pobject.status;
    pdfInfo = {
      pdfStatus,
      pdfId: pobject.pdfId,
    };

    console.log(pdfInfo);
    //socket.emit('pdf',pdf)
    io.emit("pdf", pdfInfo);

    // io.emit('')
  });

  socket.on("allowance", (role) => {
    // pdfStatus = pobject.status;
    // const pdf = {
    //   pdfStatus,
    //   filename: pobject.pdfId,
    // };

    console.log(role);
    //socket.emit('pdf',pdf)
    io.emit("set-role", role);

    // io.emit('')
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
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

// app.use((req, res, next) => {
//   res.set("Access-Control-Allow-Origin", "http://localhost:3000"); // this is the rocket.chat URL
//   res.set("Access-Control-Allow-Credentials", "true");

//   next();
// });

app.post("/getInfor", function (req, res) {
  // var session = req.session;
  // session.username = req.body.username;
  // session.password = req.body.password;
  //req.session.save();

  currentAccount.username = req.body.username;
  currentAccount.password = req.body.password;
  console.log("done " + req.body.username);

  res.sendStatus(201);
});

app.get("/currentInfor", function (req, res) {
  res.json({
    username: currentAccount.username,
  });
});

// this is the endpoint configured as API URL
app.post("/sso", function (req, res) {
  console.log("sso: " + currentAccount.username);

  // otherwise create a rocket.chat session using rocket.chat's API
  axios
    .post("http://localhost:3000/api/v1/login", currentAccount)
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
    .post("http://localhost:3000/api/v1/login", currentAccount)
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

http.listen(3030, function () {
  console.log("Example app listening on port 3030!");
});
