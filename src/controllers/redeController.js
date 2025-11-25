var redeModel = require("../models/redeModel");

function listarServidoresPorHospital(req, res) {
    const idHospital = req.params.idHospital;

    redeModel.listarServidoresPorHospital(idHospital)
        .then(resultado => res.json(resultado))
        .catch(erro => {
            console.error("Erro ao listar servidores:", erro);
            res.status(500).json(erro);
        });
}

function buscarLimites(req, res) {
    var idServidor = req.params.idServidor;

    redeModel.buscarLimites(idServidor)
        .then((resultado) => res.json(resultado))
        .catch((erro) => res.status(500).json(erro.sqlMessage));
}


async function buscarDadosRede(req, res) {
    const idServidor = req.query.idServidor;
    const hostname = req.query.hostname;
    const nomeHospital = req.query.nomeHospital;

    if (!idServidor || !hostname || !nomeHospital) {
        return res.status(400).json({
            erro: "Parâmetros obrigatórios ausentes (idServidor, hostname, nomeHospital)"
        });
    }

     try {
        const registros = await redeModel.pegarDadosRede(
            idServidor,
            hostname,
            nomeHospital
        );

        if (!registros || registros.length === 0) {
            return res.status(204).send();
        }

        res.json(registros);

    } catch (error) {
        console.error("Erro ao buscar dados de rede:", error);

        if (error.code === "NoSuchKey") {
            return res.status(404).json({ erro: "Arquivo de rede não encontrado no bucket" });
        }

        res.status(500).json({ erro: "Erro ao buscar dados de rede" });
    }
}

module.exports = {
    buscarDadosRede,
    buscarLimites,
    listarServidoresPorHospital
};
