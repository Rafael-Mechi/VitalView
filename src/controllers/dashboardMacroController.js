var dashboardMacroModel = require("../models/dashboardMacroModel")

function buscarDadosDashboard(req, res) {
    console.log("CONTROLLER: Buscando dados do Dashboard Macro...");

    const idHospital = req.query.hospital || req.query.idHospital;
    
    console.log("ID Hospital recebido:", idHospital);
    
    if (!idHospital) {
        console.log("ERRO: ID do hospital não fornecido");
        return res.status(400).json({ erro: "ID do hospital não fornecido" });
    }
    
    console.log("Iniciando Promise.all...");
    
    Promise.all([
        dashboardMacroModel.buscarDadosDashboard(idHospital),
        dashboardMacroModel.buscarKPIs(idHospital),
        dashboardMacroModel.buscarAlertasGerais(idHospital)
    ]).then(function (resultados) {
        console.log("Promise.all ta funcionando");
        console.log("Número de resultados:", resultados.length);
        
        var dadosServidores = resultados[0];
        var dadosKPIs = resultados[1];
        var alertasGeraisResult = resultados[2];

        console.log("DEBUG -- Estrutura completa dos dados:");
        console.log("- dadosServidores:", dadosServidores);
        console.log("- dadosKPIs:", dadosKPIs);
        console.log("- alertasGeraisResult:", alertasGeraisResult);

        // 🚨 DEBUG DETALHADO dos alertas gerais
        console.log("DEBUG -- Alertas Gerais:");
        if (alertasGeraisResult) {
            console.log("- alertasGeraisResult length:", alertasGeraisResult.length);
            console.log("- Primeiro elemento:", alertasGeraisResult[0]);
            console.log("- total_alertas existe?", alertasGeraisResult[0]?.total_alertas);
            console.log("- Valor de total_alertas:", alertasGeraisResult[0]?.total_alertas);
        }

        var totalAlertas = 0;
        if (alertasGeraisResult && alertasGeraisResult[0] && alertasGeraisResult[0].total_alertas !== undefined) {
            totalAlertas = alertasGeraisResult[0].total_alertas;
            console.log("Total de Alertas Gerais está definido:", totalAlertas);
        } else {
            console.log("Total de Alertas Gerais NÃO encontrado, usando 0 para não ficar 'undefined' ");
        }
        
        var alertasAtual = dadosKPIs[0].alertas_24h;
        var alertasAnterior = dadosKPIs[0].alertas_anterior;
        var diferenca = alertasAtual - alertasAnterior;
        var tendenciaAlertas = diferenca > 0 ? `+${diferenca}` : `${diferenca}`;
        
        var kpis = {
            servidoresRisco: dadosKPIs[0].servidores_alerta,
            totalServidores: dadosKPIs[0].total_servidores,
            alertas24h: dadosKPIs[0].alertas_24h,
            alertasGerais: totalAlertas,
            tendenciaAlertas: tendenciaAlertas,
            distribuicao: {
                normais: dadosKPIs[0].total_servidores - dadosKPIs[0].servidores_alerta,
                alertas: dadosKPIs[0].servidores_alerta 
            }
        };
        
        console.log("KPIs para frontend:", kpis);
        
        var servidores = [];
        
        for (var i = 0; i < dadosServidores.length; i++) {
            var servidor = dadosServidores[i];
            
            var temAlertasAtivos = servidor.qtd_alertas_ativos > 0;
            
            servidores.push({
                id: servidor.id,
                nome: servidor.nome,
                status: temAlertasAtivos ? "alerta" : "normal",  
                cpu: servidor.limite_cpu || 0,
                ram: servidor.limite_ram || 0,  
                disco: servidor.limite_disco || 0,
                qtdAlertas: servidor.qtd_alertas_ativos || 0,
                tempoAlerta: servidor.tempo_alerta || "--:--:--",
                hostname: servidor.hostname,
                ip: servidor.ip,
                localizacao: servidor.localizacao
            });
        }

        console.log("Enviando resposta para frontend...");
        res.json({
            kpis: kpis,
            servidores: servidores
        });
        
    }).catch(function (erro) {
        console.log("ERRO CRÍTICO no Promise.all:", erro);
        console.log("Stack trace:", erro.stack);
        res.status(500).json({ erro: "Erro interno do servidor" });
    });
}

module.exports = {
    buscarDadosDashboard
};