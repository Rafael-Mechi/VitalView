var database = require("../database/config");

function buscarDadosDashboard(idHospital) {
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
        WHERE s.fkHospital = ${idHospital}
        ORDER BY s.hostname;
    `;
    
    return database.executar(instrucaoSql, [idHospital]);
}

function buscarKPIs(idHospital) {
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
            -- Alertas do hospital específico que foi cadastrado
            (SELECT COUNT(*) FROM alerta a
             JOIN componentes c ON a.fkComponente = c.idComponente
             JOIN servidores s2 ON c.fkServidor = s2.idServidor
             WHERE a.data_alerta >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
             AND s2.fkHospital = ${idHospital}) as alertas_24h,
            -- Alertas anteriores apenas do hospital específico que foi cadastrado uhuul
            (SELECT COUNT(*) FROM alerta a
             JOIN componentes c ON a.fkComponente = c.idComponente
             JOIN servidores s2 ON c.fkServidor = s2.idServidor
             WHERE a.data_alerta BETWEEN DATE_SUB(NOW(), INTERVAL 48 HOUR) AND DATE_SUB(NOW(), INTERVAL 24 HOUR)
             AND s2.fkHospital = ${idHospital}) as alertas_anterior
        FROM servidores s
        WHERE s.fkHospital = ${idHospital}
    `;
    
    return database.executar(instrucaoSql, [idHospital, idHospital, idHospital]);
}

function buscarAlertasGerais(idHospital) {
    console.log("Model: Buscando alertas gerais do hospital", idHospital);
    
    var instrucaoSql = `
        SELECT COUNT(*) as total_alertas
        FROM alerta a
        JOIN componentes c ON a.fkComponente = c.idComponente
        JOIN servidores s ON c.fkServidor = s.idServidor
        WHERE s.fkHospital = ${idHospital};
    `;

    console.log("📝 SQL Executado:", instrucaoSql);
    
    return database.executar(instrucaoSql, [idHospital])
        .then(function(resultado) {
            console.log("Resultado CÚ do banco:", resultado);
            console.log("Tipo do resultado:", typeof resultado);
            console.log("É array?", Array.isArray(resultado));
            console.log("Length do resultado:", resultado.length);
            
            if (resultado && resultado.length > 0) {
                console.log("Primeiro elemento:", resultado[0]);
                console.log("Total_alertas do primeiro elemento:", resultado[0].total_alertas);
                console.log("Tipo de total_alertas:", typeof resultado[0].total_alertas);
            } else {
                console.log("Nenhum resultado retornado");
            }
            
            return resultado;
        })
        .catch(function(erro) {
            console.log("ERRO CRÍTICO na query buscarAlertasGerais:", erro);
            console.log("SQL que causou erro:", instrucaoSql);
            throw erro;
        });
}

module.exports = {
    buscarDadosDashboard,
    buscarKPIs,
    buscarAlertasGerais
};