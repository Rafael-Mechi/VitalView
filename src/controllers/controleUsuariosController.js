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
                        "\nHouve um erro ao tentar cadastrar o servidor! Erro: ",
                        erro.sqlMessage
                    );
                    res.status(500).json(erro.sqlMessage);
            }
        )
}

module.exports = {
    buscarQtdUsuarios
}