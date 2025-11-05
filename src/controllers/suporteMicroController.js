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

module.exports = {
    buscarDadosServidores
}