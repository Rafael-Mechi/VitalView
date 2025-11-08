var controleUsuariosModel = require("../models/controleUsuariosModel")

function buscarQtdUsuarios(req, res){
    let idHospital = req.params.idHospital;

    controleUsuariosModel.buscarQtdUsuarios(idHospital)
        .then(
            function (resultadoBuscarQtdUsuarios){
                res.json(resultadoBuscarQtdUsuarios);
                console.log(resultadoBuscarQtdUsuarios);
            }

        ).catch(
            function(erro){
                console.log(erro);
                    console.log(
                        "\nHouve um erro ao tentar buscar a quantidade de usuários! Erro: ",
                        erro.sqlMessage
                    );
                    res.status(500).json(erro.sqlMessage);
            }
        )
}

function buscarUsuariosSistema(req, res){
    let idHospital = req.params.idHospital;

    controleUsuariosModel.buscarUsuariosSistema(idHospital)
        .then(
            function (resultadoBuscarQtdUsuarios){
                res.json(resultadoBuscarQtdUsuarios);
                console.log(resultadoBuscarQtdUsuarios);
            }

        ).catch(
            function(erro){
                console.log(erro);
                    console.log(
                        "\nHouve um erro ao tentar buscar usuários! Erro: ",
                        erro.sqlMessage
                    );
                    res.status(500).json(erro.sqlMessage);
            }
        )
}

function buscarResolucaoDeAlertas(req, res){
    let idHospital = req.params.idHospital;

    controleUsuariosModel.buscarResolucaoDeAlertas(idHospital)
        .then(
            function (resultadoBuscarQtdUsuarios){
                res.json(resultadoBuscarQtdUsuarios);
                console.log(resultadoBuscarQtdUsuarios);
            }
        ).catch(
            function(erro){
                console.log(erro);
                    console.log(
                        "\nHouve um erro ao tentar a resolução de alertas! Erro: ",
                        erro.sqlMessage
                    );
                    res.status(500).json(erro.sqlMessage);
            }
        )
}

function usuariosMaisAlertasResolvidos(req, res){
    let idHospital = req.params.idHospital;

    controleUsuariosModel.usuariosMaisAlertasResolvidos(idHospital)
        .then(
            function (resultadoBuscarQtdUsuarios){
                res.json(resultadoBuscarQtdUsuarios);
                console.log(resultadoBuscarQtdUsuarios);
            }
        ).catch(
            function(erro){
                console.log(erro);
                    console.log(
                        "\nHouve um erro ao tentar buscar os usuários com mais alertas resolvidos! Erro: ",
                        erro.sqlMessage
                    );
                    res.status(500).json(erro.sqlMessage);
            }
        )
}

function buscarAlertasResolvidosPendentes(req, res){
    let idHospital = req.params.idHospital;

    controleUsuariosModel.buscarAlertasResolvidosPendentes(idHospital)
        .then(
            function (resultadoBuscarQtdUsuarios){
                res.json(resultadoBuscarQtdUsuarios);
                console.log(resultadoBuscarQtdUsuarios);
            }
        ).catch(
            function(erro){
                console.log(erro);
                    console.log(
                        "\nHouve um erro ao tentar buscar os alertas pendentes x resolvidos! Erro: ",
                        erro.sqlMessage
                    );
                    res.status(500).json(erro.sqlMessage);
            }
        )
}

function buscarUsuario(req, res){
    let idUsuario = req.params.idUsuario;
    
    controleUsuariosModel.buscarUsuario(idUsuario)
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
                        erro.sqlMessage
                    );
                    res.status(500).json(erro.sqlMessage);
            }
        )
}

function atualizarUsuario(req, res){
    let idUsuario = req.body.idUsuarioServer;
    let nome = req.body.nomeServer;
    let cpf = req.body.cpfServer;
    let telefone = req.body.telefoneServer;
    let email = req.body.emailServer;
    let senha = req.body.senhaNovaServer;
    let cargo = req.body.cargoServer;
    
    controleUsuariosModel.atualizarUsuario(idUsuario, nome, cpf, telefone, email, senha, cargo)
        .then(
            function (resultadoBuscarUsuario){
                res.json(resultadoBuscarUsuario);
                console.log(resultadoBuscarUsuario);
            }

        ).catch(
            function(erro){
                console.log(erro);
                    console.log(
                        "\nHouve um erro ao tentar atualizar este usuário! Erro: ",
                        erro.sqlMessage
                    );
                    res.status(500).json(erro.sqlMessage);
            }
        )
}

function excluirUsuario(req, res){
    let idUsuario = req.body.idUsuarioServer;
    
    controleUsuariosModel.excluirUsuario(idUsuario)
        .then(
            function (resultadoBuscarUsuario){
                res.json(resultadoBuscarUsuario);
                console.log(resultadoBuscarUsuario);
            }

        ).catch(
            function(erro){
                console.log(erro);
                    console.log(
                        "\nHouve um erro ao tentar excluir este usuário! Erro: ",
                        erro.sqlMessage
                    );
                    res.status(500).json(erro.sqlMessage);
            }
        )
}

module.exports = {
    buscarQtdUsuarios,
    buscarUsuariosSistema,
    buscarResolucaoDeAlertas,
    usuariosMaisAlertasResolvidos,
    buscarAlertasResolvidosPendentes,
    buscarUsuario,
    atualizarUsuario,
    excluirUsuario
}