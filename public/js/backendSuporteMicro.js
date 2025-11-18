// CERTIFICAR QUE JA TEM OS ARQUIVOS NO BUCKET E COM O NOME CERTO JSON DE PROCESSOS E JSON DE DADOS
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
        const [resBanco, resBucket, resProcess, resAlertas] = await Promise.all([
            fetch(`/suporteMicroRoutes/buscar-dados-banco/${idServidor}`),
            fetch(`/suporteMicroRoutes/buscar-dados-bucket/${key}`),
            fetch(`/suporteMicroRoutes/buscar-dados-bucket/${key2}`),

            //Arrumar esse fetch
            fetch(`/suporteMicroRoutes/buscar-dados-banco/${idServidor}`)
        ]);

        //Converte ambas para JSON
        const [dadosBanco, dadosBucket, dadosProcessos, alertasBanco] = await Promise.all([
            resBanco.json(),
            resBucket.json(),
            resProcess.json(),
            resAlertas.json(),
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
            discoTotal = bytesParaGB(dadosRecebidos[0]["Disco_total_(bytes)"]);
            ramTotal = bytesParaGB(dadosRecebidos[0]["RAM_total_(bytes)"]);
            discoUsado = bytesParaGB(dadosRecebidos[0]["Disco_usado_(bytes)"])
            discoLivre = bytesParaGB(dadosRecebidos[0]["Disco_livre_(bytes)"])
        }

        if (dadosProcessos.length > 0) {
            console.log(dadosProcessos)
        }

        console.log(alertasBanco)

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

    const statusServidor = document.getElementById("ativo-inativo-desconectado");
    statusServidor.textContent = "Inativo";
    statusServidor.style.backgroundColor = "#f75454";

    const saudeServidor = document.getElementById("texto-saude-servidor");
    saudeServidor.textContent = "Inativo";
    saudeServidor.style.color = "#f75454";

    const uptimeSistema = document.getElementById("uptimeServidor");
    uptimeSistema.style.color = "#f75454";

    const uptimeSistemaSeta = document.getElementById("uptimeServidorSeta");
    uptimeSistemaSeta.style.color = "#f75454";

    const tbody = document.getElementById("tbody-processos");

    const tr = `
    <tr>
        <td>Processo Inativo</td>
        <td>0%</td>
        <td>0%</td>
        <td><span class="status ativo" id="ativo-processo" style="background-color:#f75454">Inativo</span></td>
    </tr>
    <tr>
        <td>Processo Inativo</td>
        <td>0%</td>
        <td>0%</td>
        <td><span class="status ativo" id="ativo-processo" style="background-color:#f75454">Inativo</span></td>
    </tr>
    <tr>
        <td>Processo Inativo</td>
        <td>0%</td>
        <td>0%</td>
        <td><span class="status ativo" id="ativo-processo" style="background-color:#f75454">Inativo</span></td>
    </tr>
    <tr>
        <td>Processo Inativo</td>
        <td>0%</td>
        <td>0%</td>
        <td><span class="status ativo" id="ativo-processo" style="background-color:#f75454">Inativo</span></td>
    </tr>
    <tr>
        <td>Processo Inativo</td>
        <td>0%</td>
        <td>0%</td>
        <td><span class="status ativo" id="ativo-processo" style="background-color:#f75454">Inativo</span></td>
    </tr>
    `;

    tbody.insertAdjacentHTML("beforeend", tr);

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
                backgroundColor: ['#f75454', '#ca1c1cff'],
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

    document.getElementById("ativo-inativo-desconectado").textContent = "Ativo";
    detalhesServidor();
    utilizaçãoDeDisco();
    utilizacaoCPU(dadosBucket);
    utilizacaoDeRam(dadosBucket);
    escolherServidor();
    uptimeSistema(dadosBucket);
    processosServidor(dadosProcessos);
    totalAlertas(dadosBucket);
    saudeDoServidor(dadosBucket);
    alertasPelaSemana(dadosBucket);


    // Esconde o loading e mostra o conteúdo
    document.getElementById("loading").style.display = "none";
    document.getElementById("main-container").style.display = "flex";
}

function processosServidor(dadosProcessos) {

    const tbody = document.getElementById("tbody-processos");

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

    totalDeAlertas = 0

    for (i = 0; i < dadosBucket.length; i++) {
        if (dadosBucket[i]["alertaCpu"] == "sim") {
            totalDeAlertas++
        }
        if (dadosBucket[i]["alertaRam"] == "sim") {
            totalDeAlertas++
        }
        if (dadosBucket[i]["alertaDisco"] == "sim") {
            totalDeAlertas++
        }
    }

    console.log(totalDeAlertas)

    document.getElementById("alertas-totais").textContent = totalDeAlertas;

}

function uptimeSistema(dadosBucket) {
    let i = 0

    upTime = dadosBucket[0]["Uptime_(s)"]

    const interval = setInterval(() => {
        if (i >= dadosBucket.length) {
            clearInterval(interval); // para o setInterval quando terminar
            return;
        }

        const upTimeSegundos = dadosBucket[i]["Uptime_(s)"];
        const tempoFormatado = formatarTempo(upTimeSegundos);

        document.getElementById("uptimeServidor").textContent = tempoFormatado;

        i++;
    }, 1500); // executa a cada 2.5s
}

function formatarTempo(segundos) {
    const h = Math.floor(segundos / 3600);
    const m = Math.floor((segundos % 3600) / 60);
    const s = segundos % 60;

    // adiciona zero à esquerda
    const hh = String(h).padStart(2, "0");
    const mm = String(m).padStart(2, "0");
    const ss = String(s).padStart(2, "0");

    return `${hh}:${mm}:${ss}`;
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

    usoCPU = dadosBucket[0]["Uso_de_Cpu"]

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

        usoCPU = dadosBucket[i]["Uso_de_Cpu"]

        chartCPU.data.datasets[0].data = [usoCPU, 100 - usoCPU];
        chartCPU.update();

        i++;
    }, 1500); // executa a cada 2.5s

}

function utilizacaoDeRam(dadosBucket) {
    let i = 0;

    const velocimetroram = document.getElementById('velocimetroram').getContext('2d');

    usoRAM = dadosBucket[0]["Uso_de_RAM"]

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

        usoRAM = dadosBucket[i]["Uso_de_RAM"]

        chartRAM.data.datasets[0].data = [usoRAM, 100 - usoRAM];
        chartRAM.update();

        i++;
    }, 1500);

}

function distribuicaoDeAlertasPorComponente(dadosBucket) {
    let i = 0;


    const interval = setInterval(() => {
        if (i >= dadosBucket.length) {
            clearInterval(interval); // para o setInterval quando terminar
            return;
        }

        usoRAM = dadosBucket[i]["Uso_de_RAM"]

        chartRAM.data.datasets[0].data = [usoRAM, 100 - usoRAM];
        chartRAM.update();

        i++;
    }, 1500);

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

function saudeDoServidor(dadosBucket) {
    let i = 0

    const interval = setInterval(() => {
        if (i >= dadosBucket.length) {
            clearInterval(interval); // para o setInterval quando terminar
            return;
        }

        statusSaudeDoServidor = dadosBucket[i]["saudeServidor"]
        scoreDoServidor = dadosBucket[i]["scoreSaudeServidor"]

        if (statusSaudeDoServidor == "Saudável") {
            document.getElementById("texto-saude-servidor").textContent = statusSaudeDoServidor
            document.getElementById("texto-saude-servidor").style.color = "#4addf6";

            document.getElementById("nivel10").style.backgroundColor = "#4addf6";
            document.getElementById("nivel9").style.backgroundColor = "#38cde6";
            document.getElementById("nivel8").style.backgroundColor = "#2cc7e1";
            document.getElementById("nivel7").style.backgroundColor = "#24b8d1";
            document.getElementById("nivel6").style.backgroundColor = "#1badc6";
            document.getElementById("nivel5").style.backgroundColor = "#188b9f";
            document.getElementById("nivel4").style.backgroundColor = "#187484";

        } else if (statusSaudeDoServidor == "Alerta") {
            document.getElementById("texto-saude-servidor").textContent = statusSaudeDoServidor
            document.getElementById("texto-saude-servidor").style.color = "#188b9f";

            document.getElementById("nivel10").style.backgroundColor = "#c5c5c5";
            document.getElementById("nivel9").style.backgroundColor = "#c5c5c5";
            document.getElementById("nivel8").style.backgroundColor = "#c5c5c5";
            document.getElementById("nivel7").style.backgroundColor = "#c5c5c5";
            document.getElementById("nivel6").style.backgroundColor = "#1badc6";
            document.getElementById("nivel5").style.backgroundColor = "#188b9f";
            document.getElementById("nivel4").style.backgroundColor = "#187484";

        } else if (statusSaudeDoServidor == "Crítico") {
            document.getElementById("texto-saude-servidor").textContent = statusSaudeDoServidor
            document.getElementById("texto-saude-servidor").style.color = "#093037";

            document.getElementById("nivel10").style.backgroundColor = "#c5c5c5";
            document.getElementById("nivel9").style.backgroundColor = "#c5c5c5";
            document.getElementById("nivel8").style.backgroundColor = "#c5c5c5";
            document.getElementById("nivel7").style.backgroundColor = "#c5c5c5";
            document.getElementById("nivel6").style.backgroundColor = "#c5c5c5";
            document.getElementById("nivel5").style.backgroundColor = "#c5c5c5";
            document.getElementById("nivel4").style.backgroundColor = "#c5c5c5";
        }

        // document.getElementById("texto-saude-servidor").textContent(statusSaudeDoServidor)

        if (scoreDoServidor = dadosBucket)


            i++;
    }, 1500);
}

function alertasPelaSemana(dadosBucket){
    
}

function alertasPeloDia(){

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