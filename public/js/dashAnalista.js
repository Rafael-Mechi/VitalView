protegerPagina(['Analista', 'Administrador']);
aplicarCargoNaUI();

Chart.defaults.font.family = "'Poppins', system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif";
Chart.defaults.color = "#4b5968";
const gridColor = "rgba(0,0,0,.06)";

let idHospitalVar = sessionStorage.FK_HOSPITAL;
let periodoAtual = 'mes';

const textosOriginais = new Map();

let chartTopServidores = null;
let chartComponentes = null;
let chartLinhaAno = null;

function buscarServidores(){
    fetch(`/analista/buscar-servidores/${idHospitalVar}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                }
            })
                .then(response => {
                    if (response.ok) {
                        response.json().then(resposta => {
                            console.log("Servidores do banco: ", resposta);

                            for(let i = 0; i < resposta.length; i++){
                                let idServidor = resposta[i].idServidor;
                                let hostname = resposta[i].hostname;
                                let nomeHospital = resposta[i].nome;

                                let key = `analista/previsoes/${idServidor}_${hostname}_${nomeHospital}_previsoes.json`;
                                console.log(`Chave que está sendo enviada: ${key}`);
                                
                                buscarDadosBucket(key);
                            }
                        })
                    }
                })
                .catch((erro) => {
                    console.error("Erro na requisição: ", erro);
                    alert("Erro na conexão com o servidor.");
                });
}

function buscarDadosBucket(key) {
    fetch(`analista/buscar-dados-bucket/${encodeURIComponent(key)}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        }
    })
        .then(response => {
            if (response.ok) {
                response.json().then(resposta => {
                    console.log("Dados recebidos do bucket: ", resposta);
                    //gerarTabelaPrevisoes(resposta);
                        })
                    }
                })
                .catch((erro) => {
                    console.error("Erro na requisição: ", erro);
                    alert("Erro na conexão com o servidor.");
                });
        }

function gerarTabelaPrevisoes(dados) {
    let tbodyPrevisoes = document.getElementById("corpoTabelaPrevisoes");
    tbodyPrevisoes.innerHTML = "";

    for (let i = 0; i < dados.length; i++) {
        let registro = dados[i];

        let idServidor = registro.idServidor;
        let hostname = registro.hostname;
        let diffMs = hoje - dataGeracao;
        let tempoNoSistema = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365));

        let dataFormatada = new Date(img.data_geracao)
            .toLocaleDateString("pt-BR", { timeZone: "UTC" });

        let linha = `
        <tr>
            <td hidden>${img.caminho_arquivo}</td>
            <td>${img.nome_arquivo}</td>
            <td>${img.tamanho} MB</td>
            <td>${dataFormatada}</td>
            <td>${tempoNoSistema} anos</td>
            <td class="acao-icons">
                    <button class="btn-excluir-usuario" onclick="excluirImagem(this)">&#x1F5D1;</button>
            </td>
        </tr>
    `;

        tbodyImagens.innerHTML += linha;
        }
}

async function carregarInformacoes() {
    if (textosOriginais.size === 0) {
        document.querySelectorAll('small').forEach((el, index) => {
            textosOriginais.set(index, el.textContent);
        });
    }
    
    atualizarTextosPeriodo();
    topServidoresComMaisAlertas();
    distribuicaoAlertasPorComponente();
    contarAlertasNoPeriodo();
    distribuicaoAlertasAno();
    diaSemanaComMaisAlertas();
    await gerarTabelaPrevisoes();
}

// Event listener para mudança de período
document.getElementById('periodo_select').addEventListener('change', function() {
    const valorSelecionado = this.value;
    
    switch(valorSelecionado) {
        case '2':
            periodoAtual = 'dia';
            break;
        case '3':
            periodoAtual = 'semana';
            break;
        case '4':
            periodoAtual = 'mes';
            break;
        case '5':
            periodoAtual = 'ano';
            break;
        case '6':
            periodoAtual = 'trimestre';
            break;
        case '7':
            periodoAtual = 'semestre';
            break;
        default:
            periodoAtual = 'mes';
    }
    
    carregarInformacoes();
    atualizarTextosPeriodo();
});

function atualizarTextosPeriodo() {
    let textoPeriodoNo = '';
    let textoPeriodoDurante = '';
    let tituloGrafico = '';
    let tituloKPI = '';
    let legendaKPI = '';
    
    switch(periodoAtual) {
        case 'dia':
            textoPeriodoNo = 'Hoje';
            textoPeriodoDurante = 'Durante o Dia';
            tituloGrafico = 'Distribuição de alertas ao longo do dia';
            tituloKPI = 'Hora do dia com mais alertas';
            legendaKPI = 'Horário com maior frequência de alertas';
            break;
        case 'semana':
            textoPeriodoNo = 'Nesta Semana';
            textoPeriodoDurante = 'Durante a Semana';
            tituloGrafico = 'Distribuição de alertas na semana';
            tituloKPI = 'Dia da semana com mais alertas';
            legendaKPI = 'Dia da semana com maior frequência de alertas';
            break;
        case 'mes':
            textoPeriodoNo = 'Neste Mês';
            textoPeriodoDurante = 'Durante o Mês';
            tituloGrafico = 'Distribuição de alertas no mês';
            tituloKPI = 'Dia da semana com mais alertas';
            legendaKPI = 'Dia da semana com maior frequência de alertas';
            break;
        case 'trimestre':
            textoPeriodoNo = 'Neste Trimestre';
            textoPeriodoDurante = 'Durante o Trimestre';
            tituloGrafico = 'Distribuição de alertas no trimestre';
            tituloKPI = 'Dia da semana com mais alertas';
            legendaKPI = 'Dia da semana com maior frequência de alertas';
            break;
        case 'semestre':
            textoPeriodoNo = 'Neste Semestre';
            textoPeriodoDurante = 'Durante o Semestre';
            tituloGrafico = 'Distribuição de alertas no semestre';
            tituloKPI = 'Dia da semana com mais alertas';
            legendaKPI = 'Dia da semana com maior frequência de alertas';
            break;
        case 'ano':
            textoPeriodoNo = 'Neste Ano';
            textoPeriodoDurante = 'Durante o Ano';
            tituloGrafico = 'Distribuição de alertas ao longo do ano';
            tituloKPI = 'Dia da semana com mais alertas';
            legendaKPI = 'Dia da semana com maior frequência de alertas';
            break;
    }
    
    // Para atualizar os textos do periodo
    document.querySelectorAll('small').forEach((el, index) => {
        let textoOriginal = textosOriginais.get(index) || el.textContent;
        
        let novoTexto = textoOriginal;
        
        novoTexto = novoTexto
            .replace(/No (Mês|Ano|Semana|Neste Mês|Neste Ano|Nesta Semana|Hoje|Trimestre|Semestre|Neste Trimestre|Neste Semestre)/gi, textoPeriodoNo)
            .replace(/Neste (Mês|Ano|Trimestre|Semestre)/gi, textoPeriodoNo)
            .replace(/Nesta (Semana)/gi, textoPeriodoNo)
            .replace(/Hoje/gi, textoPeriodoNo);
        
        novoTexto = novoTexto
            .replace(/Durante (o Mês|o Ano|a Semana|o Dia|o Trimestre|o Semestre)/gi, textoPeriodoDurante);
        
        el.textContent = novoTexto;
        
        textosOriginais.set(index, novoTexto);
    });
    
    const tituloGraficoLinha = document.getElementById('titulo_grafico_linha');
    if (tituloGraficoLinha) {
        tituloGraficoLinha.textContent = tituloGrafico;
    }
    
    // Atualizar o título e legenda da KPI
    const tituloKPIElement = document.getElementById('c1');
    if (tituloKPIElement) {
        tituloKPIElement.innerHTML = `${tituloKPI}<br><small>${textoPeriodoDurante}</small>`;
    }
    
    const legendaKPIElement = document.querySelector('.velocimetro.card .legenda');
    if (legendaKPIElement) {
        legendaKPIElement.textContent = legendaKPI;
    }
}

function topServidoresComMaisAlertas() {
    fetch(`/analista/top-alertas/${idHospitalVar}?periodo=${periodoAtual}`)
        .then(res => res.json())
        .then(dados => gerarGraficoTopServidores(dados))
        .catch(err => console.error("Erro ao buscar top servidores: ", err));
}

function distribuicaoAlertasPorComponente() {
    fetch(`/analista/distribuicao-alertas/${idHospitalVar}?periodo=${periodoAtual}`)
        .then(res => res.json())
        .then(dados => gerarGraficoDistribuicao(dados))
        .catch(err => console.error("Erro ao buscar alertas por componente: ", err));
}

function contarAlertasNoPeriodo() {
    fetch(`/analista/quantidade-alertas/${idHospitalVar}?periodo=${periodoAtual}`)
        .then(res => res.json())
        .then(dados => gerarContadorAlertas(dados))
        .catch(err => console.error("Erro ao contar alertas: ", err));
}

// Para mudar o grafico de acordo com o periodo selecionado coloquei algumas validações para reconstruir o grafico
function distribuicaoAlertasAno() {
    fetch(`/analista/distribuicao-alertas-ano/${idHospitalVar}?periodo=${periodoAtual}`)
        .then(res => {
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.json();
        })
        .then(dados => {
            if (!Array.isArray(dados)) {
                console.error("Dados inválidos recebidos:", dados);
                dados = [];
            }
            gerarGraficoDistribuicaoAno(dados);
        })
        .catch(err => {
            console.error("Erro ao buscar alertas do ano: ", err);
            gerarGraficoDistribuicaoAno([]);
        });
}

// Para pegar o dia da semana com mais alertas ou hora do dia (se período for 'dia')
function diaSemanaComMaisAlertas() {
    fetch(`/analista/dia-semana-mais-alertas/${idHospitalVar}?periodo=${periodoAtual}`)
        .then(res => res.json())
        .then(dados => {
            if (dados.length > 0) {
                if (periodoAtual === 'dia' && dados[0].hora !== undefined) {
                    // Para o período 'dia', mostra a hora com mais alertas
                    const hora = dados[0].hora;
                    const horaFormatada = `${hora.toString().padStart(2, '0')}:00`;
                    document.querySelector('.valor.grande.azul').textContent = horaFormatada;
                } else if (dados[0].dia_semana) {
                    // Para outros períodos, mostra o dia da semana
                    const diasPT = {
                        'Monday': 'Segunda-feira',
                        'Tuesday': 'Terça-feira',
                        'Wednesday': 'Quarta-feira',
                        'Thursday': 'Quinta-feira',
                        'Friday': 'Sexta-feira',
                        'Saturday': 'Sábado',
                        'Sunday': 'Domingo'
                    };
                    const diaTraduzido = diasPT[dados[0].dia_semana] || dados[0].dia_semana;
                    document.querySelector('.valor.grande.azul').textContent = diaTraduzido;
                }
            }
        })
        .catch(err => console.error("Erro ao buscar dia com mais alertas: ", err));
}

function gerarGraficoTopServidores(dados) {
    let nomes = [];
    let quantidades = [];
    
    for (let i = 0; i < dados.length; i++) {
        nomes.push(dados[i].hostname);
        quantidades.push(dados[i].quantidade_alertas);
    }
    
    if (chartTopServidores) {
        chartTopServidores.destroy();
    }
    
    let labelPeriodo = '';
    switch(periodoAtual) {
        case 'dia':
            labelPeriodo = 'hoje';
            break;
        case 'semana':
            labelPeriodo = 'na última semana';
            break;
        case 'mes':
            labelPeriodo = 'no último mês';
            break;
        case 'trimestre':
            labelPeriodo = 'no último trimestre';
            break;
        case 'semestre':
            labelPeriodo = 'no último semestre';
            break;
        case 'ano':
            labelPeriodo = 'no último ano';
            break;
    }
    
    chartTopServidores = new Chart(document.getElementById("topServidoresChart"), {
        type: "bar",
        data: {
            labels: nomes,
            datasets: [{
                label: `Alertas ${labelPeriodo}`,
                data: quantidades,
                backgroundColor: ["#093037", "#4addf6", "#32b9cd", "#188b9f"],
                borderRadius: 8
            }]
        },
        options: {
            plugins: {
                legend: { display: false },
                title: {
                    display: true,
                    font: { size: 16, weight: "bold" }
                }
            },
            scales: {
                x: { grid: { display: false } },
                y: { beginAtZero: true, grid: { color: gridColor }, ticks: { stepSize: 1 } }
            }
        }
    });
}

function gerarGraficoDistribuicao(dados) {
    let nomesComponentes = [];
    let quantidades = [];
    
    for (let i = 0; i < dados.length; i++) {
        nomesComponentes.push(dados[i].componente);
        quantidades.push(dados[i].quantidade_alertas);
    }
    
    if (chartComponentes) {
        chartComponentes.destroy();
    }
    
    chartComponentes = new Chart(document.getElementById("componentesChart"), {
        type: "bar",
        data: {
            labels: nomesComponentes,
            datasets: [{
                label: "Alertas",
                data: quantidades,
                backgroundColor: ["#32b9cd", "#4addf6", "#188b9f", "#093037"],
                borderRadius: 12
            }]
        }, 
        options: {
            plugins: {
                legend: { display: false },
                title: {
                    display: true,
                    font: { size: 15, weight: "bold" }
                }
            },
            scales: {
                x: { grid: { display: false } },
                y: { beginAtZero: true, grid: { color: gridColor }, ticks: { stepSize: 1 } }
            }
        }
    });
}

function gerarContadorAlertas(dados) {
    let qtd = 0;
    if (dados.length > 0 && dados[0].quantidade_alertas !== undefined) {
        qtd = dados[0].quantidade_alertas;
    }
    const divQtd = document.querySelector(".vermelho");
    if (divQtd) divQtd.textContent = qtd;
}

function gerarGraficoDistribuicaoAno(dados) {
    let labels = [];
    let quantidades = [];
    let tituloGrafico = '';
    
    if (!Array.isArray(dados)) {
        dados = [];
    }
    
    if (periodoAtual === 'dia') {
        tituloGrafico = 'Distribuição de alertas ao longo do dia';
        
        const porHora = {};
        dados.forEach(item => {
            if (item.hora !== undefined) {
                if (!porHora[item.hora]) {
                    porHora[item.hora] = 0;
                }
                porHora[item.hora] += item.quantidade_alertas;
            }
        });
        
        for (let hora = 0; hora < 24; hora++) {
            labels.push(`${hora.toString().padStart(2, '0')}h`);
            quantidades.push(porHora[hora] || 0);
        }
        
    } else if (periodoAtual === 'semana') {
        tituloGrafico = 'Distribuição de alertas na semana';
        
        const diasSemana = {
            'Monday': 'Seg',
            'Tuesday': 'Ter',
            'Wednesday': 'Qua',
            'Thursday': 'Qui',
            'Friday': 'Sex',
            'Saturday': 'Sáb',
            'Sunday': 'Dom'
        };
        
        const ordemDias = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        
        const porDiaSemana = {};
        dados.forEach(item => {
            if (item.dia_semana) {
                if (!porDiaSemana[item.dia_semana]) {
                    porDiaSemana[item.dia_semana] = 0;
                }
                porDiaSemana[item.dia_semana] += item.quantidade_alertas;
            }
        });
        
        ordemDias.forEach(dia => {
            if (porDiaSemana[dia]) {
                labels.push(diasSemana[dia]);
                quantidades.push(porDiaSemana[dia]);
            }
        });
        
        if (labels.length === 0) {
            ordemDias.forEach(dia => {
                labels.push(diasSemana[dia]);
                quantidades.push(0);
            });
        }
        
    } else if (periodoAtual === 'mes') {
        tituloGrafico = 'Distribuição de alertas no mês';
        
        const porDia = {};
        dados.forEach(item => {
            if (item.dia_mes) {
                if (!porDia[item.dia_mes]) {
                    porDia[item.dia_mes] = 0;
                }
                porDia[item.dia_mes] += item.quantidade_alertas;
            }
        });
        
        const diasOrdenados = Object.keys(porDia).sort((a, b) => parseInt(a) - parseInt(b));
        
        if (diasOrdenados.length > 0) {
            diasOrdenados.forEach(dia => {
                labels.push(`Dia ${dia}`);
                quantidades.push(porDia[dia]);
            });
        } else {
            labels.push('Sem dados');
            quantidades.push(0);
        }
        
    } else if (periodoAtual === 'trimestre' || periodoAtual === 'semestre') {
        tituloGrafico = periodoAtual === 'trimestre' ? 
            'Distribuição de alertas no trimestre' : 
            'Distribuição de alertas no semestre';
        
        for (let i = 0; i < dados.length - 1; i++) {
            for (let j = i + 1; j < dados.length; j++) {
                if (new Date(dados[i].periodo) > new Date(dados[j].periodo)) {
                    let temp = dados[i];
                    dados[i] = dados[j];
                    dados[j] = temp;
                }
            }
        }
        
        let nomesMes = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
        
        for (let i = 0; i < dados.length; i++) {
            let partes = dados[i].periodo.split("-");
            let mesIndex = parseInt(partes[1]) - 1;
            labels.push(nomesMes[mesIndex]);
            quantidades.push(dados[i].quantidade_alertas);
        }
        
    } else if (periodoAtual === 'ano') {
        tituloGrafico = 'Distribuição de alertas ao longo do ano';
        
        for (let i = 0; i < dados.length - 1; i++) {
            for (let j = i + 1; j < dados.length; j++) {
                if (new Date(dados[i].periodo) > new Date(dados[j].periodo)) {
                    let temp = dados[i];
                    dados[i] = dados[j];
                    dados[j] = temp;
                }
            }
        }
        
        let nomesMes = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
        
        for (let i = 0; i < dados.length; i++) {
            let partes = dados[i].periodo.split("-");
            let mesIndex = parseInt(partes[1]) - 1;
            labels.push(nomesMes[mesIndex]);
            quantidades.push(dados[i].quantidade_alertas);
        }
    }
    
    if (chartLinhaAno) {
        chartLinhaAno.destroy();
    }
    
    const tituloElemento = document.getElementById('titulo_grafico_linha');
    if (tituloElemento) {
        tituloElemento.textContent = tituloGrafico;
    }
    
    chartLinhaAno = new Chart(document.getElementById("linhaAnoChart"), {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: tituloGrafico,
                data: quantidades,
                borderColor: "#32b9cd",
                backgroundColor: "#32b9cd20",
                fill: true,
                tension: 0.3,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                title: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Alertas: ${context.parsed.y}`;
                        }
                    }
                }
            },
            scales: {
                x: { 
                    grid: { display: false },
                    ticks: {
                        maxRotation: 45,
                        minRotation: 0,
                        autoSkip: true,
                        maxTicksLimit: periodoAtual === 'dia' ? 24 : 15
                    }
                },
                y: { 
                    beginAtZero: true, 
                    grid: { color: gridColor },
                    ticks: { 
                        stepSize: 1,
                        callback: function(value) {
                            return Math.floor(value);
                        }
                    }
                }
            }
        }
    });
}