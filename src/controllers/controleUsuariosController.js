var controleUsuariosModel = require("../models/controleUsuariosModel")

function buscarQtdUsuarios(req, res){
    let idHospital = req.params.idHospital;

    controleUsuariosModel.buscarQtdUsuarios(idHospital)
        .then(
            function (resultadoBuscarQtdUsuarios){
                res.json(resultadoBuscarQtdUsuarios);
                console.log(resultadoBuscarQtdUsuarios);
            }

        ).catch(
            function(erro){
                console.log(erro);
                    console.log(
                        "\nHouve um erro ao tentar buscar a quantidade de usuários! Erro: ",
                        erro.sqlMessage
                    );
                    res.status(500).json(erro.sqlMessage);
            }
        )
}

function buscarUsuariosSistema(req, res){
    let idHospital = req.params.idHospital;

    controleUsuariosModel.buscarUsuariosSistema(idHospital)
        .then(
            function (resultadoBuscarQtdUsuarios){
                res.json(resultadoBuscarQtdUsuarios);
                console.log(resultadoBuscarQtdUsuarios);
            }

        ).catch(
            function(erro){
                console.log(erro);
                    console.log(
                        "\nHouve um erro ao tentar buscar usuários! Erro: ",
                        erro.sqlMessage
                    );
                    res.status(500).json(erro.sqlMessage);
            }
        )
}

module.exports = {
    buscarQtdUsuarios,
    buscarUsuariosSistema
}