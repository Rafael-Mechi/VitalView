var suporteMicroModel = require("../models/suporteMicroModel");

function buscarDadosServidores(req, res) {
  const { idServidor } = req.params;

  suporteMicroModel.buscarDadosServidores(idServidor)
    .then((resultadoDadosServidores) => {
      res.json(resultadoDadosServidores);
    })
    .catch((erro) => {
      console.log("\nHouve um erro ao tentar buscar o servidor! Erro:", erro.sqlMessage);
      res.status(500).json(erro.sqlMessage);
    });
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

async function pegarDadosDisco(req, res) {
  const bucketName = process.env.AWS_BUCKET_NAME;
  const { idServidor } = req.params;
 const fileKey = `1_srv1_Sirio libanes`

  try {
    const dadosDisco = await suporteMicroModel.pegarDadosDiscoModel(bucketName, fileKey);
    res.json(dadosDisco);
  } catch (error) {
    console.error("Erro ao buscar dados de disco:", error);
    res.status(500).json({ message: "Erro ao buscar dados de disco", details: error.message });
  }
}

module.exports = {
  buscarDadosServidores,
  pegarDadosBucket,
  buscarListaServidores,
  pegarDadosDisco
};
