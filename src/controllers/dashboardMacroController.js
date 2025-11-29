var dashboardMacroModel = require("../models/dashboardMacroModel");
var database = require("../database/config");
const jiraService = require("../services/jiraService"); 

async function listarArquivosBucket(req, res) {
  const bucketName = process.env.AWS_BUCKET_NAME;

  try {
    const arquivos = await dashboardMacroModel.pegarTodosArquivosBucket(bucketName);
    res.json(arquivos);
  } catch (error) {
    console.error("Erro ao listar arquivos do bucket:", error);
    res.status(500).send("Erro ao listar arquivos");
  }
}

async function buscarDadosDashboard(req, res) {
    try {
        console.log("CONTROLLER: Buscando dados do Dashboard Macro...");

        const idHospital = req.query.hospital;
        console.log("ID Hospital:", idHospital);
        
        if (!idHospital) {
            return res.status(400).json({ erro: "ID do hospital não fornecido" });
        }

        // Buscando dados do banco
        const [dadosServidores, dadosKPIs, alertasGeraisResult] = await Promise.all([
            dashboardMacroModel.buscarDadosDashboard(idHospital),
            dashboardMacroModel.buscarKPIs(idHospital),
            dashboardMacroModel.buscarAlertasGerais(idHospital)
        ]);

        console.log("✅ Dados do banco buscados!");
        console.log(`📊 ${dadosServidores.length} servidores encontrados no banco`);

        // Buscando dados do Bucket
        let dadosS3 = [];
        try {
            dadosS3 = await buscarDadosConsolidadosS3();
            console.log(`✅ S3: ${dadosS3.length} arquivos carregados`);
        } catch (error) {
            console.log("❌ Erro S3:", error.message);
        }

        // Pegando dados do JIRA pra rede
        let statusRede = { abertos: 0, resolvidos: 0, total: 0 };
        try {
            statusRede = await jiraService.contarAlertasRede();
            console.log(`✅ Jira: ${statusRede.total} tickets encontrados`);
        } catch (error) {
            console.log("⚠️ Jira não disponível:", error.message);
        }

        // ====================================================================
        // DEBUG: MOSTRA SERVIDORES DO BANCO
        // ====================================================================
        console.log("\n🔍 SERVIDORES DO BANCO:");
        dadosServidores.forEach(s => {
            console.log(`   [ID: ${s.id}] ${s.nome} - IP: ${s.ip}`);
        });

        // ====================================================================
        // DEBUG: MOSTRA SERVIDORES DO S3
        // ====================================================================
        console.log("\n📦 ARQUIVOS DO S3:");
        if (dadosS3.length > 0) {
            dadosS3.forEach(s => {
                console.log(`   [Arquivo ID: ${s.ServidorIdArquivo}] ${s.Hostname} (${s.Nome_da_Maquina}) - CPU: ${s.Uso_de_Cpu}%, RAM: ${s.Uso_de_RAM}%, Disco: ${s.Uso_de_Disco}%`);
            });
        } else {
            console.log("   ⚠️ Nenhum arquivo no S3");
        }

        // Processando servidores
        const servidores = processarServidoresComS3(dadosServidores, dadosS3);

        // Calculando as KPI´s
        const servidoresComAlertas = servidores.filter(s => s.status === "alerta").length;
        const totalAlertasAtivos = servidores.reduce((total, s) => total + s.qtdAlertas, 0);

        // Mantendo as tendências para fazer o calculo no banco
        const alertas24h = dadosKPIs[0]?.alertas_24h || 0;
const alertasAnterior = dadosKPIs[0]?.alertas_anterior || 0;
const alertasAtivosDB = dadosKPIs[0]?.alertas_ativos_agora || 0;

const diferenca = alertas24h - alertasAnterior;
const simbolo = diferenca > 0 ? '▲' : (diferenca < 0 ? '▼' : '=');
const cor = diferenca > 0 ? 'aumento' : (diferenca < 0 ? 'queda' : 'neutro');
const tendenciaAlertas = diferenca !== 0 ? `${simbolo}${Math.abs(diferenca)}` : '0';

const kpis = {
    // Calculando em tempo real os servidores com alertas
    servidoresRisco: servidoresComAlertas,
    alertasGerais: totalAlertasAtivos,  // Calculado em tempo real
    
    // Histórico do banco de dados
    alertas24h: alertas24h,               
    alertasAnterior: alertasAnterior,     
    tendenciaAlertas: tendenciaAlertas,  
    tendenciaCor: cor,                     
    alertasAtivosDB: alertasAtivosDB,
            
            // Status de rede e total de servidor
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

        console.log("\n📊 KPIs CALCULADOS:");
        console.log(`   Servidores em Risco: ${servidoresComAlertas}/${kpis.totalServidores}`);
        console.log(`   Alertas Ativos: ${totalAlertasAtivos}`);
        console.log(`   Rede: ${statusRede.abertos > 0 ? 'ALERTA' : 'OK'}`);
        
        console.log("\n✅ Enviando resposta para frontend...\n");

        res.json({
            kpis: kpis,
            servidores: servidores,
            metricasS3: dadosS3.length > 0 ? 'Dados em tempo real' : 'Dados do banco'
        });

    } catch (error) {
        console.error("\n❌ ERRO CRÍTICO no Controller:", error);
        res.status(500).json({ erro: "Erro interno do servidor", detalhes: error.message });
    }
}

// Buscando dados do Bucket
async function buscarDadosConsolidadosS3() {
    try {
        const bucketName = process.env.AWS_BUCKET_NAME;

        // Pega todos os arquivos do bucket
        const arquivos = await dashboardMacroModel.pegarTodosArquivosBucket(bucketName);

        if (!arquivos || arquivos.length === 0) {
            console.log("⚠️ Bucket vazio ou inacessível");
            return [];
        }

        // Transforma cada arquivo extraindo ID e hostname do nome
        const dados = arquivos
            .map(arq => {
                const c = arq.content || {};

                // ============================================================
                // EXTRAI ID E HOSTNAME DO NOME DO ARQUIVO
                // Exemplo: "1_srv1_hsl_componentes.json" --> ID=1, hostname=srv1
                // Padrão: suporte/macro/componentes/[ID]_[hostname]_[hospital]_componentes.json
                // ============================================================
                let servidorIdArquivo = null;
                let hostnameArquivo = null;
                
                if (arq.key) {
                    // Pega só o nome do arquivo (última parte do caminho)
                    const nomeArquivo = arq.key.split('/').pop();
                    
                    // Extrai ID e hostname: "1_srv1_hsl_componentes.json" por exemplo
                    const match = nomeArquivo.match(/^(\d+)_([^_]+)_/);
                    
                    if (match) {
                        servidorIdArquivo = parseInt(match[1]);  
                        hostnameArquivo = match[2];             
                    }
                }

                return {
                    ServidorIdArquivo: servidorIdArquivo,  
                    Hostname: hostnameArquivo,              
                    Nome_da_Maquina: c.Nome_da_Maquina || null,  
                    Uso_de_Cpu: c.Uso_de_Cpu ? Number(c.Uso_de_Cpu) : 0,
                    Uso_de_RAM: c.Uso_de_RAM ? Number(c.Uso_de_RAM) : 0,
                    Uso_de_Disco: c.Uso_de_Disco ? Number(c.Uso_de_Disco) : 0,
                    Data_da_Coleta: c.Data_da_Coleta || null,
                    _s3_key: arq.key // debug
                };
            })
            .filter(s => s.Hostname !== null); 

        return dados;

    } catch (error) {
        console.error("❌ Erro ao buscar S3:", error);
        return [];
    }
}

// Processando servidores
function processarServidoresComS3(dadosServidores, dadosS3) {
    return dadosServidores.map(servidor => {
        
        // Valores padrão do banco (fallback)
        let cpu = 0;
        let ram = 0; 
        let disco = 0;
        let fonteDados = 'banco';
        let dataColeta = null;
        
        // Buscando dados do Bucket pelo hostname do servidor
        if (dadosS3 && dadosS3.length > 0) {
            const servidorS3 = dadosS3.find(s => 
                s.Hostname && 
                s.Hostname.toLowerCase() === servidor.nome.toLowerCase()
            );
            
            if (servidorS3) {
                cpu = servidorS3.Uso_de_Cpu || 0;
                ram = servidorS3.Uso_de_RAM || 0;
                disco = servidorS3.Uso_de_Disco || 0;
                dataColeta = servidorS3.Data_da_Coleta;
                fonteDados = 'S3';
                console.log(`✅ [Banco ID: ${servidor.id}] ${servidor.nome} ← Match com arquivo [${servidorS3.ServidorIdArquivo}_${servidorS3.Hostname}_...] - CPU: ${cpu}%, RAM: ${ram}%, Disco: ${disco}%`);
            } else {
                console.log(`⚠️ [Banco ID: ${servidor.id}] ${servidor.nome} - Nenhum arquivo S3 encontrado (esperado: *_${servidor.nome}_*.json)`);
            }
        }

        // Limites do banco (parametrização padrao caso nao tenha sido cadastrado)
        const limiteCpu = servidor.limite_cpu ? Number(servidor.limite_cpu) : 83.5;
        const limiteRam = servidor.limite_ram ? Number(servidor.limite_ram) : 41.6;
        const limiteDisco = servidor.limite_disco ? Number(servidor.limite_disco) : 85.0;

       // Calculando alertas (em tempo real)
        const alertaCpu = cpu > limiteCpu;
        const alertaRam = ram > limiteRam;
        const alertaDisco = disco > limiteDisco;
        
        const temAlertasAtivos = alertaCpu || alertaRam || alertaDisco;
        const qtdAlertasAtivos = [alertaCpu, alertaRam, alertaDisco].filter(Boolean).length;

        // Se tem alertas ativos e temos data de coleta do Bucket, calcula tempo.
        let tempoAlerta = "--:--:--";
        
        if (temAlertasAtivos && dataColeta) {
            try {
                const dataColetaDate = new Date(dataColeta);
                const agora = new Date();
                const diffMs = agora - dataColetaDate;
                
                const horas = Math.floor(diffMs / (1000 * 60 * 60));
                const minutos = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                const segundos = Math.floor((diffMs % (1000 * 60)) / 1000);
                
                tempoAlerta = `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
            } catch (error) {
                console.error(`❌ Erro ao calcular tempo para ${servidor.nome}:`, error);
                tempoAlerta = "Agora";
            }
        } else if (temAlertasAtivos) {
            tempoAlerta = "Agora";
        }

        // Log de alertas
        if (temAlertasAtivos) {
            console.log(`🚨 [${servidor.nome}] ALERTAS DETECTADOS (há ${tempoAlerta}):`, {
                CPU: alertaCpu ? `${cpu}% > ${limiteCpu}% ⚠️` : 'OK',
                RAM: alertaRam ? `${ram}% > ${limiteRam}% ⚠️` : 'OK',
                Disco: alertaDisco ? `${disco}% > ${limiteDisco}% ⚠️` : 'OK'
            });
        }

        return {
            id: servidor.id,
            nome: servidor.nome,
            status: temAlertasAtivos ? "alerta" : "normal",  
            cpu: Math.round(cpu), 
            ram: Math.round(ram), 
            disco: Math.round(disco),  
            qtdAlertas: qtdAlertasAtivos,  
            tempoAlerta: tempoAlerta,  
            ip: servidor.ip,
            localizacao: servidor.localizacao,
            fonteDados: fonteDados,
            dataColeta: dataColeta,
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

// rota pro Bucket
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
    buscarDadosBucketMacro,
    listarArquivosBucket
};