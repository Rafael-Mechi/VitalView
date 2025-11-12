var database = require("../database/config");

async function topServidoresComMaisAlertas(idHospital) {
    const instrucao = `
    SELECT 
        s.hostname,
        s.ip,
        s.localizacao,
        a.id AS alerta_id,
        a.data_alerta,
        a.registro,
        a.status_alerta
    FROM 
        servidores s
    JOIN 
        alerta a ON s.idServidor = a.fkComponente
    WHERE 
        a.data_alerta BETWEEN DATE_SUB(NOW(), INTERVAL 1 MONTH) AND NOW() AND idHospital = ${idHospital}
        LIMIT 5`;
    return database.executar(instrucao);
}

async function distribuicaoAlertasPorComponente(idHospital) {
    const instrucao = `
    SELECT 
    c.nome AS componente, 
    COUNT(a.id) AS quantidade_alertas
    FROM 
        alerta a
    JOIN 
        componentes c ON a.fkComponente = c.idComponente
    JOIN 
        servidores s ON c.fkServidor = s.idServidor
    JOIN 
        hospital h ON s.fkHospital = h.idHospital
    WHERE 
        h.idHospital = ${idHospital}
    AND a.data_alerta >= CURDATE() - INTERVAL 1 MONTH
    GROUP BY 
        c.nome
    ORDER BY 
        quantidade_alertas DESC`;
    return database.executar(instrucao);
}

async function contarAlertasNoPeriodo(idHospital) {
    const instrucao = `
    SELECT 
        COUNT(a.id) AS quantidade_alertas
    FROM 
        alerta a
    JOIN 
        componentes c ON a.fkComponente = c.idComponente
    JOIN 
        servidores s ON c.fkServidor = s.idServidor
    JOIN 
        hospital h ON s.fkHospital = h.idHospital
    WHERE 
        h.idHospital = ${idHospital}
        AND a.data_alerta >= CURDATE() - INTERVAL 1 MONTH
        AND a.data_alerta < CURDATE()
    `;
    return database.executar(instrucao);
}

async function distribuicaoAlertasAno(idHospital) {
    const instrucao = `
    SELECT 
        DATE_FORMAT(a.data_alerta, '%Y-%m') AS mes_ano,
        COUNT(a.id) AS quantidade_alertas
    FROM 
        alerta a
    JOIN 
        componentes c ON a.fkComponente = c.idComponente
    JOIN 
        servidores s ON c.fkServidor = s.idServidor
    JOIN 
        hospital h ON s.fkHospital = h.idHospital
    WHERE 
        h.idHospital = ${idHospital}
        AND a.data_alerta >= CURDATE() - INTERVAL 12 MONTH
    GROUP BY 
        mes_ano
    ORDER BY 
        mes_ano DESC`;
    return database.executar(instrucao);
}

module.exports = {
    topServidoresComMaisAlertas,
    distribuicaoAlertasPorComponente,
    contarAlertasNoPeriodo,
    distribuicaoAlertasAno
};
