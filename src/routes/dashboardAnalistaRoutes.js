const express = require("express");
const router = express.Router();
const dashboardAnalistaController = require("../controllers/dashboardAnalistaController");

router.get("/top-alertas/:idHospital", dashboardAnalistaController.topServidoresComMaisAlertas);
router.get("/distribuicao-alertas/:idHospital", dashboardAnalistaController.distribuicaoAlertasPorComponente);
router.get("/quantidade-alertas/:idHospital", dashboardAnalistaController.contarAlertasNoPeriodo);
router.get("/distribuicao-alertas-ano/:idHospital", dashboardAnalistaController.distribuicaoAlertasAno);

module.exports = router;