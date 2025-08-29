var database = require("../database/config")

function autenticar(email, senha) {
    console.log("ACESSEI O USUARIO MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function entrar(): ", email, senha)

    var instrucaoSql = `
        SELECT idUsuario, nome, email, senha, fkcargo, fkHospital FROM usuario WHERE email = '${email}' AND senha = '${senha}';`
         console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

async function cadastrar(nome, email, cpf, telefone, senha, cargo, codigo, hospital) {

    //Busca o hospital pelo codigo 
    var sqlBusca = `
       select idHospital, 
        from hospital
        where codigo = '${codigo}' and idhospital = '${hospital}'
        limit 1
    `;

    var resultado = await database.executar(sqlBusca)
    console.log(resultado);
    

    if (!resultado[0] || !resultado[0].cargo) {
        throw new Error('Código inválido para qualquer hospital');
    }

    var fkHospital = resultado[0].idHospital;
    var cargo = resultado[0].cargo;
    
    console.log(resultado);
    
    var sqlCadastro = `
        insert into usuario (nome, email, senha, fkcargo, fkHospital, cpf, telefone)
        values ('${nome}', '${email}', '${senha}', '${cargo}', '${fkHospital}', '${cpf}', '${telefone}');
    `;
    console.log(resultado);
    return database.executar(sqlCadastro);
}

function procurarCargos(){
    var instrucaoSql = `
        select idcargo, nome from cargo;`
         console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function procurarHospitais(){
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