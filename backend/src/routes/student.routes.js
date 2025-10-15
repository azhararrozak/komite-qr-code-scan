const { verifySignUp, authJwt } = require("../middleware");
const controller = require("../controllers/student.controller");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post(
    "/api/students",
    [verifySignUp.checkDuplicateNis, authJwt.verifyToken, authJwt.isAdmin],
    controller.createStudent
  );

  app.get("/api/students", [authJwt.verifyToken], controller.getAllStudents);
  app.get(
    "/api/students/:id",
    [authJwt.verifyToken],
    controller.getStudentById
  );

  app.put(
    "/api/students/:id",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.updateStudent
  );
  app.delete(
    "/api/students/:id",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.deleteStudent
  );

  //create with csv file
  // use upload middleware to accept a single file field named 'file'
  const upload = require("../middleware/upload");
  app.post(
    "/api/students/csv",
    [authJwt.verifyToken, authJwt.isAdmin, upload.single("file")],
    controller.createStudentsFromCsv
  );
};
