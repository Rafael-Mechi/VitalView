var database = require("../database/config")

async function cadastrarServidor(hostname, ip, fkHospital, porcentagemCpu, porcentagemRam, porcentagemDisco){
    var instrucaoInserirServidor = `
        INSERT INTO servidores (hostname, ip, fkHospital) values 
        ('${hostname}', '${ip}', ${fkHospital})
    `;
    await database.executar(instrucaoInserirServidor);
    
    // esta instrução abaixo é importante para obtermos o ID do servidor que acabou de ser cadastrado, para que possamos inserir o atributo "fkServidor" ma tabela "componentes"
    var instrucaoBuscarIdServidor = 
        `SELECT idServidor FROM servidores where ip = '${ip}' and fkHospital = ${fkHospital}`
    var resultado = await database.executar(instrucaoBuscarIdServidor);
    
    var idServidor = resultado[0].idServidor;

    var instrucaoInserirLimiteComponentes = `
    INSERT INTO componentes (fkTipo, fkServidor, limite) VALUES
    (1, ${idServidor}, ${porcentagemCpu}),
    (2, ${idServidor}, ${porcentagemRam}),
    (3, ${idServidor}, ${porcentagemDisco});
`;
await database.executar(instrucaoInserirLimiteComponentes);

return idServidor;
}

module.exports = {
    cadastrarServidor
}