const { authJwt } = require("../middleware");
const controller = require("../controllers/user.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post("/api/users/walikelas", [authJwt.verifyToken, authJwt.isAdmin], controller.createUserWaliKelas);
  app.put("/api/users/walikelas/:id", [authJwt.verifyToken, authJwt.isAdmin], controller.editUserWaliKelas);
  app.delete("/api/users/walikelas/:id", [authJwt.verifyToken, authJwt.isAdmin], controller.deleteUserWaliKelas);
  app.get("/api/users/walikelas", [authJwt.verifyToken, authJwt.isAdmin], controller.getAllWaliKelas);
   
};