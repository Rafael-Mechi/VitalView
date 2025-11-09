var express = require("express");
var router = express.Router();

var dashboardMacroController = require("../controllers/dashboardMacroController");

router.get("/dashboard-macro", function (req, res) {
    dashboardMacroController.buscarDadosDashboard(req, res);
});

module.exports = router;