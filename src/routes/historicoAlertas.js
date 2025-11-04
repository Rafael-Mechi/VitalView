var express = require("express");
var router = express.Router();

var historicoAlertasController = require("../controllers/historicoAlertasController");

router.get(`/buscar-historico-alertas/:idHospital`, function (req, res){
        historicoAlertasController.buscarAlertas(req, res);
});

module.exports = router;