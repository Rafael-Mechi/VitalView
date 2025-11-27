var express = require("express");
var router = express.Router();

var discoController = require("../controllers/discoController");

//Recebendo os dados do html e direcionando para a função cadastrar de usuarioController.js
router.get("/buscar-dados-banco/:idServidor", function (req, res) {
    discoController.buscarDadosServidores(req, res);
})

router.get("/buscar-dados-bucket/:key", function(req, res){
    discoController.pegarDadosBucket(req,res);
})

router.get("/buscar-servidores", function(req, res){
    discoController.buscarListaServidores(req,res);
})

// Rota específica para pegar dados de disco de um servidor
router.get("/buscar-dados-bucket-disco/:key", function (req, res) {
    discoController.pegarDadosDisco(req, res);
});



module.exports = router;