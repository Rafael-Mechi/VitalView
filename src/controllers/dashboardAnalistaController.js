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

function contarAlertasNoPeriodo(req, res){
    let idHospital = req.params.idHospital;

    dashboardAnalistaModel.contarAlertasNoPeriodo(idHospital)
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
