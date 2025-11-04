var express = require("express");
var router = express.Router();

var controleUsuariosController = require("../controllers/controleUsuariosController");

// router.get(`buscar-usuarios-do-sistema/:idHospital`, function (req, res) {
//     controleUsuariosController.buscarUsuarios(req, res);
// });

router.get(`/buscar-quantidade-de-usuarios/:idHospital`, function (req, res){
        controleUsuariosController.buscarQtdUsuarios(req, res);
});

router.get(`/buscar-usuarios-do-sistema/:idHospital`, function (req, res){
        controleUsuariosController.buscarUsuariosSistema(req, res);
});


module.exports = router;