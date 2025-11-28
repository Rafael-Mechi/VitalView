const express = require("express");
const router = express.Router();
const dashboardAnalistaController = require("../controllers/dashboardAnalistaController");

router.get("/top-alertas/:idHospital", dashboardAnalistaController.topServidoresComMaisAlertas);
router.get("/distribuicao-alertas/:idHospital", dashboardAnalistaController.distribuicaoAlertasPorComponente);
router.get("/quantidade-alertas/:idHospital", dashboardAnalistaController.contarAlertasNoPeriodo);
router.get("/distribuicao-alertas-ano/:idHospital", dashboardAnalistaController.distribuicaoAlertasAno);
router.get("/dia-semana-mais-alertas/:idHospital", dashboardAnalistaController.diaSemanaComMaisAlertas);
router.get("/buscar-dados-bucket/:key", function(req, res){
    dashboardAnalistaController.pegarDadosBucket(req,res);
})
router.get("/buscar-servidores/:idHospital", function(req, res){
    dashboardAnalistaController.buscarServidores(req,res);
})


module.exports = router;