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

  app.post("/api/users/walikelas", [authJwt.verifyToken, authJwt.isSuperAdmin], controller.createUserWaliKelas);
  app.put("/api/users/walikelas/:id", [authJwt.verifyToken, authJwt.isSuperAdmin], controller.editUserWaliKelas);
  app.delete("/api/users/walikelas/:id", [authJwt.verifyToken, authJwt.isSuperAdmin], controller.deleteUserWaliKelas);
  app.get("/api/users/walikelas", [authJwt.verifyToken, authJwt.isSuperAdmin], controller.getAllWaliKelas);

  app.post("/api/users/admin", [authJwt.verifyToken, authJwt.isSuperAdmin], controller.createAdminUser);
  app.get("/api/users/admin", [authJwt.verifyToken, authJwt.isSuperAdmin], controller.getAllAdminUsers);
  app.delete("/api/users/admin/:id", [authJwt.verifyToken, authJwt.isSuperAdmin], controller.deleteAdminUser);

};