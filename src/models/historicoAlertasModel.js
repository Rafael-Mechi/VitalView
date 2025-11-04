var database = require("../database/config");

function buscarAlertas(idHospital) {
    var instrucao = `
        SELECT
    a.id as id_alerta,
    s.hostname AS servidor,
    a.data_alerta AS 'data_hora',
    t.nome AS componente,
    a.registro AS 'registro'
    FROM alerta a
    INNER JOIN componentes c ON a.fkComponente = c.idComponente
    INNER JOIN tipoComponente t ON c.fkTipo = t.idTipo
    INNER JOIN servidores s ON c.fkServidor = s.idServidor
    INNER JOIN hospital h on h.idHospital = s.fkHospital
    WHERE idHospital = ${idHospital}
    ORDER BY a.data_alerta DESC;
    `;
    return database.executar(instrucao);
}

module.exports = {
    buscarAlertas
};
