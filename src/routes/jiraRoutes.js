var express = require("express");
var router = express.Router();

var jiraController = require("../controllers/jiraController");

router.get(`/buscar-historico-alertas`, function (req, res){
        jiraController.buscarAlertas(req, res);
});

router.post(`/abrir-chamado-exclusao`, function (req, res){
        jiraController.abrirChamadoExclusao(req, res)
})

module.exports = router;