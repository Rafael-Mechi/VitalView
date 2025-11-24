async function carregarDashboard() {
    try {
        console.log('Buscando dados do dashboard macro...');

        const idHospital = sessionStorage.FK_HOSPITAL;
        
        if (!idHospital) {
            console.error('ID do hospital não encontrado no sessionStorage');
            return;
        }

        // buscando tudo em uma rota só
        const res = await fetch(`/servidores/dashboard-macro?hospital=${idHospital}`);
        const dadosCompletos = await res.json();

        console.log('Dados completos:', dadosCompletos);

        // Processa os dados
        window.dadosServidores = dadosCompletos.servidores;
        
        // Atualiza a interface
        atualizarKPIs(dadosCompletos.kpis);
        atualizarTabela(dadosCompletos.servidores);
        atualizarGrafico(dadosCompletos.kpis.distribuicao);

    } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
    }
}

function alterarFiltroAlertas(tipo) {
    console.log('Filtro:', tipo);
    console.log('Dados salvos:', window.dadosDashboard);

    const valorElement = document.getElementById('valor-alertas');
    const subtituloElement = document.getElementById('subtitulo-alertas');
    
    if (!window.dadosDashboard || !window.dadosDashboard.kpis) {
        console.log('Dados não carregados ainda...');
        valorElement.innerHTML = '0';
        return;
    }
    
    const kpis = window.dadosDashboard.kpis;
    console.log('KPIs disponíveis:', kpis);

    if (tipo === 'geral') {
        // MOSTRA ALERTAS ATIVOS AGORA 
        const alertasAtivos = kpis.alertasGerais;
        console.log('Alertas Ativos (tempo real):', alertasAtivos);
        
        valorElement.innerHTML = alertasAtivos.toString();
        subtituloElement.textContent = 'Alertas ativos no momento';
        
    } else if (tipo === 'tendencia') {
        //MOSTRA TENDÊNCIA HISTÓRICA
        const tendenciaClass = kpis.tendenciaAlertas.includes('+') ? 'aumento' : 'queda';
        valorElement.innerHTML = `${kpis.alertas24h}<span class="tendencia ${tendenciaClass}">${kpis.tendenciaAlertas}</span>`;
        subtituloElement.textContent = 'Novos alertas (últimas 24h)';
    }
    
    console.log('Filtro aplicado com sucesso!!!');
}

// Atualizar KPIs
function atualizarKPIs(kpis) {
    console.log('KPIs recebidos para salvar:', kpis);
    
    // Servidores em Risco
    const servidoresRiscoElement = document.getElementById('valor-risco');
    if (servidoresRiscoElement) {
        servidoresRiscoElement.innerHTML = `${kpis.servidoresRisco}<span style="font-size: 1.2rem; color: var(--vv-muted);">/${kpis.totalServidores}</span>`;
        
        // Adicionar classe de cor baseado no status
        servidoresRiscoElement.className = kpis.servidoresRisco > 0 ? 'kpi-value alert' : 'kpi-value ok';
    }

    // Alertas
    const valorElement = document.getElementById('valor-alertas');
    const subtituloElement = document.getElementById('subtitulo-alertas');
    if (valorElement && subtituloElement) {
        if (kpis.alertasGerais === undefined || kpis.alertasGerais === null) {
            valorElement.innerHTML = '0';
            valorElement.className = 'kpi-value ok';
        } else {
            valorElement.innerHTML = `${kpis.alertasGerais}`;
            valorElement.className = kpis.alertasGerais > 0 ? 'kpi-value alert' : 'kpi-value ok';
        }
        subtituloElement.textContent = 'Total de ocorrências';
    }

    // Total de servidores
    const badgeTotal = document.querySelector('.badge-total');
    if (badgeTotal) {
        badgeTotal.textContent = kpis.totalServidores;
    }

    window.dadosDashboard = { 
        kpis: kpis 
    };
    
    console.log('Dados salvos em window.dadosDashboard:', window.dadosDashboard);
}

// Atualizar Tabela
function atualizarTabela(servidores) {
    const tbody = document.querySelector('.tabela-corpo tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    for (let i = 0; i < servidores.length; i++) {
        const servidor = servidores[i];
        const tr = document.createElement('tr');

        const temAlertas = servidor.qtdAlertas > 0;
        const statusClass = temAlertas ? 'alerta' : 'normal';
        const statusText = temAlertas ? '● Em Alerta' : '● Normal';

        const cpuPercent = servidor.cpu || 0;
        const ramPercent = servidor.ram || 0;
        const discoPercent = servidor.disco || 0;

        // Classes para as barras
        const cpuClass = servidor.alertas && servidor.alertas.cpu ? 'critico' : 'normal';
        const ramClass = servidor.alertas && servidor.alertas.ram ? 'critico' : 'normal';
        const discoClass = servidor.alertas && servidor.alertas.disco ? 'critico' : 'normal';

        // Status da Rede
        const statusRede = Math.random() > 0.7 ? 'ALERTA' : 'NORMAL';
        const statusRedeClass = statusRede === 'ALERTA' ? 'status-alerta' : 'status-normal';
        const statusRedeText = statusRede === 'ALERTA' ? '● Alerta' : '● Normal';

        // Recuperar as classes de alerta para os botões (para deixar a animação funcionando)
        const servidorComAlerta = (servidor.alertas && servidor.alertas.cpu) || (servidor.alertas && servidor.alertas.ram);
        const discoComAlerta = (servidor.alertas && servidor.alertas.disco);
        
        const servidorTooltip = servidorComAlerta ? '⚠️ CPU ou RAM em alerta - Clique para detalhes' : 'Ver detalhes do servidor';
        const discoTooltip = discoComAlerta ? '⚠️ Disco em alerta - Clique para detalhes' : 'Ver detalhes do disco';
        const redeTooltip = 'Ver detalhes da rede';

        console.log(`Servidor ${servidor.nome} - Status Rede: ${statusRede}`);

        tr.innerHTML = `
            <td class="nomeServidor"><a>${servidor.nome}</a></td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            <td>
                <div class="barra-progresso">
                    <div class="barra-uso ${cpuClass}" style="width: ${cpuPercent}%;">
                        <p>${cpuPercent}%</p>
                    </div>
                </div>
            </td>
            <td>
                <div class="barra-progresso">
                    <div class="barra-uso ${ramClass}" style="width: ${ramPercent}%;">${ramPercent}%</div>
                </div>
            </td>
            <td>
                <div class="barra-progresso">
                    <div class="barra-uso ${discoClass}" style="width: ${discoPercent}%;">${discoPercent}%</div>
                </div>
            </td>
            <td><span class="alerta-badge">${servidor.qtdAlertas}</span></td>
            <td>${servidor.tempoAlerta}</td>
            <td><span class="status-badge ${statusRedeClass}">${statusRedeText}</span></td>
            <td>
                <div class="btn-grupo">
                    <button class="btn-server ${servidorComAlerta ? 'btn-com-alerta' : ''}" 
                            onclick="irParaMicro('${servidor.id}','${servidor.nome}','${sessionStorage.FK_HOSPITAL}')"
                            title="${servidorTooltip}">
                        <img src="assets/dashboard-icons/servidorIcon.jpg" style="width: 20px;" alt="Servidor">
                    </button>
                    <button class="btn-disk ${discoComAlerta ? 'btn-com-alerta' : ''}" 
                            onclick="irParaDisco('${servidor.id}','${servidor.nome}','${sessionStorage.FK_HOSPITAL}')"
                            title="${discoTooltip}">
                        <img src="assets/dashboard-icons/disco.jpg" style="width: 20px;" alt="Disco">
                    </button>
                    <button class="btn-network" 
                            onclick="irParaRede('${servidor.id}','${servidor.nome}','${sessionStorage.FK_HOSPITAL}')"
                            title="${redeTooltip}">
                        <img src="assets/dashboard-icons/redeIcon.jpg" style="width: 20px;" alt="Rede">
                    </button>
                </div>
            </td>
        `;

        tbody.appendChild(tr);
    }

    if (servidores.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align: center; padding: 40px; color: #666;">
                    Nenhum servidor cadastrado
                </td>
            </tr>
        `;
    }
}

// Funções para redirecionamento das dash
function irParaMicro(servidorId, nomeServidor, idHospital) {
    window.location.href = `dashboardSuporteMicro.html?idServidor=${servidorId}&hostname=${nomeServidor}&idhospital=${idHospital}`;
}

function irParaDisco(servidorId,nomeServidor, idHospital) {
    window.location.href = `dashDisco.html?idServidor=${servidorId}&hostname=${nomeServidor}&idhospital=${idHospital}`;
}

function irParaRede(servidorId, nomeServidor, idHospital) {
    window.location.href = `dashRede.html?idServidor=${servidorId}&hostname=${nomeServidor}&idhospital=${idHospital}`
}


// Atualizar Gráfico
function atualizarGrafico(distribuicao) {
    const ctx = document.getElementById('graficoPizza');
    if (!ctx) return;

    // Calclando porcentagens
    const total = distribuicao.normais + distribuicao.alertas; 
    const percentNormais = total > 0 ? Math.round((distribuicao.normais / total) * 100) : 0;
    const percentAlertas = total > 0 ? Math.round((distribuicao.alertas / total) * 100) : 0;

    console.log('Dados do gráfico:', {
        normais: distribuicao.normais,
        alertas: distribuicao.criticos,
        total: total,
        percentNormais: percentNormais + '%',
        percentAlertas: percentAlertas + '%'
    });

    window.pizzaChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: [
                `${percentAlertas}% Em Alerta`,
                `${percentNormais}% Normal`
            ],
            datasets: [{
                data: [percentAlertas, percentNormais],
                backgroundColor: ['#f75454', '#32b9cd'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: false,
            plugins: {
                legend: {
                    position: 'right'
                },
                title: {
                    display: true,
                    text: 'Distribuição de Status',
                    font: {
                        size: 17,
                        weight: 'bold',
                    },
                    color: 'black'
                }
            }
        }
    });
}

// Sistema da barra de pesquisa
function pesquisarServidores() {
    const input = document.querySelector('.input-pesquisa');
    const filtro = input.value.toLowerCase();
    const linhas = document.querySelectorAll('.tabela-corpo tbody tr');

    for (let i = 0; i < linhas.length; i++) {
        const linha = linhas[i];
        const texto = linha.textContent.toLowerCase();
        linha.style.display = texto.includes(filtro) ? '' : 'none';
    }
}

// Filtros
function configurarFiltros() {
    const filtros = document.querySelectorAll('.aba');

    for (let i = 0; i < filtros.length; i++) {
        filtros[i].addEventListener('click', function (e) {
            e.preventDefault();

            // Remove classe ativa de todos 
            for (let j = 0; j < filtros.length; j++) {
                filtros[j].classList.remove('ativa');
            }

            // Adiciona classe ativa no clicado
            this.classList.add('ativa');

            const tipoFiltro = this.dataset.filtro;
            console.log('Filtro selecionado:', tipoFiltro);

            aplicarFiltro(tipoFiltro);
        });
    }
}

function aplicarFiltro(tipo) {
    if (!window.dadosServidores) {
        console.log('Dados não carregados ainda');
        return;
    }

    let servidoresFiltrados = [];

    for (let i = 0; i < window.dadosServidores.length; i++) {
        servidoresFiltrados.push(window.dadosServidores[i]);
    }

    if (tipo === 'alerta') {
        let tempArray = [];
        for (let i = 0; i < servidoresFiltrados.length; i++) {
            if (servidoresFiltrados[i].qtdAlertas > 0) {
                tempArray.push(servidoresFiltrados[i]);
            }
        }
        servidoresFiltrados = tempArray;
    }
    else if (tipo === 'cpu') {
        for (let i = 0; i < servidoresFiltrados.length - 1; i++) {
            for (let j = 0; j < servidoresFiltrados.length - i - 1; j++) {
                if ((servidoresFiltrados[j].cpu || 0) < (servidoresFiltrados[j + 1].cpu || 0)) {
                    let temp = servidoresFiltrados[j];
                    servidoresFiltrados[j] = servidoresFiltrados[j + 1];
                    servidoresFiltrados[j + 1] = temp;
                }
            }
        }
    }
    else if (tipo === 'ram') {
        for (let i = 0; i < servidoresFiltrados.length - 1; i++) {
            for (let j = 0; j < servidoresFiltrados.length - i - 1; j++) {
                if ((servidoresFiltrados[j].ram || 0) < (servidoresFiltrados[j + 1].ram || 0)) {
                    let temp = servidoresFiltrados[j];
                    servidoresFiltrados[j] = servidoresFiltrados[j + 1];
                    servidoresFiltrados[j + 1] = temp;
                }
            }
        }
    }
    else if (tipo === 'disco') {
        for (let i = 0; i < servidoresFiltrados.length - 1; i++) {
            for (let j = 0; j < servidoresFiltrados.length - i - 1; j++) {
                if ((servidoresFiltrados[j].disco || 0) < (servidoresFiltrados[j + 1].disco || 0)) {
                    let temp = servidoresFiltrados[j];
                    servidoresFiltrados[j] = servidoresFiltrados[j + 1];
                    servidoresFiltrados[j + 1] = temp;
                }
            }
        }
    }
    else if (tipo === 'alertas') {
        for (let i = 0; i < servidoresFiltrados.length - 1; i++) {
            for (let j = 0; j < servidoresFiltrados.length - i - 1; j++) {
                if ((servidoresFiltrados[j].qtdAlertas || 0) < (servidoresFiltrados[j + 1].qtdAlertas || 0)) {
                    let temp = servidoresFiltrados[j];
                    servidoresFiltrados[j] = servidoresFiltrados[j + 1];
                    servidoresFiltrados[j + 1] = temp;
                }
            }
        }
    }

    atualizarTabela(servidoresFiltrados);
}

// Configurar modais de informação (configurando o Izinho)
function configurarModais() {
    const infoBtns = document.querySelectorAll('.infoBtn');
    const modals = document.querySelectorAll('.modal');
    const closeBtns = document.querySelectorAll('.closeBtn');

    infoBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.target;
            document.getElementById(target).style.display = 'flex';
        });
    });

    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            btn.closest('.modal').style.display = 'none';
        });
    });

    modals.forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.style.display = 'none';
        });
    });
}

// Carregar dados quando a página abrir
document.addEventListener('DOMContentLoaded', function () {
    console.log('Dashboard Suporte Macro carregado!');

    // Configurando pesquisa
    const inputPesquisa = document.querySelector('.input-pesquisa');
    if (inputPesquisa) {
        inputPesquisa.addEventListener('input', pesquisarServidores);
    }

    // Carrega os filtros
    configurarFiltros();

    // Carrega os modais do izinho
    configurarModais();

    // Carregar dados da API
    carregarDashboard();

});
