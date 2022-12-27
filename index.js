// var express = require("express");
// var bodyParser = require("body-parser");
// var cookieSession = require("cookie-session");
// var axios = require("axios");
// var fs = require("fs");
// var app = express();
// const cors = require('cors');
// app.use(cors());

// var account2 ={
//   username: "NghiaNguyen",
//   password: "12345678"
// };

// app.set("trust proxy", 1); // trust first proxy
// app.use(
//   cookieSession({
//     name: "session",
//     keys: ["key1", "key2"],
//   })
// );

// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());

// // CORS in case you need
// app.use((req, res, next) => {
//   res.set("Access-Control-Allow-Origin", "*"); // this is the rocket.chat URL
//   res.set("Access-Control-Allow-Credentials", "true");

//   next();
// });

// // this is the endpoint configured as API URL
// app.post("/sso", cors(), function (req, res) {
//   var notLoggedIn = false;
//   if (notLoggedIn) {
//     return res.sendStatus(401);
//   }

//   var savedToken = null;
//   if (savedToken) {
//     return res.json({
//       token: savedToken,
//     });
//   }
//   // const account = {
//   //   username: req.session.username,
//   //   password: req.session.password,
//   // };
//   // if dont have the user created on rocket.chat end yet, you can now create it

//   // otherwise create a rocket.chat session using rocket.chat's API
//   console.log("sso: " + req.session.username);
//   axios
//     .post("http://localhost:3000/api/v1/login", account2)
//     .then(function (response) {
//       if (response.data.status === "success") {
//         res.json({
//           loginToken: response.data.data.authToken,
//         });
//       }
//     })
//     .catch(function () {
//       res.sendStatus(401);
//     });
// });

// // receives login information
// app.post("/login", function (req, res) {
//   // otherwise create a rocket.chat session using rocket.chat's API
//   const account = {
//     username: req.body.username,
//     password: req.body.password,
//   };
//   req.session.username = req.body.username;
//   req.session.password = req.body.password;

//   console.log(req.session.username+req.session.password);

//   axios
//     .post("http://localhost:3000/api/v1/login", account2)
//     .then(function (response) {
//       if (response.data.status === "success") {
//         // since this endpoint is loaded within the iframe, we need to communicate back to rocket.chat using `postMessage` API
//         // res.set("Content-Type", "text/html");
//         // res.send(`
//         // <!DOCTYPE html>
//         //   <html>
//         //     <head>
//         //       <meta charset="utf-8" />
//         //       <meta name="viewport" content="width=device-width,initial-scale=1" />
//         //       <title>Chat bot</title>
//         //       <style>
//         //         iframe {
//         //           height: 93vh !important;
//         //         }
//         //       </style>
//         //     </head>
//         //     <body>
//         //       <iframe
//         //         id="rc-chat"
//         //         title="chat"
//         //         width="100%"
//         //         height="500px"
//         //         src="http://localhost:3000/channel/Maleficent?layout=embedded"
//         //       ></iframe>
//         //     </body>
//         //           <script>
//         //           window.parent.postMessage({
//         //           event: 'login-with-token',
//         //           loginToken: '${response.data.data.authToken}'
//         //           }, 'http://localhost:3030');
//         //           </script>
//         // </html>`);
//         console.log( response.data.data.authToken)
//         res.json({
//           loginToken: response.data.data.authToken,
//         });
//       }
//     })
//     .catch(function () {
//       res.sendStatus(401);
//     });
// });

// // just render the form for the user authenticate with us
// // app.get("/login", function (req, res) {
// //   res.set("Content-Type", "text/html");
// //   fs.createReadStream("login.html").pipe(res);
// // });

// app.get("/home", function (req, res) {
//   res.set("Content-Type", "text/html");
//   fs.createReadStream("home.html").pipe(res);
// });

// app.listen(3030, function () {
//   console.log("Example app listening on port 3030!");
// });

//
//
var express = require("express");
var bodyParser = require("body-parser");
var axios = require("axios");
var fs = require("fs");
var app = express();
var cors = require("cors");
const session = require("express-session");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var whitelist = ["http://localhost:4200", "http://localhost:3000", "http://115.78.232.219:3122"];

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

var currentAccount = {
  username: "",
  password: ""
}

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


app.post("/getInfor", function (req, res) {
  var session = req.session;
  session.username = req.body.username;
  session.password = req.body.password;
  console.log("done"+ req.session.password)
  currentAccount.username = req.body.username
  currentAccount.password = req.body.password
  req.session.save();
  res.sendStatus(201);
});

// this is the endpoint configured as API URL
app.post("/sso", function (req, res) {
  
  // add your own app logic here to validate user session (check cookies, headers, etc)

  // if the user is not already logged in on your system, respond with a 401 status
  var notLoggedIn = false;
  if (notLoggedIn) {
    return res.sendStatus(401);
  }

  // you can save the token on your database as well, if so just return it
  // MongoDB - services.iframe.token
  var savedToken = null;
  if (savedToken) {
    return res.json({
      token: savedToken,
    });
  }
  console.log(currentAccount.username);

  // if dont have the user created on rocket.chat end yet, you can now create it
  var currentUsername = true;

  // otherwise create a rocket.chat session using rocket.chat's API
  axios
    .post("http://115.78.232.219:3122/api/v1/login", currentAccount)
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
  // do your own authentication process

  // after the user is authenticated we can proceed with authenticating him on rocket.chat side

  //
  //
  // the code below is exactly the same as the on /sso endpoint, except for its response
  // it was duplicated for understanding purpose
  // the authentication process and is a well-designed app =)
  //
  //

  // if dont have the user created on rocket.chat end yet, you can now create it
  const account = {
    username: "Hung",
    password: "12345678",
  };

  // otherwise create a rocket.chat session using rocket.chat's API
  axios
    .post("http://localhost:3000/api/v1/login", account)
    .then(function (response) {
      if (response.data.status === "success") {
        // since this endpoint is loaded within the iframe, we need to communicate back to rocket.chat using `postMessage` API
        res.set("Content-Type", "text/html");
        res.send(`<script>
 window.parent.postMessage({
 event: 'login-with-token',
 loginToken: '${response.data.data.authToken}'
 }, 'http://localhost:3000/channel/general');
 </script>`);
      }
    })
    .catch(function () {
      res.sendStatus(401);
    });
});

app.listen(3030, function () {
  console.log("Example app listening on port 3030!");
});
