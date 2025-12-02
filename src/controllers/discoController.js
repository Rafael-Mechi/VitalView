var suporteMicroModel = require("../models/suporteMicroModel");

function buscarDadosServidores(req, res) {
  var idServidor = req.params.idServidor;
    suporteMicroModel.buscarLimites(idServidor)
      .then((resultado) => res.json(resultado))
      .catch((erro) => res.status(500).json(erro.sqlMessage));
}

function buscarListaServidores(req, res) {
  suporteMicroModel.buscarListaServidores()
    .then((resultadoDadosServidores) => {
      res.json(resultadoDadosServidores);
    })
    .catch((erro) => {
      console.log("\nHouve um erro ao tentar buscar os servidores! Erro:", erro.sqlMessage);
      res.status(500).json(erro.sqlMessage);
    });
}

async function pegarDadosDisco(req, res) {
  const bucketName = process.env.AWS_BUCKET_NAME;
    const fileKey = `suporte/disco/${req.params.key}`
    //ISSO AQUI SALVOU MINHA VIDA -> log("Key recebida na rota:", fileKey)

    try {
      const fileContent = await suporteMicroModel.pegarDadosBucketModel(bucketName, fileKey);
      res.send(fileContent);
    } catch (error) {
      console.error("Erro ao buscar no bucket:", error);
      res.status(500).send("Erro ao buscar arquivo");
  }
}



module.exports = {
  buscarDadosServidores,
  buscarListaServidores,
  pegarDadosDisco,
};
