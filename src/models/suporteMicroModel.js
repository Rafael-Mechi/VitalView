var database = require("../database/config");

function buscarDadosServidores(idServidor) {

    const instrucao = `
        select * from servidores where idServidor = ${idServidor};
    `;
    return database.executar(instrucao);
}

module.exports = {
    buscarDadosServidores
};
