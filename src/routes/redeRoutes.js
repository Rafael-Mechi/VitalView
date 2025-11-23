var express = require("express");
var router = express.Router();

var redeController = require("../controllers/redeController");

// Buscar dados de rede no bucket para um servidor

router.get("/limites/:idServidor", function (req, res) {
    redeController.buscarLimites(req, res);
});

router.get("/dados/:hostname", function (req, res) {
    redeController.buscarDadosRede(req, res);
});

module.exports = router;
