var express = require("express");
var router = express.Router();

var controleUsuariosController = require("../controllers/controleUsuariosController");

router.get(`/buscar-quantidade-de-usuarios/:idHospital`, function (req, res) {
        controleUsuariosController.buscarQtdUsuarios(req, res);
});

router.get(`/buscar-usuarios-do-sistema/:idHospital`, function (req, res) {
        controleUsuariosController.buscarUsuariosSistema(req, res);
});

router.get(`/buscar-resolucao-de-alertas/:idHospital`, function (req, res) {
        controleUsuariosController.buscarResolucaoDeAlertas(req, res);
});

router.get(`/buscar-usuarios-com-mais-alertas-resolvidos/:idHospital`, function (req, res) {
        controleUsuariosController.usuariosMaisAlertasResolvidos(req, res);
});

router.get(`/buscar-quantidade-alertas-resolvidos-x-pendentes/:idHospital`, function (req, res) {
        controleUsuariosController.buscarAlertasResolvidosPendentes(req, res);
});

router.get("/buscar-usuario/:idUsuario", function (req, res) {
        controleUsuariosController.buscarUsuario(req, res);
});

router.put("/atualizar-usuario/:idUsuario", function (req, res) {
        controleUsuariosController.atualizarUsuario(req, res);
});

router.put("/excluir-usuario/:idUsuario", function (req, res) {
        controleUsuariosController.excluirUsuario(req, res);
});

module.exports = router;