// ============================================================================
// DASHBOARD SUPORTE MACRO - VERSÃO CONSOLIDADA E SINCRONIZADA
// ============================================================================

// Variáveis globais para armazenar dados
window.dadosServidores = [];
window.dadosDashboard = null;
window.dadosBucket = [];
window.pizzaChart = null;

// ============================================================================
// INICIALIZAÇÃO
// ============================================================================
document.addEventListener("DOMContentLoaded", async () => {
    console.log('🚀 Dashboard Suporte Macro carregado!');
    
    // Configurações iniciais
    configurarPesquisa();
    configurarFiltros();
    configurarModais();
    
    // Primeira carga de dados
    await carregarTodosDados();
    
    // Atualização automática a cada 3 segundos
    setInterval(async () => {
        await carregarTodosDados();
    }, 30000);
});

// ============================================================================
// FUNÇÃO PRINCIPAL - CARREGA TODOS OS DADOS
// ============================================================================
async function carregarTodosDados() {
    try {
        const idHospital = sessionStorage.FK_HOSPITAL;
        
        if (!idHospital) {
            console.error('❌ ID do hospital não encontrado no sessionStorage');
            mostrarErro('Sessão inválida. Faça login novamente.');
            return;
        }

        console.log(`📊 Atualizando dados do hospital ${idHospital}...`);

        // Busca dados do bucket E da dashboard em paralelo
        const [dadosBucket, dadosDashboard] = await Promise.all([
            buscarDadosBucket(),
            buscarDadosDashboard(idHospital)
        ]);

        // Armazena globalmente
        window.dadosBucket = dadosBucket;
        window.dadosDashboard = dadosDashboard;
        window.dadosServidores = dadosDashboard.servidores;

        // Atualiza interface
        atualizarInterface(dadosDashboard);

        console.log('✅ Atualização completa!', {
            servidores: dadosDashboard.servidores.length,
            alertasAtivos: dadosDashboard.kpis.alertasGerais,
            arquivosS3: dadosBucket.length
        });

    } catch (erro) {
        console.error('❌ Erro ao carregar dados:', erro);
        mostrarErro('Erro ao atualizar dados da dashboard');
    }
}

// ============================================================================
// BUSCAR DADOS DO BUCKET S3
// ============================================================================
async function buscarDadosBucket() {
    try {
        const res = await fetch('/servidores/dadosBucket');
        
        if (!res.ok) {
            throw new Error(`Erro HTTP: ${res.status}`);
        }
        
        const dados = await res.json();
        
        console.log(`📦 Bucket atualizado: ${dados.length} arquivos`);
        
        // Debug: mostra dados de cada servidor do bucket
        dados.forEach((arquivo, index) => {
            const content = arquivo.content;
            console.log(`  [${index}] ${content.Nome_da_Maquina || 'Sem nome'}:`, {
                CPU: content.Uso_de_Cpu,
                RAM: content.Uso_de_RAM,
                Disco: content.Uso_de_Disco,
                Data: content.Data_da_Coleta
            });
        });
        
        return dados;
        
    } catch (erro) {
        console.error('❌ Erro ao buscar bucket:', erro);
        return [];
    }
}

// ============================================================================
// BUSCAR DADOS DA DASHBOARD (API)
// ============================================================================
async function buscarDadosDashboard(idHospital) {
    try {
        const res = await fetch(`/servidores/dashboard-macro?hospital=${idHospital}`);
        
        if (!res.ok) {
            throw new Error(`Erro HTTP: ${res.status}`);
        }
        
        const dados = await res.json();
        
        console.log('📊 Dashboard API:', {
            totalServidores: dados.kpis.totalServidores,
            servidoresRisco: dados.kpis.servidoresRisco,
            alertasAtivos: dados.kpis.alertasGerais
        });
        
        return dados;
        
    } catch (erro) {
        console.error('❌ Erro ao buscar dashboard:', erro);
        throw erro;
    }
}

// ============================================================================
// ATUALIZAR INTERFACE COMPLETA
// ============================================================================
function atualizarInterface(dados) {
    if (!dados || !dados.kpis || !dados.servidores) {
        console.warn('⚠️ Dados incompletos, pulando atualização');
        return;
    }

    // Atualiza cada componente
    atualizarKPIs(dados.kpis);
    atualizarTabela(dados.servidores);
    atualizarGraficoPizza(dados.kpis.distribuicao);
    atualizarBadgeTotal(dados.kpis.totalServidores);
}

// ============================================================================
// ATUALIZAR KPIs
// ============================================================================
function atualizarKPIs(kpis) {
    // KPI 1: Servidores em Risco
    const riscoElement = document.getElementById('valor-risco');
    if (riscoElement) {
        riscoElement.innerHTML = `${kpis.servidoresRisco}<span style="font-size: 1.2rem; color: var(--vv-muted);">/${kpis.totalServidores}</span>`;
        riscoElement.className = kpis.servidoresRisco > 0 ? 'kpi-value alert' : 'kpi-value ok';
    }

    // KPI 2: Alertas (modo geral por padrão)
    const alertasElement = document.getElementById('valor-alertas');
    const subtituloElement = document.getElementById('subtitulo-alertas');
    
    if (alertasElement && subtituloElement) {
        const valorAlertas = kpis.alertasGerais || 0;
        alertasElement.innerHTML = valorAlertas.toString();
        alertasElement.className = valorAlertas > 0 ? 'kpi-value alert' : 'kpi-value ok';
        subtituloElement.textContent = 'Total de ocorrências';
    }

    console.log('📈 KPIs atualizados:', {
        risco: `${kpis.servidoresRisco}/${kpis.totalServidores}`,
        alertas: kpis.alertasGerais
    });
}

// ============================================================================
// ALTERNAR FILTRO DE ALERTAS (Geral vs Tendência)
// ============================================================================
function alterarFiltroAlertas(tipo) {
    const valorElement = document.getElementById('valor-alertas');
    const subtituloElement = document.getElementById('subtitulo-alertas');

    if (!window.dadosDashboard || !window.dadosDashboard.kpis) {
        console.warn('⚠️ Dados não carregados ainda');
        valorElement.innerHTML = '0';
        return;
    }

    const kpis = window.dadosDashboard.kpis;

    if (tipo === 'geral') {
        // MODO GERAL: Alertas ativos agora
        const alertasAtivos = kpis.alertasGerais || 0;
        valorElement.innerHTML = alertasAtivos.toString();
        valorElement.className = alertasAtivos > 0 ? 'kpi-value alert' : 'kpi-value ok';
        subtituloElement.textContent = 'Alertas ativos no momento';
        
    } else if (tipo === 'tendencia') {
        // MODO TENDÊNCIA: Alertas nas últimas 24h com direção correta
        const alertas24h = kpis.alertas24h || 0;
        const tendencia = kpis.tendenciaAlertas || '0';
        
        // LÓGICA CORRETA:
        // ▲ (aumento) = RUIM = vermelho (#e63946)
        // ▼ (diminuição) = BOM = verde (#2ecc71)
        // = (manteve) = neutro
        let tendenciaClass = '';
        if (tendencia.includes('▲')) {
            tendenciaClass = 'aumento';  // Vermelho - piorou
        } else if (tendencia.includes('▼')) {
            tendenciaClass = 'queda';    // Verde - melhorou
        }
        
        // Monta HTML com espaçamento adequado
        valorElement.innerHTML = `${alertas24h} <span class="tendencia ${tendenciaClass}">${tendencia}</span>`;
        valorElement.className = 'kpi-value'; // Remove classe alert/ok para não sobrescrever cor
        subtituloElement.textContent = 'Novos alertas (últimas 24h)';
        
        console.log('📊 Tendência aplicada:', {
            alertas24h: alertas24h,
            simbolo: tendencia,
            classe: tendenciaClass,
            cor: tendenciaClass === 'aumento' ? '🔴 Vermelho (piorou)' : '🟢 Verde (melhorou)'
        });
    }

    console.log(`🔄 Filtro alterado: ${tipo}`);
}

// ============================================================================
// ATUALIZAR TABELA DE SERVIDORES
// ============================================================================
function atualizarTabela(servidores) {
    const tbody = document.querySelector('.tabela-corpo tbody');
    if (!tbody) {
        console.error('❌ Elemento tbody não encontrado');
        return;
    }

    // Limpa loading
    tbody.innerHTML = '';

    if (!servidores || servidores.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="11" style="text-align: center; padding: 40px; color: #666;">
                    Nenhum servidor cadastrado
                </td>
            </tr>
        `;
        return;
    }

    console.log(`🖥️ Renderizando ${servidores.length} servidores...`);

    servidores.forEach(servidor => {
        const tr = document.createElement('tr');

        // Status do servidor
        const temAlertas = servidor.qtdAlertas > 0;
        const statusClass = temAlertas ? 'alerta' : 'normal';
        const statusText = temAlertas ? '● Em Alerta' : '● Normal';

        // Valores de recursos
        const cpuPercent = Math.round(servidor.cpu || 0);
        const ramPercent = Math.round(servidor.ram || 0);
        const discoPercent = Math.round(servidor.disco || 0);

        // Classes das barras (vermelho se em alerta)
        const cpuClass = servidor.alertas?.cpu ? 'critico' : 'normal';
        const ramClass = servidor.alertas?.ram ? 'critico' : 'normal';
        const discoClass = servidor.alertas?.disco ? 'critico' : 'normal';

        // Status da Rede (simulado - você pode integrar com Jira depois)
        const statusRede = 'NORMAL'; // ou pegar de servidor.statusRede se vier da API
        const statusRedeClass = statusRede === 'ALERTA' ? 'status-alerta' : 'status-normal';
        const statusRedeText = statusRede === 'ALERTA' ? '● Alerta' : '● Normal';

        // Animação nos botões se tiver alerta
        const servidorComAlerta = servidor.alertas?.cpu || servidor.alertas?.ram;
        const discoComAlerta = servidor.alertas?.disco;

        const servidorTooltip = servidorComAlerta ? '⚠️ CPU ou RAM em alerta - Clique para detalhes' : 'Ver detalhes do servidor';
        const discoTooltip = discoComAlerta ? '⚠️ Disco em alerta - Clique para detalhes' : 'Ver detalhes do disco';

        tr.innerHTML = `
            <td class="nomeServidor"><a>${servidor.nome}</a></td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            <td>
                <div class="barra-progresso">
                    <div class="barra-uso ${cpuClass}" style="width: ${cpuPercent}%;">
                        ${cpuPercent}%
                    </div>
                </div>
            </td>
            <td>
                <div class="barra-progresso">
                    <div class="barra-uso ${ramClass}" style="width: ${ramPercent}%;">
                        ${ramPercent}%
                    </div>
                </div>
            </td>
            <td>
                <div class="barra-progresso">
                    <div class="barra-uso ${discoClass}" style="width: ${discoPercent}%;">
                        ${discoPercent}%
                    </div>
                </div>
            </td>
            <td><span class="alerta-badge">${servidor.qtdAlertas}</span></td>
            <td>${servidor.tempoAlerta || '--:--:--'}</td>
            <td><span class="status-badge ${statusRedeClass}">${statusRedeText}</span></td>
            <td class="coluna-icone">
                <button class="btn-server ${servidorComAlerta ? 'btn-com-alerta' : ''}" 
                        onclick="irParaMicro('${servidor.id}','${servidor.nome}','${sessionStorage.FK_HOSPITAL}')"
                        title="${servidorTooltip}">
                    <img src="assets/dashboard-icons/servidorIcon.jpg" style="width: 20px;" alt="Servidor">
                </button>
            </td>
            <td class="coluna-icone">
                <button class="btn-disk ${discoComAlerta ? 'btn-com-alerta' : ''}" 
                        onclick="irParaDisco('${servidor.id}','${servidor.nome}','${sessionStorage.FK_HOSPITAL}')"
                        title="${discoTooltip}">
                    <img src="assets/dashboard-icons/disco.jpg" style="width: 20px;" alt="Disco">
                </button>
            </td>
            <td class="coluna-icone">
                <button class="btn-network" 
                        onclick="irParaRede('${servidor.id}','${servidor.nome}','${sessionStorage.FK_HOSPITAL}')"
                        title="Ver detalhes da rede">
                    <img src="assets/dashboard-icons/redeIcon.jpg" style="width: 20px;" alt="Rede">
                </button>
            </td>
        `;

        tbody.appendChild(tr);
    });

    console.log('✅ Tabela renderizada com sucesso');
}

// ============================================================================
// ATUALIZAR GRÁFICO DE PIZZA (STATUS DOS SERVIDORES)
// ============================================================================
function atualizarGraficoPizza(distribuicao) {
    const ctx = document.getElementById('graficoPizza');
    if (!ctx) {
        console.error('❌ Canvas do gráfico não encontrado');
        return;
    }

    // Destrói gráfico anterior se existir
    if (window.pizzaChart) {
        window.pizzaChart.destroy();
    }

    const total = distribuicao.normais + distribuicao.alertas;
    const percentNormais = total > 0 ? Math.round((distribuicao.normais / total) * 100) : 0;
    const percentAlertas = total > 0 ? Math.round((distribuicao.alertas / total) * 100) : 0;

    console.log('📊 Gráfico:', {
        normais: distribuicao.normais,
        alertas: distribuicao.alertas,
        total: total,
        '%': `${percentAlertas}% alerta, ${percentNormais}% normal`
    });

    window.pizzaChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: [
                `${percentAlertas}% Em Alerta`,
                `${percentNormais}% Normal`
            ],
            datasets: [{
                data: [percentAlertas, percentNormais],
                backgroundColor: ['#f75454', '#32b9cd'],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        font: { size: 12 },
                        padding: 10
                    }
                },
                title: {
                    display: true,
                    text: 'Status Geral dos Servidores',
                    font: {
                        size: 16,
                        weight: 'bold'
                    },
                    color: '#333'
                }
            }
        }
    });
}

// ============================================================================
// ATUALIZAR BADGE DE TOTAL DE SERVIDORES
// ============================================================================
function atualizarBadgeTotal(total) {
    const badgeTotal = document.querySelector('.badge-total');
    if (badgeTotal) {
        badgeTotal.textContent = total;
    }
}

// ============================================================================
// FUNÇÕES DE REDIRECIONAMENTO
// ============================================================================
function irParaMicro(servidorId, nomeServidor, idHospital) {
    window.location.href = `dashboardSuporteMicro.html?idServidor=${servidorId}&hostname=${nomeServidor}&idhospital=${idHospital}`;
}

function irParaDisco(servidorId, nomeServidor, idHospital) {
    window.location.href = `dashDisco.html?idServidor=${servidorId}&hostname=${nomeServidor}&idhospital=${idHospital}`;
}

function irParaRede(servidorId, nomeServidor, idHospital) {
    window.location.href = `dashRede.html?idServidor=${servidorId}&hostname=${nomeServidor}&idhospital=${idHospital}`;
}

// ============================================================================
// SISTEMA DE PESQUISA
// ============================================================================
function configurarPesquisa() {
    const inputPesquisa = document.querySelector('.input-pesquisa');
    if (inputPesquisa) {
        inputPesquisa.addEventListener('input', pesquisarServidores);
    }
}

function pesquisarServidores() {
    const input = document.querySelector('.input-pesquisa');
    const filtro = input.value.toLowerCase().trim();
    const linhas = document.querySelectorAll('.tabela-corpo tbody tr');

    linhas.forEach(linha => {
        const texto = linha.textContent.toLowerCase();
        linha.style.display = texto.includes(filtro) ? '' : 'none';
    });

    console.log(`🔍 Pesquisa: "${filtro}"`);
}

// ============================================================================
// SISTEMA DE FILTROS
// ============================================================================
function configurarFiltros() {
    const filtros = document.querySelectorAll('.aba');

    filtros.forEach(filtro => {
        filtro.addEventListener('click', function(e) {
            e.preventDefault();

            // Remove classe ativa de todos
            filtros.forEach(f => f.classList.remove('ativa'));

            // Adiciona classe ativa no clicado
            this.classList.add('ativa');

            const tipoFiltro = this.dataset.filtro;
            aplicarFiltro(tipoFiltro);
        });
    });
}

function aplicarFiltro(tipo) {
    if (!window.dadosServidores || window.dadosServidores.length === 0) {
        console.warn('⚠️ Dados não carregados ainda');
        return;
    }

    let servidoresFiltrados = [...window.dadosServidores];

    switch(tipo) {
        case 'alerta':
            servidoresFiltrados = servidoresFiltrados.filter(s => s.qtdAlertas > 0);
            break;
        case 'cpu':
            servidoresFiltrados.sort((a, b) => (b.cpu || 0) - (a.cpu || 0));
            break;
        case 'ram':
            servidoresFiltrados.sort((a, b) => (b.ram || 0) - (a.ram || 0));
            break;
        case 'disco':
            servidoresFiltrados.sort((a, b) => (b.disco || 0) - (a.disco || 0));
            break;
        case 'alertas':
            servidoresFiltrados.sort((a, b) => (b.qtdAlertas || 0) - (a.qtdAlertas || 0));
            break;
        case 'todos':
        default:
            // Mantém ordem original
            break;
    }

    console.log(`🔽 Filtro aplicado: ${tipo} (${servidoresFiltrados.length} servidores)`);
    atualizarTabela(servidoresFiltrados);
}

// ============================================================================
// SISTEMA DE MODAIS DE INFORMAÇÃO
// ============================================================================
function configurarModais() {
    const infoBtns = document.querySelectorAll('.infoBtn');
    const modals = document.querySelectorAll('.modal');
    const closeBtns = document.querySelectorAll('.closeBtn');

    infoBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.target;
            const modal = document.getElementById(target);
            if (modal) {
                modal.style.display = 'flex';
            }
        });
    });

    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            btn.closest('.modal').style.display = 'none';
        });
    });

    modals.forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
}

// ============================================================================
// FUNÇÃO DE ERRO
// ============================================================================
function mostrarErro(mensagem) {
    const tbody = document.querySelector('.tabela-corpo tbody');
    if (tbody) {
        tbody.innerHTML = `
            <tr>
                <td colspan="11" style="text-align: center; padding: 40px; color: #e74c3c;">
                    <div style="display: flex; flex-direction: column; align-items: center; gap: 10px;">
                        <div style="font-size: 18px;">⚠️ ${mensagem}</div>
                        <div style="font-size: 12px; color: #666;">Verifique sua conexão e tente novamente</div>
                    </div>
                </td>
            </tr>
        `;
    }
}