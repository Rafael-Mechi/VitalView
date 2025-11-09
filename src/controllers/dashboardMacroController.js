var dashboardMacroModel = require("../models/dashboardMacroModel")

function buscarDadosDashboard(req, res) {
    console.log("Buscando dados do Dashboard Macro...");
    
    Promise.all([
        dashboardMacroModel.buscarDadosDashboard(),
        dashboardMacroModel.buscarKPIs()
    ]).then(function (resultados) {
        var dadosServidores = resultados[0];
        var dadosKPIs = resultados[1];
        
        var alertasAtual = dadosKPIs[0].alertas_24h;
        var alertasAnterior = dadosKPIs[0].alertas_anterior;
        var diferenca = alertasAtual - alertasAnterior;
        var tendenciaAlertas = diferenca > 0 ? `+${diferenca}` : `${diferenca}`;
        
        var kpis = {
            servidoresRisco: dadosKPIs[0].servidores_alerta,
            totalServidores: dadosKPIs[0].total_servidores,
            alertas24h: dadosKPIs[0].alertas_24h,
            tendenciaAlertas: tendenciaAlertas,
            distribuicao: {
                normais: dadosKPIs[0].total_servidores - dadosKPIs[0].servidores_alerta,
                alertas: dadosKPIs[0].servidores_alerta 
            }
        };
        
        var servidores = [];
        
        for (var i = 0; i < dadosServidores.length; i++) {
            var servidor = dadosServidores[i];
            
            // Status baseado nos alertas ativos
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

        res.json({
            kpis: kpis,
            servidores: servidores
        });
        
    }).catch(function (erro) {
        console.log(erro);
        res.status(500).json({ erro: "Erro interno do servidor" });
    });
}

module.exports = {
    buscarDadosDashboard
};