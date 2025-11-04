var servidorModel = require("../models/servidorModel")

function cadastrarServidor(req, res){
    var hostname = req.body.hostnameServer;
    var ip = req.body.ipServer;
    var localizacao = req.body.localizacaoServer;

    var porcentagemCpu = req.body.porcentagemCpuServer;
    var porcentagemRam = req.body.porcentagemRamServer;
    var porcentagemDisco = req.body.porcentagemDiscoServer;

    var fkHospital = req.body.fkHospitalServer;
    var fkUsuario = req.body.fkUsuarioServer;

    servidorModel.cadastrarServidor(hostname, ip, localizacao, fkHospital,fkUsuario, porcentagemCpu, porcentagemRam, porcentagemDisco)
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