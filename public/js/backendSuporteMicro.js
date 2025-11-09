let ip
let hostname
let ramTotal
let discoTotal
let localizacao
let dadosRecebidos


protegerPagina(['Técnico', 'Administrador']);
aplicarCargoNaUI();

const idServidor = 1;
const key = "saida.json";

lottie.loadAnimation({
    container: document.getElementById('loading'),
    renderer: 'svg',
    loop: true,
    autoplay: true,
    path: './assets/loading/loading.json'
  });

document.addEventListener("DOMContentLoaded", async () => {
    // Mostra o loading
    document.getElementById("loading").style.display = "flex";
    document.getElementById("main-container").style.display = "none";

    try {
        //Faz as duas requisições ao mesmo tempo
        const [resBanco, resBucket] = await Promise.all([
            fetch(`/suporteMicroRoutes/buscar-dados-banco/${idServidor}`),
            fetch(`/suporteMicroRoutes/buscar-dados-bucket/${key}`)
        ]);

        //Converte ambas para JSON
        const [dadosBanco, dadosBucket] = await Promise.all([
            resBanco.json(),
            resBucket.json()
        ]);

        //Dados do banco
        if (dadosBanco.length > 0) {
            ip = dadosBanco[0].ip;
            hostname = dadosBanco[0].hostname;
            localizacao = dadosBanco[0].localizacao;
        }

        //Dados do bucket
        if (dadosBucket.length > 0) {
            dadosRecebidos = dadosBucket;
            discoTotal = bytesParaGB(dadosRecebidos[0]["Disco total (bytes)"]);
            ramTotal = bytesParaGB(dadosRecebidos[0]["RAM total (bytes)"]);
        }

        //Exibe tudo
        plotarDados();

    } catch (erro) {
        console.error("Erro na requisição:", erro);
        alert("Erro na conexão com o servidor.");
    }
});

function plotarDados() {
    detalhesServidor();

    // Esconde o loading e mostra o conteúdo
    document.getElementById("loading").style.display = "none";
    document.getElementById("main-container").style.display = "flex";
}

function detalhesServidor() {
    document.getElementById("ip").innerHTML = ip;
    document.getElementById("hostName").innerHTML = hostname;
    document.getElementById("hostName2").innerHTML = hostname;
    document.getElementById("localizacao").innerHTML = localizacao;
    document.getElementById("ramTotal").innerHTML = `${ramTotal} GB`;
    document.getElementById("discoTotal").innerHTML = `${discoTotal} GB`;
}

function bytesParaGB(bytes) {
    return (bytes / (1024 ** 3)).toFixed(0);
}




// -------------------------------------------------------------------------------------------------------


const velocimetroram = document.getElementById('velocimetroram').getContext('2d');

// Valor atual (0 a 100)
const valor = 65;

new Chart(velocimetroram, {
    type: 'doughnut',
    data: {
        labels: ['Velocidade', 'Restante'],
        datasets: [{
            data: [valor, 100 - valor],
            backgroundColor: ['#32b9cd', '#e0e0e0'],
            borderWidth: 0
        }]
    },
    options: {
        responsive: true,
        rotation: -90,       // Início do semicírculo
        circumference: 180,  // Metade do círculo
        cutout: '65%',       // "Espessura" do velocímetro
        plugins: {
            legend: { display: false },
            title: {
                display: true,
                text: 'Utilização de RAM',
                font: {
                    size: 18,
                    weight: 'bold'
                },
                color: 'black'
            },
            tooltip: { enabled: false }
        },
    },
    plugins: [{
        // Adiciona o texto central
        id: 'textoCentral',
        afterDraw(chart) {
            const { ctx, chartArea: { width, height } } = chart;
            ctx.save();
            ctx.font = 'bold 28px Barlow';
            ctx.fillStyle = '#000';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(valor + '%', width / 2, height / 0.9);
        }
    }]
});
const velocimetroram2 = document.getElementById('velocimetroram2').getContext('2d');

// Valor atual (0 a 100)
const valor2 = 58;

new Chart(velocimetroram2, {
    type: 'doughnut',
    data: {
        labels: ['Velocidade', 'Restante'],
        datasets: [{
            data: [valor2, 100 - valor2],
            backgroundColor: ['#32b9cd', '#e0e0e0'],
            borderWidth: 0
        }]
    },
    options: {
        responsive: true,
        rotation: -90,       // Início do semicírculo
        circumference: 180,  // Metade do círculo
        cutout: '65%',       // "Espessura" do velocímetro
        plugins: {
            legend: { display: false },
            title: {
                display: true,
                text: 'Utilização de CPU',
                font: {
                    size: 18,
                    weight: 'bold',
                },
                color: 'black',
            },
            tooltip: { enabled: false }
        },
    },
    plugins: [{
        // Adiciona o texto central
        id: 'textoCentral',
        afterDraw(chart) {
            const { ctx, chartArea: { width, height } } = chart;
            ctx.save();
            ctx.font = 'bold 28px "Barlow"';
            ctx.fillStyle = '#000';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(valor2 + '%', width / 2, height / 0.9);
        }
    }]
});

const ctx = document.getElementById('graficoPizza').getContext('2d');
new Chart(ctx, {
    type: 'pie',
    data: {
        labels: ['Livre 1.5T', 'Usado 3.5T'],
        datasets: [{
            data: [30, 70],
            backgroundColor: ['#6ce5e8', '#2d8bba'],
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
                text: 'Utilização de Disco',
                font: {
                    size: 17,
                    weight: 'bold',
                },
                color: 'black'

            }
        }
    }
});


const ctx3 = document.getElementById('graficoLinha').getContext('2d');

new Chart(ctx3, {
    type: 'line',
    data: {
        labels: ['12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'],
        datasets: [
            {
                label: 'CPU',
                data: [30, 19, 8, 15, 22, 17, 25],
                borderColor: '#45d4dc',
                backgroundColor: 'rgba(69, 212, 220, 0.2)',
                borderWidth: 2,
                fill: true,
                tension: 0.3,
                pointRadius: 5,
                pointBackgroundColor: '#45d4dc'
            },
            {
                label: 'RAM',
                data: [20, 14, 12, 18, 20, 15, 23],
                borderColor: '#1f7f8d',
                backgroundColor: 'rgba(31, 127, 141, 0.2)',
                borderWidth: 2,
                fill: true,
                tension: 0.3,
                pointRadius: 5,
                pointBackgroundColor: '#1f7f8d'
            },
            {
                label: 'DISCO',
                data: [8, 12, 15, 10, 18, 22, 19],
                borderColor: '#0d3e47',
                backgroundColor: 'rgba(13, 62, 71, 0.2)',
                borderWidth: 2,
                fill: true,
                tension: 0.3,
                pointRadius: 5,
                pointBackgroundColor: '#0d3e47'
            }
        ]
    },
    options: {
        responsive: true,
        plugins: {
            title: {
                display: true,
                text: 'Distribuição de alertas por componente',
                font: {
                    size: 17,
                    weight: 'bold',
                },
                color: 'black',
            },
            legend: {
                display: true,
                position: 'right' // exibe a legenda para diferenciar CPU, RAM e DISCO
            }
        },
        scales: {
            y: {
                title: {
                    display: true,
                    text: 'Nº Alertas',
                    color: 'black',
                    font: {
                        size: 14,
                        weight: 'bold',
                    },
                },
                beginAtZero: true
            }
        }
    }
});