var express = require("express");
var router = express.Router();

var suporteMicroController = require("../controllers/suporteMicroController");

//Recebendo os dados do html e direcionando para a função cadastrar de usuarioController.js
router.get("/buscar-dados-banco/:idServidor", function (req, res) {
    suporteMicroController.buscarDadosServidores(req, res);
})

module.exports = router;