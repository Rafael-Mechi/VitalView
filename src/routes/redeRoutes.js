var express = require("express");
var router = express.Router();

var redeController = require("../controllers/redeController");

router.get("/listar/:idHospital", function (req, res) {
    redeController.listarServidoresPorHospital(req, res);
});

// Buscar dados de rede no bucket para um servidor

router.get("/limites/:idServidor", function (req, res) {
    redeController.buscarLimites(req, res);
});

router.get("/dados", function (req, res) {
    redeController.buscarDadosRede(req, res);
});

module.exports = router;
