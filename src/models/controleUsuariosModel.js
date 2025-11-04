var database = require("../database/config");

function buscarQtdUsuarios(idHospital) {
    const instrucao = `
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

module.exports = {
    buscarQtdUsuarios
};
