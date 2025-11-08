var database = require("../database/config")

function autenticar(email, senha) {
    console.log("ACESSEI O USUARIO MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function entrar(): ", email, senha)

    var instrucaoSql = `
        SELECT 
            u.idUsuario,
            u.nome,
            u.email,
            u.fkHospital,
            u.fkcargo,
            c.nome AS cargo
        FROM usuario u
        JOIN cargo c ON c.idcargo = u.fkcargo
        WHERE u.email = '${email}' AND u.senha = '${senha}';
    `;
    console.log("Cadastro realizado: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

async function cadastrar(nome, cpf, telefone, email, senha, fkCargo, fkHospital) {

    var sqlCadastro = `
        insert into usuario (nome, cpf, telefone, email, senha, fkcargo, fkHospital)
        values ('${nome}', '${cpf}', '${telefone}', '${email}', '${senha}', '${fkCargo}', '${fkHospital}');
    `;
    console.log("Executando a instrução SQL: \n" + sqlCadastro);
    return database.executar(sqlCadastro);
}

function procurarCargos() {
    var instrucaoSql = `select idcargo, nome from cargo;`
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function procurarHospitais() {
    var instrucaoSql = `
        select idhospital, nome from hospital;`
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}


module.exports = {
    cadastrar,
    autenticar,
    procurarCargos,
    procurarHospitais
};