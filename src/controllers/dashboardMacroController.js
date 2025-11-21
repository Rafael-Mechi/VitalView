var dashboardMacroModel = require("../models/dashboardMacroModel");
var database = require("../database/config");
const jiraService = require("../services/jiraService"); 

async function buscarDadosDashboard(req, res) {
    try {
        console.log("CONTROLLER: Buscando dados do Dashboard Macro...");

        const idHospital = req.query.hospital;
        console.log("ID Hospital:", idHospital);
        
        if (!idHospital) {
            return res.status(400).json({ erro: "ID do hospital não fornecido" });
        }

        // Busca dados do banco em paralelo
        const [dadosServidores, dadosKPIs, alertasGeraisResult] = await Promise.all([
            dashboardMacroModel.buscarDadosDashboard(idHospital),
            dashboardMacroModel.buscarKPIs(idHospital),
            dashboardMacroModel.buscarAlertasGerais(idHospital)
        ]);

        console.log("✅ Dados do banco buscados!");

        let statusRedePromise = jiraService.contarAlertasRede().catch(error => {
            console.log("⚠️ Erro ao buscar Jira:", error.message);
            return { abertos: 0, resolvidos: 0, total: 0 };
        });

        // Dados consolidados do hospital
        let dadosS3 = [];
        try {
            dadosS3 = await buscarDadosConsolidadosS3(idHospital);
            console.log(`✅ Dados S3 carregados: ${dadosS3.length} servidores`);
        } catch (error) {
            console.log("❌ Erro S3:", error.message);
        }

        console.log("🔍 SERVERS FROM DATABASE for hospital", idHospital, ":");
dadosServidores.forEach(servidor => {
    console.log(`   ID: ${servidor.id}, Nome: ${servidor.nome}, Hostname: ${servidor.hostname}`);
});

// DEBUG: Verificar exatamente quais servidores vieram do S3  
console.log("🔍 SERVERS FROM S3:");
if (dadosS3 && dadosS3.length > 0) {
    dadosS3.forEach(servidor => {
        console.log(`   ServidorId: ${servidor.ServidorId}, Nome: ${servidor.Nome_da_Maquina}`);
    });
} else {
    console.log("   Nenhum servidor no S3");
}

const statusRede = await statusRedePromise;

        // PROCESSAMENTOS
        const servidores = processarServidoresComS3(dadosServidores, dadosS3);

        // CALCULA ALERTAS EM TEMPO REAL
        const servidoresComAlertas = servidores.filter(s => s.status === "alerta").length;
        const totalAlertasAtivos = servidores.reduce((total, servidor) => total + servidor.qtdAlertas, 0);

        // MANTÉM TENDÊNCIAS HISTÓRICAS DO BANCO
        const alertas24h = dadosKPIs[0]?.alertas_24h || 0;
        const alertasAnterior = dadosKPIs[0]?.alertas_anterior || 0;
        const diferenca = alertas24h - alertasAnterior;
        const tendenciaAlertas = diferenca > 0 ? `+${diferenca}` : `${diferenca}`;

        const kpis = {
            // DADOS EM TEMPO REAL
            servidoresRisco: servidoresComAlertas,
            alertasGerais: totalAlertasAtivos, 
            
            // DADOS HISTÓRICOS (para tendências)
            alertas24h: alertas24h,           
            alertasAnterior: alertasAnterior,   
            tendenciaAlertas: tendenciaAlertas,
            
            // OUTROS DADOS
            totalServidores: dadosKPIs[0]?.total_servidores || 0,
            distribuicao: {
                normais: (dadosKPIs[0]?.total_servidores || 0) - servidoresComAlertas,
                alertas: servidoresComAlertas
            },
             rede: {
                alertasAtivos: statusRede.abertos,
                alertasResolvidos: statusRede.resolvidos,
                totalAlertas: statusRede.total,
                status: statusRede.abertos > 0 ? 'ALERTA' : 'NORMAL'
            }
        };

        console.log("KPIs - Tempo real:", {
            alertasAtivos: totalAlertasAtivos,
            servidoresRisco: servidoresComAlertas,
            redeAlerta: statusRede.abertos > 0 ? 'SIM' : 'NÃO'
        });
        console.log("KPIs - Histórico:", {
            alertas24h: alertas24h,
            alertasAnterior: alertasAnterior,
            tendencia: tendenciaAlertas
        });
        
        console.log("Enviando resposta para frontend...");
        res.json({
            kpis: kpis,
            servidores: servidores,
            metricasS3: dadosS3.length > 0 ? 'Dados em tempo real' : 'Dados do banco'
        });

    } catch (error) {
        console.error("ERRO no Controller:", error);
        res.status(500).json({ erro: "Erro interno do servidor" });
    }
}

// Buscando dados consolidados
async function buscarDadosConsolidadosS3(idHospital) {
    const nomeArquivo = `hospital_${idHospital}_dados_servidores.json`;
    
    try {
        console.log(`📁 Buscando dados consolidados: ${nomeArquivo}`);
        const dados = await dashboardMacroModel.buscarDadosBucketMacro(nomeArquivo);
        
        if (dados && dados.length > 0 && dados[0].servidores) {
            console.log(`✅ Dados S3 carregados: ${dados[0].servidores.length} servidores`);
            return dados[0].servidores; // Retorna array de servidores
        }
        console.log('⚠️ Arquivo S3 vazio ou formato inválido');
        return [];
        
    } catch (error) {
        console.log('❌ Erro ao buscar dados consolidados:', error.message);
        return [];
    }
}

// Buscando por ID
function processarServidoresComS3(dadosServidores, dadosS3) {
    return dadosServidores.map(servidor => {
        // Dados padrão do banco (fallback)
        let cpu = servidor.limite_cpu || 0;
        let ram = servidor.limite_ram || 0; 
        let disco = servidor.limite_disco || 0;
        
        // Buscando dados S3 por ID do servidor
        if (dadosS3 && dadosS3.length > 0) {
            const servidorS3 = dadosS3.find(s => s.ServidorId === servidor.id);
            
            if (servidorS3) {
                cpu = servidorS3.Uso_de_Cpu || cpu;
                ram = servidorS3.Uso_de_RAM || ram;
                disco = servidorS3.Uso_de_Disco || disco;
                console.log(`✅ S3: ${servidor.nome} (ID:${servidor.id}) - CPU:${cpu}%, RAM:${ram}%, Disco:${disco}%`);
            } else {
                console.log(`📊 Servidor ${servidor.nome} (ID:${servidor.id}) - Dados do banco (não encontrado no S3)`);
            }
        }

        // CÁLCULO DE ALERTAS EM TEMPO REAL
        const limiteCpu = servidor.limite_cpu || 83.5;
        const limiteRam = servidor.limite_ram || 41.6;
        const limiteDisco = servidor.limite_disco || 85.0;
        
        const alertaCpu = cpu > limiteCpu;
        const alertaRam = ram > limiteRam;
        const alertaDisco = disco > limiteDisco;
        
        const temAlertasAtivos = alertaCpu || alertaRam || alertaDisco;
        const qtdAlertasAtivos = [alertaCpu, alertaRam, alertaDisco].filter(Boolean).length;

        console.log(`🔔 Servidor ${servidor.nome} - Alertas: CPU ${alertaCpu ? 'SIM' : 'não'}, RAM ${alertaRam ? 'SIM' : 'não'}, Disco ${alertaDisco ? 'SIM' : 'não'}`);

        return {
            id: servidor.id,
            nome: servidor.nome,
            status: temAlertasAtivos ? "alerta" : "normal",  
            cpu: cpu, 
            ram: ram, 
            disco: disco,  
            qtdAlertas: qtdAlertasAtivos,  
            tempoAlerta: temAlertasAtivos ? "Agora" : "--:--:--",  
            ip: servidor.ip,
            localizacao: servidor.localizacao,
            // DEBUG
            limites: {
                cpu: limiteCpu,
                ram: limiteRam, 
                disco: limiteDisco
            },
            alertas: {
                cpu: alertaCpu,
                ram: alertaRam,
                disco: alertaDisco
            }
        };
    });
}

// ROTA DO BUCKET
async function buscarDadosBucketMacro(req, res) {
    try {
        const fileKey = req.params.key;
        console.log(`📁 Buscando S3: ${fileKey}`);
        const dados = await dashboardMacroModel.buscarDadosBucketMacro(fileKey);
        res.json(dados);
    } catch (error) {
        console.error("❌ Erro S3:", error);
        res.status(500).json({ erro: "Erro ao buscar S3" });
    }
}

module.exports = {
    buscarDadosDashboard,
    buscarDadosBucketMacro
};