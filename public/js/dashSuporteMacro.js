// Variáveis globais para armazenar dados
window.dadosServidores = [];
window.dadosDashboard = null;
window.dadosBucket = [];
window.pizzaChart = null;

document.addEventListener("DOMContentLoaded", async () => {
    
    // Configurações iniciais
    configurarPesquisa();
    configurarFiltros();
    configurarModais();
    
    // Primeira carga de dados
    await carregarTodosDados();
    
    // Atualização automática a cada 30 segundos
    setInterval(async () => {
        await carregarTodosDados();
    }, 30000);
});

// Carregando todos os dados
async function carregarTodosDados() {
    try {
        const idHospital = sessionStorage.FK_HOSPITAL;
        
        if (!idHospital) {
            console.error('❌ ID do hospital não encontrado no sessionStorage');
            mostrarErro('Sessão inválida. Faça login novamente.');
            return;
        }

        console.log(`📊 Atualizando dados do hospital ${idHospital}...`);

        // Busca dados do bucket E da dashboard
        const [dadosBucket, dadosDashboard] = await Promise.all([
            buscarDadosBucket(),
            buscarDadosDashboard(idHospital)
        ]);

        // Armazena globalmente
        window.dadosBucket = dadosBucket;
        window.dadosDashboard = dadosDashboard;
        window.dadosServidores = dadosDashboard.servidores;

        // Atualizando interface
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

// Buscando dados do Bucket 
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

// Buscando dados da dash
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

// Atualizandoo interface
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

// Atualizando KPI´s
function atualizarKPIs(kpis) {
    // KPI 1: Servidores em Risco
    const riscoElement = document.getElementById('valor-risco');
    if (riscoElement) {
        riscoElement.innerHTML = `${kpis.servidoresRisco}<span style="font-size: 1.2rem; color: var(--vv-muted);">/${kpis.totalServidores}</span>`;
        riscoElement.className = kpis.servidoresRisco > 0 ? 'kpi-value alert' : 'kpi-value ok';
    }

    // KPI 2: Alertas (modo geral)
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

// Configurando filtro de tendência
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
        // MODO GERAL: Alertas ativos no momento
        const alertasAtivos = kpis.alertasGerais || 0;
        
        valorElement.innerHTML = alertasAtivos.toString();
        valorElement.className = alertasAtivos > 0 ? 'kpi-value alert' : 'kpi-value ok';
        subtituloElement.textContent = 'Alertas ativos no momento';
        
    } else if (tipo === 'tendencia') {
        // MODO TENDÊNCIA
        const alertas24h = kpis.alertas24h || 0;
        const alertasAnterior = kpis.alertasAnterior || 0;
        const diferenca = alertas24h - alertasAnterior;
        
        // Determina símbolo e cor
        let simbolo = '=';
        let corClass = 'neutro';
        
        if (diferenca > 0) {
            simbolo = '▲';
            corClass = 'aumento';
        } else if (diferenca < 0) {
            simbolo = '▼';
            corClass = 'queda';
        }
        
        valorElement.innerHTML = `
            ${alertas24h}
            <span class="tendencia-badge ${corClass}">
                ${simbolo} ${Math.abs(diferenca)}
            </span>
        `;
        
        valorElement.className = 'kpi-value';
        subtituloElement.innerHTML = `Últimas 24h <span style="color: var(--vv-muted); font-size: 0.75rem;">(vs ${alertasAnterior} anteriores)</span>`;
        
        console.log('Tendência:', {
            novos: alertas24h,
            anteriores: alertasAnterior,
            diferenca: diferenca,
            simbolo: simbolo
        });
    }

    console.log(`🔄 Filtro alterado: ${tipo}`);
}

// Atualizando tabela de servidores
function atualizarTabela(servidores) {
    const tbody = document.querySelector('.tabela-corpo tbody');
    if (!tbody) {
        console.error('❌ Elemento tbody não encontrado');
        return;
    }

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

        // Dados dos componentes
        const cpuPercent = Math.round(servidor.cpu || 0);
        const ramPercent = Math.round(servidor.ram || 0);
        const discoPercent = Math.round(servidor.disco || 0);

        // Classes das barras (vermelho se tiver em alerta)
        const cpuClass = servidor.alertas?.cpu ? 'critico' : 'normal';
        const ramClass = servidor.alertas?.ram ? 'critico' : 'normal';
        const discoClass = servidor.alertas?.disco ? 'critico' : 'normal';

        // Status da Rede 
        const statusRede = servidor.statusRede || 'NORMAL';
        const statusRedeClass = statusRede === 'ALERTA' ? 'status-alerta' : 'status-normal';
        const statusRedeText = statusRede === 'ALERTA' ? '● Alerta' : '● Normal';
        const redeComAlerta = statusRede === 'ALERTA';
        const redeBtnClass = redeComAlerta ? 'btn-network btn-com-alerta' : 'btn-network';

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
                <button class="${redeBtnClass}" 
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

// Atualizando gráfico de pizza
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

// Atualizando total de servidores
function atualizarBadgeTotal(total) {
    const badgeTotal = document.querySelector('.badge-total');
    if (badgeTotal) {
        badgeTotal.textContent = total;
    }
}

// Redirecionamentos
function irParaMicro(servidorId, nomeServidor, idHospital) {
    window.location.href = `dashboardSuporteMicro.html?idServidor=${servidorId}&hostname=${nomeServidor}&idhospital=${idHospital}`;
}

function irParaDisco(servidorId, nomeServidor, idHospital) {
    window.location.href = `dashDisco.html?idServidor=${servidorId}&hostname=${nomeServidor}&idhospital=${idHospital}`;
}

function irParaRede(servidorId, nomeServidor, idHospital) {
    window.location.href = `dashRede.html?idServidor=${servidorId}&hostname=${nomeServidor}&idhospital=${idHospital}`;
}

// Barra de pesquisa
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

// Filtros (Maior alerta, maior CPU e etc)
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

// Configurando modais
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

// Funções para caso dê erro
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