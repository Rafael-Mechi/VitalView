var servidorModel = require("../models/servidorModel")

function cadastrarServidor(req, res){
    var hostname = req.body.hostnameServer;
    var ip = req.body.ipServer;
    //var ram = req.body.ramServer; // precisa da quantidade de ram? O próprio psutil já vai dizer
    //var disco = req.body.discoServer;

    var porcentagemCpu = req.body.porcentagemCpuServer;
    var porcentagemRam = req.body.porcentagemRamServer;
    var porcentagemDisco = req.body.porcentagemDiscoServer;

    var fkHospital = req.body.fkHospitalServer;

    servidorModel.cadastrarServidor(hostname, ip, fkHospital, porcentagemCpu, porcentagemRam, porcentagemDisco)
        .then(
            function (resultadoCadastrarServidor){
                res.json(resultadoCadastrarServidor);
            }

        ).catch(
            function(erro){
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
    cadastrarServidor
}