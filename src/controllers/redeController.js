var redeModel = require("../models/redeModel");

function buscarLimites(req, res) {
    var idServidor = req.params.idServidor;

    redeModel.buscarLimites(idServidor)
        .then((resultado) => res.json(resultado[0]))
        .catch((erro) => res.status(500).json(erro.sqlMessage));
}


async function buscarDadosRede(req, res) {
    const hostname = req.params.hostname;

    if (!hostname) {
        return res.status(400).json({ erro: "Hostname não informado" });
    }

    try {
        const registros = await redeModel.pegarDadosRede(hostname);

        if (!registros || (Array.isArray(registros) && registros.length === 0)) {
            return res.status(204).send(); // sem conteúdo
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
    buscarLimites
};
