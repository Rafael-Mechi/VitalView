var database = require("../database/config");

function buscarQtdUsuarios(idHospital) {
    var instrucao = `
        SELECT 
            c.nome AS cargo,
            COUNT(u.idUsuario) AS quantidade_usuarios
        FROM cargo c
        LEFT JOIN usuario u ON u.fkCargo = c.idcargo
        WHERE u.fkHospital = ${idHospital}
        GROUP BY c.idcargo, c.nome;
    `;
    return database.executar(instrucao);
}

function buscarUsuariosSistema(idHospital){
    var instrucao = `
        SELECT 
    u.idUsuario AS id,
    u.nome AS nome,
    u.email AS email,
    c.nome AS cargo,
    u.data_criacao AS data_criacao,
    COALESCE(GROUP_CONCAT(s.hostname SEPARATOR ', '), 'Nenhum') AS 'servidores_criados'
    FROM usuario u
    INNER JOIN hospital h ON h.idHospital = u.fkHospital
    LEFT JOIN servidores s ON s.fkUsuario = u.idUsuario
    INNER JOIN cargo c ON c.idcargo = u.fkcargo
    WHERE idHospital = ${idHospital}
    GROUP BY u.idUsuario;`;

    return database.executar(instrucao);
}

module.exports = {
    buscarQtdUsuarios,
    buscarUsuariosSistema
};
