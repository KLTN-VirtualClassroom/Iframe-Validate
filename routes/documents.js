var express = require("express");
var router = express.Router();
var fs = require("fs");
var path = require("path");
var jwt = require("jsonwebtoken");
var jwtKey = fs.readFileSync(
  path.resolve(__dirname, "../config/pspdfkit/jwt.pem")
);

router.get("/:role/:documentId", function (req, res, next) {
  var jwt = prepareJwt(req.params.documentId, req.params.role);
  //res.render("documents/show", { documentId: req.params.documentId });
  res.render("documents/show", { documentId: req.params.documentId, jwt: jwt });
  // res.render("documents/show", { documentId: "7KPS6DAGK0ED6BJBX6JE4SRPFT" });
});

var prepareJwt = function (documentId, role) {
  var claims = {};
  console.log(role)
  if (role === "teacher") {
    claims = {
      document_id: documentId,
      permissions: ["read-document", "write", "download"],
      user_id: role,
    };
  } 
  
  if (role === "student-allow-edit") {
    claims = {
      document_id: documentId,
      permissions: ["read-document", "write", "download"],
      user_id: role,
    };
  }
  
  if (role === "student") {
    claims = {
      document_id: documentId,
      permissions: ["read-document","download"],
      user_id: role,
    };
  }

  return jwt.sign(claims, jwtKey, {
    algorithm: "RS256",
    expiresIn: 3 * 24 * 60 * 60, // 3 days
  });
};

module.exports = router;
