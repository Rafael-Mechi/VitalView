var historicoAlertasModel = require("../models/historicoAlertasModel")

function buscarAlertas(req, res) {
    let idHospital = req.params.idHospital;

    historicoAlertasModel.buscarAlertas(idHospital)
        .then(
            function (resultadoBuscarQtdUsuarios) {
                res.json(resultadoBuscarQtdUsuarios);
                console.log(resultadoBuscarQtdUsuarios);
            }

        ).catch(
            function (erro) {
                console.log(erro);
                console.log(
                    "\nHouve um erro ao tentar buscar ao buscar os alertas! Erro: ",
                    erro.sqlMessage
                );
                res.status(500).json(erro.sqlMessage);
            }
        )
}

function resolverAlerta(req, res) {
    let idAlerta = req.params.idAlerta;
    let idUsuario = req.body.idUsuario;
    let dataSQL = req.body.dataSQL;
    

    historicoAlertasModel.resolverAlerta(dataSQL, idAlerta, idUsuario)
        .then(
            function (resolverAlerta) {
                res.json(resolverAlerta);
                console.log(resolverAlerta);
            }

        ).catch(
            function(erro){
                console.log(erro);
                    console.log(
                        "\nHouve um erro ao tentar corrigir o alerta! Erro: ",
                        erro.sqlMessage
                    );
                    res.status(500).json(erro.sqlMessage);
            }
        )
}


module.exports = {
    buscarAlertas,
    resolverAlerta
}