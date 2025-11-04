var historicoAlertasModel = require("../models/historicoAlertasModel")

function buscarAlertas(req, res){
    let idHospital = req.params.idHospital;

    historicoAlertasModel.buscarAlertas(idHospital)
        .then(
            function (resultadoBuscarQtdUsuarios){
                res.json(resultadoBuscarQtdUsuarios);
                console.log(resultadoBuscarQtdUsuarios);
            }

        ).catch(
            function(erro){
                console.log(erro);
                    console.log(
                        "\nHouve um erro ao tentar buscar ao buscar os alertas! Erro: ",
                        erro.sqlMessage
                    );
                    res.status(500).json(erro.sqlMessage);
            }
        )
}


module.exports = {
    buscarAlertas
}