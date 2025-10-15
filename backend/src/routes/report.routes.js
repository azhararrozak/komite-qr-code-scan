const { authJwt } = require("../middleware");
const controller = require("../controllers/report.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

    app.get("/api/reports/student/class", [authJwt.verifyToken], controller.generateRecapByClass);
    app.get("/api/reports/class/summary", [authJwt.verifyToken], controller.getStudentSummaryByClass);
    app.get("/api/reports/class/:className/students", [authJwt.verifyToken], controller.getStudentsByClass);
    app.get("/api/reports/statistics", [authJwt.verifyToken], controller.getGlobalStatistics);
};