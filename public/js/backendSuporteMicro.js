const params = new URLSearchParams(window.location.search);
protegerPagina(['Técnico', 'Administrador']);
aplicarCargoNaUI();

let infoBtns = document.querySelectorAll('.infoBtn');
let modals = document.querySelectorAll('.modal');
let closeBtns = document.querySelectorAll('.closeBtn');

infoBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        let target = btn.dataset.target;
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

let ip
let hostname
let ramTotal
let discoTotal
let localizacao
let dadosRecebidos
let chartCPU = null;

const id = params.get("idServidor");
const nomeServidor = params.get("hostname");
const nomeHospital = sessionStorage.NOME_HOSPITAL;

const idServidor = id;
const key = `${id}_${nomeServidor}_${nomeHospital}.json`;
const key2 = `csvjson.json`

console.log(key)

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
        const [resBanco, resBucket, resProcess] = await Promise.all([
            fetch(`/suporteMicroRoutes/buscar-dados-banco/${idServidor}`),
            fetch(`/suporteMicroRoutes/buscar-dados-bucket/${key}`),
            fetch(`/suporteMicroRoutes/buscar-dados-bucket/${key2}`)
        ]);

        //Converte ambas para JSON
        const [dadosBanco, dadosBucket, dadosProcessos] = await Promise.all([
            resBanco.json(),
            resBucket.json(),
            resProcess.json()
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
            console.log(dadosRecebidos)
            discoTotal = bytesParaGB(dadosRecebidos[0]["Disco total (bytes)"]);
            ramTotal = bytesParaGB(dadosRecebidos[0]["RAM total (bytes)"]);
            discoUsado = bytesParaGB(dadosRecebidos[0]["Disco usado (bytes)"])
            discoLivre = bytesParaGB(dadosRecebidos[0]["Disco livre (bytes)"])
        }

        if (dadosProcessos.length > 0) {
            console.log(dadosProcessos)
            // nomeProcesso = dadosProcessos(dadosRecebidos[0]["Nome_Processo"]);
            // ramProcesso = dadosProcessos(dadosRecebidos[0]["Uso_Ram_Percent"]);
            // threadsProcesso = dadosProcessos(dadosRecebidos[0]["Num_Threads"])
            // statusProcesso = dadosProcessos(dadosRecebidos[0]["Status"])
        }

        //Exibe tudo
        plotarDados(dadosBucket, dadosProcessos);

    } catch (erro) {
        console.error("Erro na requisição:", erro);
        servidorDesconectado()
        document.getElementById("loading").style.display = "none";
        document.getElementById("main-container").style.display = "flex";

    }
});

function servidorDesconectado() {

    const velocimetroram2 = document.getElementById('velocimetroram2').getContext('2d');

    usoCPU = 0

    chartCPU = new Chart(velocimetroram2, {
        type: 'doughnut',
        data: {
            labels: ['Velocidade', 'Restante'],
            datasets: [{
                data: [usoCPU, 100 - usoCPU],
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
                ctx.fillText(usoCPU + '%', width / 2, height / 0.9);
            }
        }]
    });

    const velocimetroram = document.getElementById('velocimetroram').getContext('2d');

    usoRAM = 0

    chartRAM = new Chart(velocimetroram, {
        type: 'doughnut',
        data: {
            labels: ['Velocidade', 'Restante'],
            datasets: [{
                data: [usoRAM, 100 - usoRAM],
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
                ctx.fillText(usoRAM + '%', width / 2, height / 0.9);
            }
        }]
    });

    porcentagemDiscoUsado = 0

    const ctx = document.getElementById('graficoPizza').getContext('2d');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: [`Livre ${0} GB`, `Usado ${0}GB`],
            datasets: [{
                data: [100 - porcentagemDiscoUsado, porcentagemDiscoUsado],
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
}

function plotarDados(dadosBucket, dadosProcessos) {
    detalhesServidor();
    utilizaçãoDeDisco();
    utilizacaoCPU(dadosBucket);
    utilizacaoDeRam(dadosBucket);
    escolherServidor();
    uptimeSistema(dadosBucket);
    processosServidor(dadosProcessos);

    // Esconde o loading e mostra o conteúdo
    document.getElementById("loading").style.display = "none";
    document.getElementById("main-container").style.display = "flex";
}

function processosServidor(dadosProcessos) {

    // const containerListaProcessos = document.querySelector("#card_processos");

    const tbody = document.getElementById("tbody-processos");

    // const thead = document.querySelector("#card_processos table thead");

    // if (!tbody) {
    //     console.error("TBody não encontrado.");
    //     return;
    // }

    // // Limpa apenas o tbody, mantendo a tabela e o scroll
    // tbody.innerHTML = "";

    dadosProcessos.forEach(processo => {

        const linha = document.createElement("tr");

        linha.innerHTML = `
            <td>
                <div class="nome-processo" title="${processo.Nome_Processo}">
                    ${processo.Nome_Processo}
                </div>
            </td>
            <td>${processo.Uso_Ram_Percent}%</td>
            <td>${processo.Num_Threads}</td>

            <td>
                <span class="processo-${processo.Status === "running" ? "ativo" : "inativo"}">
                    ${processo.Status}
                </span>
            </td>
        `;


        tbody.appendChild(linha);
    });
}






function detalhesServidor() {
    document.getElementById("ip").textContent = ip;
    document.getElementById("hostName").textContent = hostname;
    document.getElementById("hostName2").textContent = hostname;
    document.getElementById("localizacao").textContent = localizacao;
    document.getElementById("ramTotal").textContent = `${ramTotal} GB`;
    document.getElementById("discoTotal").textContent = `${discoTotal} GB`;
}

function bytesParaGB(bytes) {
    return (bytes / (1024 ** 3)).toFixed(0);
}

function totalAlertas(dadosBucket) {

    totalDeAlertas = dadosBucket[i]["Uptime (s)"]

}

function uptimeSistema(dadosBucket) {
    let i = 0

    upTime = dadosBucket[0]["Uso de CPU"]

    const interval = setInterval(() => {
        if (i >= dadosBucket.length) {
            clearInterval(interval); // para o setInterval quando terminar
            return;
        }

        upTime = dadosBucket[i]["Uptime (s)"]
        console.log(upTime)

        document.getElementById("uptimeServidor").textContent = upTime;

        i++;
    }, 2500); // executa a cada 2.5s
}

function escolherServidor() {
    const select = document.getElementById("listaServidores");

    fetch(`/suporteMicroRoutes/buscar-servidores`)
        .then(response => response.json())
        .then(data => {
            console.log(data);

            data.forEach(servidor => {
                const option = document.createElement("option");
                option.value = servidor.idServidor;
                option.textContent = servidor.hostname;
                select.appendChild(option);
            });
        })
        .catch(error => console.error('Erro:', error));

    // evento para redirecionar ao escolher
    select.addEventListener("change", () => {
        const servidorSelecionado = select.options[select.selectedIndex];
        const idServidorSelecionado = servidorSelecionado.value;
        const hostname = servidorSelecionado.textContent;
        const idHospital = sessionStorage.FK_HOSPITAL;
        window.location.href = `dashboardSuporteMicro.html?idServidor=${idServidorSelecionado}&hostname=${hostname}&idhospital=${idHospital}`;
    })
}

function utilizacaoCPU(dadosBucket) {
    let i = 0;

    const velocimetroram2 = document.getElementById('velocimetroram2').getContext('2d');

    usoCPU = dadosBucket[0]["Uso de CPU"]

    chartCPU = new Chart(velocimetroram2, {
        type: 'doughnut',
        data: {
            labels: ['Velocidade', 'Restante'],
            datasets: [{
                data: [usoCPU, 100 - usoCPU],
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
                ctx.fillText(usoCPU + '%', width / 2, height / 0.9);
            }
        }]
    });


    const interval = setInterval(() => {
        if (i >= dadosBucket.length) {
            clearInterval(interval); // para o setInterval quando terminar
            return;
        }

        usoCPU = dadosBucket[i]["Uso de CPU"]

        chartCPU.data.datasets[0].data = [usoCPU, 100 - usoCPU];
        chartCPU.update();

        i++;
    }, 2500); // executa a cada 2.5s

}

function utilizacaoDeRam(dadosBucket) {
    let i = 0;

    const velocimetroram = document.getElementById('velocimetroram').getContext('2d');

    usoRAM = dadosBucket[0]["Uso de RAM"]

    chartRAM = new Chart(velocimetroram, {
        type: 'doughnut',
        data: {
            labels: ['Velocidade', 'Restante'],
            datasets: [{
                data: [usoRAM, 100 - usoRAM],
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
                ctx.fillText(usoRAM + '%', width / 2, height / 0.9);
            }
        }]
    });

    const interval = setInterval(() => {
        if (i >= dadosBucket.length) {
            clearInterval(interval); // para o setInterval quando terminar
            return;
        }

        usoRAM = dadosBucket[i]["Uso de RAM"]

        chartRAM.data.datasets[0].data = [usoRAM, 100 - usoRAM];
        chartRAM.update();

        i++;
    }, 2500); // executa a cada 2.5s

}


function utilizaçãoDeDisco() {

    porcentagemDiscoUsado = Math.round((discoUsado / discoTotal) * 100)

    const ctx = document.getElementById('graficoPizza').getContext('2d');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: [`Livre ${discoTotal - discoUsado} GB`, `Usado ${discoUsado}GB`],
            datasets: [{
                data: [100 - porcentagemDiscoUsado, porcentagemDiscoUsado],
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
}


// -------------------------------------------------------------------------------------------------------




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