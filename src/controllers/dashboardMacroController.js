    var dashboardMacroModel = require("../models/dashboardMacroModel");
var database = require("../database/config");

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

        // BUSCA ARQUIVO S3 
        let dadosS3 = [];
        try {
            const nomeArquivo = await gerarNomeArquivoDinamico(idHospital);
            console.log(`📁 Buscando arquivo S3: ${nomeArquivo}`);
            dadosS3 = await dashboardMacroModel.buscarDadosBucketMacro(nomeArquivo);
            console.log(`✅ Dados S3 carregados: ${dadosS3.length} registros`);
        } catch (error) {
            console.log("❌ Erro S3:", error.message);
        }

        // PROCESSAMENTOS
        const servidores = processarServidoresComS3(dadosServidores, dadosS3);

        //  CALCULA ALERTAS EM TEMPO RELA
        const servidoresComAlertas = servidores.filter(s => s.status === "alerta").length;
        const totalAlertasAtivos = servidores.reduce((total, servidor) => total + servidor.qtdAlertas, 0);

        //  MANTÉM TENDÊNCIAS HISTÓRICAS DO BANCO
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
            }
        };

        console.log("KPIs - Tempo real:", {
            alertasAtivos: totalAlertasAtivos,
            servidoresRisco: servidoresComAlertas
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

// GERA NOME DO ARQUIVO DINÂMICO
async function gerarNomeArquivoDinamico(idHospital) {
    try {
        // Busca nome do hospital no banco
        const query = `SELECT nome FROM hospital WHERE idHospital = ${idHospital}`;
        const hospital = await database.executar(query);
        
        if (hospital.length > 0) {
            const nomeHospital = hospital[0].nome;
            const nomeFormatado = nomeHospital.replace(/\s+/g, '_');
            
            // PADRÃO: id_servidor_[nomeHospital]_1.json
            const nomeArquivo = `id_servidor_${nomeFormatado}_1.json`;
            console.log(`📁 Nome do arquivo gerado: ${nomeArquivo}`);
            return nomeArquivo;
        }
    } catch (error) {
        console.error('Erro ao buscar hospital:', error);
    }
    
    // FALLBACK: Se der erro, usa arquivo padrão
    console.log('📁 Usando arquivo padrão');
    return 'id_servidor_nomeHospital_1.json';
}

// PROCESSAMENTO DOS DADOS
function processarServidoresComS3(dadosServidores, dadosS3) {
    return dadosServidores.map(servidor => {
        // Dados padrão do banco
        let cpu = servidor.limite_cpu || 0;
        let ram = servidor.limite_ram || 0; 
        let disco = servidor.limite_disco || 0;
        
        let usoRealCpu = cpu;
        let usoRealRam = ram;
        let usoRealDisco = disco;

        //  SE TEM DADOS S3: USA DADOS REAIS
        if (dadosS3 && dadosS3.length > 0) {
            const ultimoDado = dadosS3[dadosS3.length - 1];
            usoRealCpu = ultimoDado.Uso_de_Cpu || cpu;
            usoRealRam = ultimoDado.Uso_de_RAM || ram;
            usoRealDisco = ultimoDado.Uso_de_Disco || disco;
            console.log(`✅ Servidor ${servidor.nome} - Dados S3: CPU ${usoRealCpu}%, RAM ${usoRealRam}%, Disco ${usoRealDisco}%`);
        } else {
            console.log(`📊 Servidor ${servidor.nome} - Dados do banco`);
        }

        //  CORREÇÃO: CALCULA ALERTAS EM TEMPO REAL
        const limiteCpu = servidor.limite_cpu || 80; // Fallback 80%
        const limiteRam = servidor.limite_ram || 80; // Fallback 80%
        const limiteDisco = servidor.limite_disco || 80; // Fallback 80%
        
        const alertaCpu = usoRealCpu > limiteCpu;
        const alertaRam = usoRealRam > limiteRam;
        const alertaDisco = usoRealDisco > limiteDisco;
        
        const temAlertasAtivos = alertaCpu || alertaRam || alertaDisco;
        const qtdAlertasAtivos = [alertaCpu, alertaRam, alertaDisco].filter(Boolean).length;

        console.log(`🔔 Servidor ${servidor.nome} - Alertas: CPU ${alertaCpu ? 'SIM' : 'não'}, RAM ${alertaRam ? 'SIM' : 'não'}, Disco ${alertaDisco ? 'SIM' : 'não'}`);

        return {
            id: servidor.id,
            nome: servidor.nome,
            status: temAlertasAtivos ? "alerta" : "normal",  
            cpu: usoRealCpu, 
            ram: usoRealRam, 
            disco: usoRealDisco,  
            qtdAlertas: qtdAlertasAtivos,  
            tempoAlerta: temAlertasAtivos ? "Agora" : "--:--:--",  
            ip: servidor.ip,
            localizacao: servidor.localizacao,
            //  DEBUG
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