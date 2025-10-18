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

  app.get(
    "/api/students",
    [authJwt.verifyToken], 
    controller.getAllStudents
  );
  app.get(
    "/api/students/list",
    [authJwt.verifyToken],
    controller.getAllStudentsList
  );
  app.get(
    "/api/students/classes",
    [authJwt.verifyToken],
    controller.getAvailableClasses
  );
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
    controller.createStudentsFromCSVWithQR
  );

  // Create students from CSV and generate QR codes
  // app.post(
  //   "/api/students/csv-with-qr",
  //   [authJwt.verifyToken, authJwt.isAdmin, upload.single("file")],
  //   controller.createStudentsFromCSVWithQR
  // );

  // Generate QR code for single student
  app.post(
    "/api/students/:id/generate-qr",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.generateStudentQR
  );

  // Get QR codes by class
  app.get(
    "/api/students/qr/class/:className",
    [authJwt.verifyToken],
    controller.getQRCodesByClass
  );

  // Download QR code file
  app.get(
    "/api/students/qr/download/:className/:fileName",
    [authJwt.verifyToken],
    controller.downloadQRCode
  );
};
