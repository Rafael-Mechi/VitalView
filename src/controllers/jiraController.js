var jiraModel = require("../models/jiraModel")

function buscarAlertas(req, res){
    jiraModel.buscarAlertas()
        .then(
            function (resultadoBuscarUsuario){
                res.json(resultadoBuscarUsuario);
                console.log(resultadoBuscarUsuario);
            }

        ).catch(
            function(erro){
                console.log(erro);
                    console.log(
                        "\nHouve um erro ao tentar buscar este usuário! Erro: ",
                        erro
                    );
                    res.status(500).json(erro);
            }
        )
}

module.exports = {
    buscarAlertas
}