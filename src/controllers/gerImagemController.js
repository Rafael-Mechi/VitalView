var gerImagemModel = require("../models/gerImagemModel")

// function buscarDadosServidores(req, res) {

//     const { idServidor } = req.params;

//     suporteMicroModel.buscarDadosServidores(idServidor)
//         .then(
//             function (resultadoDadosServidores) {
//                 res.json(resultadoDadosServidores);
//             }
//         ).catch(
//             function (erro) {
//                 console.log(erro);
//                 console.log(
//                     "\nHouve um erro ao tentar cadastrar o servidor! Erro: ",
//                     erro.sqlMessage
//                 );
//                 res.status(500).json(erro.sqlMessage);
//             }
//         )
// }

// function buscarListaServidores(req, res) {

//     suporteMicroModel.buscarListaServidores()
//         .then(
//             function (resultadoDadosServidores) {
//                 res.json(resultadoDadosServidores);
//             }
//         ).catch(
//             function (erro) {
//                 console.log(erro);
//                 console.log(
//                     "\nHouve um erro ao tentar cadastrar o servidor! Erro: ",
//                     erro.sqlMessage
//                 );
//                 res.status(500).json(erro.sqlMessage);
//             }
//         )
// }

async function pegarDadosBucket(req, res) {
    const bucketName = process.env.AWS_BUCKET_NAME;
    const fileKey = req.params.key;

    try {
        const fileContent = await gerImagemModel.pegarDadosBucketModel(bucketName, fileKey);
        res.send(fileContent);
    } catch (error) {
        console.error("Erro ao buscar no bucket:", error);
        res.status(500).send("Erro ao buscar arquivo");
    }
}

function excluirImagem(req, res) {
    let idUsuario = req.body.idUsuarioServer;
    let caminho = req.body.caminhoArquivoServer;
    let data = req.body.dataServer;

    gerImagemModel.excluirImagem(caminho, data, idUsuario)
        .then(
            function (resultadoBuscarUsuario){
                res.json(resultadoBuscarUsuario);
                console.log(resultadoBuscarUsuario);
            }

        ).catch(
            function(erro){
                console.log(erro);
                    console.log(
                        "\nHouve um erro ao tentar excluir esta imagem! Erro: ",
                        erro.sqlMessage
                    );
                    res.status(500).json(erro.sqlMessage);
            }
        )
}

function buscarExclusoes(){
    gerImagemModel.buscarExclusoes()
        .then(
            function (resultado){
                res.json(resultado);
                console.log(resultado);
            }

        ).catch(
            function(erro){
                console.log(erro);
                    console.log(
                        "\nHouve um erro ao tentar buscar exclusões! Erro: ",
                        erro.sqlMessage
                    );
                    res.status(500).json(erro.sqlMessage);
            }
        )
}

module.exports = {
    pegarDadosBucket,
    excluirImagem,
    buscarExclusoes
}