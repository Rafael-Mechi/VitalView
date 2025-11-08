var usuarioModel = require("../models/usuarioModel");

function autenticar(req, res) {
    console.log("Dados login:", req.body);    
    
    var email = req.body.emailServer;
    var senha = req.body.senhaServer;
    if (email == undefined) {
        res.status(400).send("Seu email está undefined!");
    } else if (senha == undefined) {
        res.status(400).send("Sua senha está indefinida!");
    } else {

        usuarioModel.autenticar(email, senha)
            .then(
                function (resultadoAutenticar) {
                    console.log(`\nResultados encontrados: ${resultadoAutenticar.length}`);
                    console.log(`Resultados: ${JSON.stringify(resultadoAutenticar)}`); 

                    if (resultadoAutenticar.length == 1) {
                        console.log(resultadoAutenticar);
                        res.json(resultadoAutenticar[0])
                    }
                    else if (resultadoAutenticar.length == 0) {
                        res.status(403).send("Email e/ou senha inválido(s), ou você não tem acesso ao sistema");
                    } else {
                        res.status(403).send("Mais de um usuário com o mesmo login e senha!");
                    }
                }
            ).catch(
                function (erro) {
                    console.log(erro);
                    console.log("\nHouve um erro ao realizar o login! Erro: ", erro.sqlMessage);
                    res.status(500).json(erro.sqlMessage);
                }
            );
    }

}


function cadastrar(req, res) {
    
    console.log("Dados recebidos no cadastro:", req.body);

    const { nome, cpf, telefone, email, senha, fkCargo, fkHospital } = req.body;
    if (!nome || !email || !senha || !fkCargo || !cpf || !telefone || !fkHospital) {
        return res.status(400).send("Dados incompletos!");
    }

    else if (nome == undefined) {
        res.status(400).send("Seu nome está undefined!");
    } else if (email == undefined) {
        res.status(400).send("Seu email está undefined!");
    } else if (senha == undefined) {
        res.status(400).send("Sua senha está undefined!");
    } else if (cpf == undefined) {
        res.status(400).send("Seu cpf está undefined!");
    }else if (telefone == undefined) {
        res.status(400).send("Seu telefone está undefined!");
    }else if (fkCargo == undefined) {
        res.status(400).send("Seu cargo está undefined!");
    }else if (fkHospital == undefined) {
        res.status(400).send("Seu hospital está undefined!");
    }else {

        usuarioModel.cadastrar(nome, cpf, telefone, email, senha, fkCargo, fkHospital)
            .then(
                function (resultado) {
                    res.json(resultado);
                }
            ).catch(
                function (erro) {
                    console.log(erro);
                    console.log(
                        "\nHouve um erro ao realizar o cadastro! Erro: ",
                        erro.sqlMessage
                    );
                    res.status(500).json(erro.sqlMessage);
                }
            );
    }
}

function procurarCargos(req, res){
    usuarioModel.procurarCargos()
            .then(
                function (resultado) {
                    res.json(resultado);
                }
            ).catch(
                function (erro) {
                    console.log(erro);
                    console.log(
                        "\nHouve um erro ao realizar o cadastro! Erro: ",
                        erro.sqlMessage
                    );
                    res.status(500).json(erro.sqlMessage);
                }
            );
}

function procurarHospitais(req, res){
    usuarioModel.procurarHospitais()
            .then(
                function (resultado) {
                    res.json(resultado);
                }
            ).catch(
                function (erro) {
                    console.log(erro);
                    console.log(
                        "\nHouve um erro ao realizar o cadastro! Erro: ",
                        erro.sqlMessage
                    );
                    res.status(500).json(erro.sqlMessage);
                }
            );
}

module.exports = {
    cadastrar,
    autenticar,
    procurarCargos,
    procurarHospitais
}