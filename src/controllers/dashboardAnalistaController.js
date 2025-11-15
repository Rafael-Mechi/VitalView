var dashboardAnalistaModel = require("../models/dashboardAnalistaModel");

function topServidoresComMaisAlertas(req, res){
    let idHospital = req.params.idHospital;

    dashboardAnalistaModel.topServidoresComMaisAlertas(idHospital)
        .then(
            function (topServidores){
                res.json(topServidores);
                console.log(topServidores);
            }

        ).catch(
            function(erro){
                console.log(erro);
                    console.log(
                        "\nHouve um erro ao tentar buscar os top servidores com mais alertas! Erro: ",
                        erro.sqlMessage
                    );
                    res.status(500).json(erro.sqlMessage);
            }
        )
}

function distribuicaoAlertasPorComponente(req, res){
    let idHospital = req.params.idHospital;

    dashboardAnalistaModel.distribuicaoAlertasPorComponente(idHospital)
        .then(
            function (alertasPorComponente){
                res.json(alertasPorComponente);
                console.log(alertasPorComponente);
            }

        ).catch(
            function(erro){
                console.log(erro);
                    console.log(
                        "\nHouve um erro ao tentar buscar a distribuição de alertas por componente! Erro: ",
                        erro.sqlMessage
                    );
                    res.status(500).json(erro.sqlMessage);
            }
        )
}

function contarAlertasNoPeriodo(req, res){
    let idHospital = req.params.idHospital;

    dashboardAnalistaModel.contarAlertasNoPeriodo(idHospital)
        .then(
            function (alertasNoPeriodo){
                res.json(alertasNoPeriodo);
                console.log(alertasNoPeriodo);
            }

        ).catch(
            function(erro){
                console.log(erro);
                    console.log(
                        "\nHouve um erro ao tentar buscar a quantidade de alertas no periodo! Erro: ",
                        erro.sqlMessage
                    );
                    res.status(500).json(erro.sqlMessage);
            }
        )
}

function distribuicaoAlertasAno(req, res){
    let idHospital = req.params.idHospital;

    dashboardAnalistaModel.distribuicaoAlertasAno(idHospital)
        .then(
            function (alertasNoAno){
                res.json(alertasNoAno);
                console.log(alertasNoAno);
            }

        ).catch(
            function(erro){
                console.log(erro);
                    console.log(
                        "\nHouve um erro ao tentar buscar a distribuição de alertas no ano! Erro: ",
                        erro.sqlMessage
                    );
                    res.status(500).json(erro.sqlMessage);
            }
        )
}

module.exports = {
  topServidoresComMaisAlertas,
  distribuicaoAlertasPorComponente,
  contarAlertasNoPeriodo,
  distribuicaoAlertasAno
};
