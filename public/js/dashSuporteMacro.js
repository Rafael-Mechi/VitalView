async function carregarDashboard() {
    try {
        console.log('Buscando dados do dashboard macro...');

        const response = await fetch('/servidores/dashboard-macro');

        if (response.ok) {
            const dados = await response.json();
            console.log('Dados recebidos da API:', dados);

            window.dadosServidores = dados.servidores;
            // Atualizar KPIs
            atualizarKPIs(dados.kpis);

            // Atualizar tabela
            atualizarTabela(dados.servidores);

            // Atualizar gráfico
            atualizarGrafico(dados.kpis.distribuicao);
        } else {
            console.log('API não disponível');
        }

    } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
    }
}

// Atualizar KPIs
function atualizarKPIs(kpis) {
    // Servidores em Risco
    const servidoresRiscoElement = document.querySelector('.kpi .value');
    if (servidoresRiscoElement) {
        servidoresRiscoElement.innerHTML = `${kpis.servidoresRisco}<span>/${kpis.totalServidores}</span>`;
    }

    // Alertas
    const valueServ = document.querySelector('.value-serv');
    if (valueServ) {
        const tendenciaClass = kpis.tendenciaAlertas.includes('+') ? 'aumento' : 'queda';
        valueServ.innerHTML = `${kpis.alertas24h}<span class="tendencia ${tendenciaClass}">${kpis.tendenciaAlertas}</span>`;
    }

    // Total de servidores
    const badgeTotal = document.querySelector('.badge-total');
    if (badgeTotal) {
        badgeTotal.textContent = kpis.totalServidores;
    }
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

        tr.innerHTML = `
            <td class="nomeServidor"><a>${servidor.nome}</a></td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            <td>
                <div class="barra-progresso">
                    <div class="barra-uso normal" style="width: ${cpuPercent}%;">
                        <p>${cpuPercent}%</p>
                    </div>
                </div>
            </td>
            <td>
                <div class="barra-progresso">
                    <div class="barra-uso normal" style="width: ${ramPercent}%;">${ramPercent}%</div>
                </div>
            </td>
            <td>
                <div class="barra-progresso">
                    <div class="barra-uso normal" style="width: ${discoPercent}%;">${discoPercent}%</div>
                </div>
            </td>
            <td><span class="alerta-badge">${servidor.qtdAlertas}</span></td>
            <td>${servidor.tempoAlerta}</td>
            <td>
                <div class="btn-grupo">
                    <button class="btn-server" onclick="irParaMicro('${servidor.id}','${servidor.nome}','${sessionStorage.FK_HOSPITAL}')">
                        <img src="assets/dashboard-icons/servidorIcon.jpg" style="width: 20px;" alt="Servidor">
                    </button>
                    <button class="btn-disk" onclick="irParaDisco('${servidor.id}','${servidor.nome}','${sessionStorage.FK_HOSPITAL}')">
                        <img src="assets/dashboard-icons/disco.jpg" style="width: 20px;" alt="Disco">
                    </button>
                    <button class="btn-network" onclick="irParaRede('${servidor.id}','${servidor.nome}','${sessionStorage.FK_HOSPITAL}')">
                        <img src="assets/dashboard-icons/redeIcon.jpg" style="width: 20px;" alt="Rede">
                    </button>
                </div>
            </td>
        `;

        tbody.appendChild(tr);
    }

    // Se não tiver servidores aparece essa mensagem aqui
    if (servidores.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 40px; color: #666;">
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
