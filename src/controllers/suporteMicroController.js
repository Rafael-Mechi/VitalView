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

function limitesServidores(req, res) {

    const { idServidor } = req.params;

    suporteMicroModel.buscarLimitesServidor(idServidor)
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
    const key = req.query.key;

    try {
        const dados = await suporteMicroModel.pegarDadosBucketModel(process.env.AWS_BUCKET_NAME, key);

        let json;
        try {
            json = JSON.parse(dados);
        } catch (e) {
            console.error("JSON inválido vindo do S3:", e);
            return res.status(500).json({ erro: "JSON inválido no bucket" });
        }

        // garante ARRAY
        if (!Array.isArray(json)) {
            json = [json];
        }

        return res.json(json);

    } catch (error) {
        console.error("Erro ao acessar o S3:", error);
        return res.status(500).json({ erro: "Falha ao acessar bucket" });
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
    buscarAlertasServidores,
    limitesServidores
}