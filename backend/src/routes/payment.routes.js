const { authJwt } = require("../middleware");
const controller = require("../controllers/payment.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post("/api/payments", [authJwt.verifyToken], controller.createPayment);
  app.get("/api/payments", [authJwt.verifyToken], controller.getAllPayments);
  //edit payment
  app.put("/api/payments/:id", [authJwt.verifyToken], controller.editPayment);
  //delete payment
  app.delete(
    "/api/payments/:id",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.deletePayment
  );

};