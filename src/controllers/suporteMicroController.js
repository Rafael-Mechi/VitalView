var suporteMicroModel = require("../models/suporteMicroModel")

function buscarDadosServidores(req, res) {

    const { idServidor } = req.params;

    suporteMicroModel.buscarDadosServidores(idServidor)
        .then(
            function (resultadoDadosServidores) {
                res.json(resultadoDadosServidores);
            }
        ).catch(
            function (erro) {
                console.log(erro);
                console.log(
                    "\nHouve um erro ao tentar cadastrar o servidor! Erro: ",
                    erro.sqlMessage
                );
                res.status(500).json(erro.sqlMessage);
            }
        )
}

function buscarListaServidores(req, res) {

    suporteMicroModel.buscarListaServidores()
        .then(
            function (resultadoDadosServidores) {
                res.json(resultadoDadosServidores);
            }
        ).catch(
            function (erro) {
                console.log(erro);
                console.log(
                    "\nHouve um erro ao tentar cadastrar o servidor! Erro: ",
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
        const fileContent = await suporteMicroModel.pegarDadosBucketModel(bucketName, fileKey);
        res.send(fileContent);
    } catch (error) {
        console.error("Erro ao buscar no bucket:", error);
        res.status(500).send("Erro ao buscar arquivo");
    }
}

function buscarAlertasServidores(req, res) {

    const { idServidor } = req.params;

    suporteMicroModel.alertasNasUltimas24hrs(idServidor)
        .then(
            function (resultadoDadosServidores) {
                res.json(resultadoDadosServidores);
            }
        ).catch(
            function (erro) {
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
    buscarDadosServidores,
    pegarDadosBucket,
    buscarListaServidores,
    buscarAlertasServidores
}