const express = require('express');
const router = express.Router();

var dashboardAnalistaController = require('../controllers/dashboardAnalistaController');

router.get(`/top-alertas/:idHospital`, function (req, res) {
        dashboardAnalistaController.topServidoresComMaisAlertas(req, res);
});

router.get(`/distribuicao-alertas/:idHospital`, function (req, res) {
        dashboardAnalistaController.distribuicaoAlertasPorComponente(req, res);
});

router.get(`/quantidade-alertas/:idHospital`, function (req, res) {
        dashboardAnalistaController.contarAlertasNoPeriodo(req, res);
});

router.get(`/distribuicao-alertas-ano/:idHospital`, function (req, res) {
        dashboardAnalistaController.distribuicaoAlertasAno(req, res);
});

module.exports = router;