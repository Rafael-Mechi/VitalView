var express = require("express");
var router = express.Router();
var dashboardMacroController = require("../controllers/dashboardMacroController");

// Rota principal - Dashboard Macro
router.get("/dashboard-macro", dashboardMacroController.buscarDadosDashboard);

// Rota para buscar dados do bucket S3
router.get("/buscar-dados-bucket-macro/:key", dashboardMacroController.buscarDadosBucketMacro);


router.get("/dadosBucket", function(req, res){
    dashboardMacroController.listarArquivosBucket(req,res);
})

module.exports = router;