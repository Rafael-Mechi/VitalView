var express = require("express");
var router = express.Router();

var suporteMicroController = require("../controllers/suporteMicroController");

//Recebendo os dados do html e direcionando para a função cadastrar de usuarioController.js
router.get("/buscar-dados-banco/:idServidor", function (req, res) {
    suporteMicroController.buscarDadosServidores(req, res);
})

router.get("/buscar-dados-bucket/:key", function(req, res){
    suporteMicroController.pegarDadosBucket(req,res);
})

router.get("/buscar-servidores", function(req, res){
    suporteMicroController.buscarListaServidores(req,res);
})

router.get("/buscar-alertas-servidores/:idServidor", function(req, res){
    suporteMicroController.buscarAlertasServidores(req,res);
})

module.exports = router;