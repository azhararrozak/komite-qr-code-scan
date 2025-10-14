 const mongoose = require("mongoose");
 mongoose.Promise = global.Promise;

 const db = {};

 db.mongoose = mongoose;

 db.user = require("./user.model");
 db.role = require("./role.model");
 db.refreshToken = require("./refreshtoken.model"); 
 db.student = require("./student.model");
 db.payment = require("./payment.model");
 
 db.ROLES = ["user", "admin"];

 module.exports = db;
