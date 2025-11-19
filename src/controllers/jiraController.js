var jiraModel = require("../models/jiraModel")

function abrirChamadoExclusao(req, res){
    let caminhoArquivo = req.body.caminhoArquivoServer
    let tempoNoSistema = req.body.tempoNoSistemaServer

    jiraModel.abrirChamadoExclusao(caminhoArquivo, tempoNoSistema)
        .then(
            function (resultadoBuscarUsuario){
                res.json(resultadoBuscarUsuario);
                console.log(resultadoBuscarUsuario);
            }

        ).catch(
            function(erro){
                console.log(erro);
                    console.log(
                        "\nHouve um erro ao tentar abrir o chamado para exclusão! Erro: ",
                        erro
                    );
                    res.status(500).json(erro);
            }
        )
}

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
    buscarAlertas,
    abrirChamadoExclusao
}