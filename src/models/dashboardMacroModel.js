var database = require("../database/config");

function buscarDadosDashboard() {
    var instrucaoSql = `
        SELECT 
            s.idServidor as id,
            s.hostname as nome,
            s.ip,
            s.localizacao,
            -- Busca limites configurados pelo cliente
            (SELECT c.limite FROM componentes c WHERE c.fkServidor = s.idServidor AND c.fkTipo = 1) as limite_cpu,
            (SELECT c.limite FROM componentes c WHERE c.fkServidor = s.idServidor AND c.fkTipo = 2) as limite_ram, 
            (SELECT c.limite FROM componentes c WHERE c.fkServidor = s.idServidor AND c.fkTipo = 3) as limite_disco,
            -- Contando alertas ativos (não resolvidos)
            (SELECT COUNT(*) FROM alerta a 
             JOIN componentes c ON a.fkComponente = c.idComponente
             LEFT JOIN correcao_alerta ca ON a.id = ca.fkAlerta
             WHERE c.fkServidor = s.idServidor 
             AND ca.id IS NULL) as qtd_alertas_ativos,
            -- Tempo do alerta mais antigo não resolvido
            (SELECT TIMEDIFF(NOW(), MIN(a.data_alerta)) 
             FROM alerta a 
             JOIN componentes c ON a.fkComponente = c.idComponente
             LEFT JOIN correcao_alerta ca ON a.id = ca.fkAlerta
             WHERE c.fkServidor = s.idServidor 
             AND ca.id IS NULL) as tempo_alerta
        FROM servidores s
        ORDER BY s.hostname;
    `;
    
    return database.executar(instrucaoSql);
}

function buscarKPIs() {
    var instrucaoSql = `
        SELECT 
            COUNT(DISTINCT s.idServidor) as total_servidores,
            -- Servidores com alertas ativos
            COUNT(DISTINCT CASE 
                WHEN EXISTS (
                    SELECT 1 FROM alerta a 
                    JOIN componentes c ON a.fkComponente = c.idComponente
                    LEFT JOIN correcao_alerta ca ON a.id = ca.fkAlerta
                    WHERE c.fkServidor = s.idServidor 
                    AND ca.id IS NULL
                ) THEN s.idServidor 
            END) as servidores_alerta,
            -- Total de alertas nas últimas 24 horas
            (SELECT COUNT(*) FROM alerta 
             WHERE data_alerta >= DATE_SUB(NOW(), INTERVAL 24 HOUR)) as alertas_24h,
            -- Alertas período anterior (
            (SELECT COUNT(*) FROM alerta 
             WHERE data_alerta BETWEEN DATE_SUB(NOW(), INTERVAL 48 HOUR) AND DATE_SUB(NOW(), INTERVAL 24 HOUR)) as alertas_anterior
        FROM servidores s;
    `;
    
    return database.executar(instrucaoSql);
}

module.exports = {
    buscarDadosDashboard,
    buscarKPIs
};