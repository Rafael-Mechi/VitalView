var dashboardAnalistaModel = require("../models/dashboardAnalistaModel");

function topServidoresComMaisAlertas(req, res){
    let idHospital = req.params.idHospital;
    let periodo = req.query.periodo || 'mes'; // Default: mês

    dashboardAnalistaModel.topServidoresComMaisAlertas(idHospital, periodo)
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
    let periodo = req.query.periodo || 'mes';

    dashboardAnalistaModel.distribuicaoAlertasPorComponente(idHospital, periodo)
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
    let periodo = req.query.periodo || 'mes';

    dashboardAnalistaModel.contarAlertasNoPeriodo(idHospital, periodo)
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
    let periodo = req.query.periodo || 'ano';

    dashboardAnalistaModel.distribuicaoAlertasAno(idHospital, periodo)
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

function diaSemanaComMaisAlertas(req, res){
    let idHospital = req.params.idHospital;
    let periodo = req.query.periodo || 'mes';

    dashboardAnalistaModel.diaSemanaComMaisAlertas(idHospital, periodo)
        .then(
            function (diaSemana){
                res.json(diaSemana);
                console.log(diaSemana);
            }
        ).catch(
            function(erro){
                console.log(erro);
                console.log(
                    "\nHouve um erro ao tentar buscar o dia da semana com mais alertas! Erro: ",
                    erro.sqlMessage
                );
                res.status(500).json(erro.sqlMessage);
            }
        )
}

async function pegarDadosBucket(req, res) {
    const bucketName = process.env.AWS_BUCKET_NAME;
    const fileKey = req.params.key;

    try {
        const fileContent = await dashboardAnalistaModel.pegarDadosBucketModel(bucketName, fileKey);
        res.send(fileContent);
    } catch (error) {
        console.error("Erro ao buscar no bucket:", error);
        res.status(500).send("Erro ao buscar arquivo");
    }
}

function buscarServidores(req, res){
    let idHospital = req.params.idHospital;

    dashboardAnalistaModel.buscarServidores(idHospital)
        .then(
            function (Servidores){
                res.json(Servidores);
                console.log(Servidores);
            }
        ).catch(
            function(erro){
                console.log(erro);
                console.log(
                    "\nHouve um erro ao tentar buscar os servidores do hospital! Erro: ",
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
    distribuicaoAlertasAno,
    diaSemanaComMaisAlertas,
    pegarDadosBucket,
    buscarServidores
};