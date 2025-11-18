protegerPagina(['Analista', 'Administrador']);
aplicarCargoNaUI();

Chart.defaults.font.family = "'Poppins', system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif";
Chart.defaults.color = "#4b5968";
const gridColor = "rgba(0,0,0,.06)";

let idHospitalVar = sessionStorage.FK_HOSPITAL;

async function carregarInformacoes() {
    topServidoresComMaisAlertas();
    distribuicaoAlertasPorComponente();
    contarAlertasNoPeriodo();
    distribuicaoAlertasAno();
}

function topServidoresComMaisAlertas() {
    fetch(`/analista/top-alertas/${idHospitalVar}`)
        .then(res => res.json())
        .then(dados => gerarGraficoTopServidores(dados))
        .catch(err => console.error("Erro ao buscar top servidores: ", err));
}

function distribuicaoAlertasPorComponente() {
    fetch(`/analista/distribuicao-alertas/${idHospitalVar}`)
        .then(res => res.json())
        .then(dados => gerarGraficoDistribuicao(dados))
        .catch(err => console.error("Erro ao buscar alertas por componente: ", err));
}

function contarAlertasNoPeriodo() {
    fetch(`/analista/quantidade-alertas/${idHospitalVar}`)
        .then(res => res.json())
        .then(dados => gerarContadorAlertas(dados))
        .catch(err => console.error("Erro ao contar alertas: ", err));
}

function distribuicaoAlertasAno() {
    fetch(`/analista/distribuicao-alertas-ano/${idHospitalVar}`)
        .then(res => res.json())
        .then(dados => gerarGraficoDistribuicaoAno(dados))
        .catch(err => console.error("Erro ao buscar alertas do ano: ", err));
}

function gerarGraficoTopServidores(dados) {
    let nomes = [];
    let quantidades = [];
    for (let i = 0; i < dados.length; i++) {
        nomes.push(dados[i].hostname);
        quantidades.push(dados[i].quantidade_alertas);
    }
    new Chart(document.getElementById("topServidoresChart"), {
        type: "bar",
        data: {
            labels: nomes,
            datasets: [{
                label: "Alertas no último mês",
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
    new Chart(document.getElementById("componentesChart"), {
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
    for (let i = 0; i < dados.length - 1; i++) {
        for (let j = i + 1; j < dados.length; j++) {
            if (new Date(dados[i].mes_ano) > new Date(dados[j].mes_ano)) {
                let temp = dados[i];
                dados[i] = dados[j];
                dados[j] = temp;
            }
        }
    }
    let meses = [];
    let quantidades = [];
    let nomesMes = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    for (let i = 0; i < dados.length; i++) {
        let partes = dados[i].mes_ano.split("-");
        let mesIndex = parseInt(partes[1]) - 1;
        meses.push(nomesMes[mesIndex]);
        quantidades.push(dados[i].quantidade_alertas);
    }
    new Chart(document.getElementById("linhaAnoChart"), {
        type: "line",
        data: {
            labels: meses,
            datasets: [{
                label: "Alertas por mês",
                data: quantidades,
                borderColor: "#32b9cd",
                backgroundColor: "#32b9cd20",
                fill: true,
                tension: 0.3,
                pointRadius: 4
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
                y: { beginAtZero: true, grid: { color: gridColor } }
            }
        }
    });
}
