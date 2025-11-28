// CERTIFICAR QUE JA TEM OS ARQUIVOS NO BUCKET E COM O NOME CERTO JSON DE PROCESSOS E JSON DE DADOS

const params = new URLSearchParams(window.location.search);

let ip
let hostname
let ramTotal
let discoTotal
let localizacao
let dadosRecebidos
let processos
let carregouPagina = false;
let chartRAM = null;
let chartCPU = null;
let graficoDisco = null;
let graficosAlertas24hrs = null;
let processando = false;
let atualizacaoIniciada = false;

const id = params.get("idServidor");
const nomeServidor = params.get("hostname");
const nomeHospital = sessionStorage.NOME_HOSPITAL;

const idServidor = id;
const key = `${id}_${nomeServidor}_${nomeHospital}_principal.json`;
const key2 = `${id}_${nomeServidor}_${nomeHospital}_processos.json`;

console.log(key)
console.log(key2)

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

lottie.loadAnimation({
    container: document.getElementById('loading'),
    renderer: 'svg',
    loop: true,
    autoplay: true,
    path: './assets/loading/loading.json'
});

document.addEventListener("DOMContentLoaded", async () => {
    document.getElementById("loading").style.display = "flex";
    document.getElementById("main-container").style.display = "none";

    try {
        const [resBanco, resLimites, resBucket, resProcess, resAlertas] = await Promise.all([
            fetch(`/suporteMicroRoutes/buscar-dados-banco/${idServidor}`),
            fetch(`/suporteMicroRoutes/limites-componentes/${idServidor}`),
            fetch(`/suporteMicroRoutes/buscar-dados-bucket/${key}`),
            fetch(`/suporteMicroRoutes/buscar-dados-bucket/${key2}`),
            fetch(`/suporteMicroRoutes/buscar-alertas-servidores/${idServidor}`)
        ]);

        const [dadosBanco, dadosLimites, dadosBucket, dadosProcessos, alertasServidor] = await Promise.all([
            resBanco.json(),
            resLimites.json(),
            resBucket.json(),
            resProcess.json(),
            resAlertas.json()
        ]);

        if (dadosLimites.length > 0) {
            limiteCPU = dadosLimites[0].limitePercentual;
            limiteRAM = dadosLimites[2].limitePercentual;
            limiteDisco = dadosLimites[1].limitePercentual;
        }

        if (dadosBanco.length > 0) {
            ip = dadosBanco[0].ip;
            hostname = dadosBanco[0].hostname;
            localizacao = dadosBanco[0].localizacao;
        }

        if (dadosBucket.length > 0) {
            dadosRecebidos = dadosBucket;
            discoTotal = bytesParaGB(dadosRecebidos[0]["Disco_total_(bytes)"]);
            ramTotal = bytesParaGB(dadosRecebidos[0]["RAM_total_(bytes)"]);
            discoUsado = bytesParaGB(dadosRecebidos[0]["Disco_usado_(bytes)"]);
            discoLivre = bytesParaGB(dadosRecebidos[0]["Disco_livre_(bytes)"]);
        }

        plotarDados(dadosBucket, dadosProcessos, alertasServidor);

        //GARANTIA ABSOLUTA: inicia APENAS UMA VEZ
        // Inicia o loop de atualizações só uma vez
        if (!atualizacaoIniciada) {
            atualizacaoIniciada = true;
            setInterval(buscarDadosDinamicos, 3000);
        }


    } catch (erro) {
        console.error("Erro ao buscar o arquivo do bucket", erro);
        servidorDesconectado();
        document.getElementById("loading").style.display = "none";
        document.getElementById("main-container").style.display = "flex";
    }
});


function plotarDados(dadosBucket, dadosProcessos, alertasServidor) {

    processos = dadosProcessos;

    document.getElementById("ativo-inativo-desconectado").textContent = "Ativo";
    detalhesServidor();
    utilizaçãoDeDisco();
    utilizacaoCPU(dadosBucket);
    utilizacaoDeRam(dadosBucket);
    escolherServidor();
    uptimeSistema(dadosBucket);
    renderizarProcessos(dadosProcessos);
    saudeDoServidor(dadosBucket);
    totalAlertas(alertasServidor);

    setTimeout(() => {
        distribuicaoDeAlertas24hrs(alertasServidor);
    }, 50);

    if (carregouPagina == false) {
        // Esconde o loading e mostra o conteúdo
        document.getElementById("loading").style.display = "none";
        document.getElementById("main-container").style.display = "flex";
    }

    carregouPagina = true
}

// Função que faz apenas os fetches dinâmicos
async function buscarDadosDinamicos() {
    if (processando) return;
    processando = true;

    console.log("puxou novos dados!!");

    try {
        const [resBucket, resProcess, resAlertas] = await Promise.all([
            fetch(`/suporteMicroRoutes/buscar-dados-bucket/${key}`),
            fetch(`/suporteMicroRoutes/buscar-dados-bucket/${key2}`),
            fetch(`/suporteMicroRoutes/buscar-alertas-servidores/${idServidor}`)
        ]);

        const [dadosBucket, dadosProcessos, alertasServidor] = await Promise.all([
            resBucket.json(),
            resProcess.json(),
            resAlertas.json()
        ]);

        plotarDados(dadosBucket, dadosProcessos, alertasServidor);

    } catch (erro) {
        console.error("Erro ao buscar dados dinâmicos:", erro);
    }

    processando = false;
}



document.getElementById("listaProcessos").addEventListener("change", function () {

    const filtro = this.value;
    const processosFiltrados = filtrarProcessos(processos, filtro);
    renderizarProcessos(processosFiltrados);
});


function filtrarProcessos(listaOriginal, tipoFiltro) {

    // Faço uma cópia só pra não bagunçar o array original
    let listaFiltrada = [...listaOriginal];

    switch (tipoFiltro) {

        case "ram":
            listaFiltrada.sort((procA, procB) => procB.Uso_Ram_Percent - procA.Uso_Ram_Percent);
            break;

        case "threads":
            listaFiltrada.sort((procA, procB) => procB.Num_Threads - procA.Num_Threads);
            break;

        case "status-running":
            listaFiltrada = listaFiltrada.filter(proc => proc.Status === "running");
            break;

        case "status-stopped":
            listaFiltrada = listaFiltrada.filter(proc => proc.Status === "stopped");
            break;
    }

    return listaFiltrada;
}


function renderizarProcessos(dados) {
    const tbody = document.getElementById("tbody-processos");
    tbody.innerHTML = ""; // limpa a tabela

    dados.forEach(processo => {
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

function uptimeSistema(dadosBucket) {
    let ultimoUptime = null;

    const upTimeSegundos = dadosBucket[0]["Uptime_(s)"];
    const tempoFormatado = formatarTempo(upTimeSegundos);

    document.getElementById("uptimeServidor").textContent = tempoFormatado;

    if (ultimoUptime !== null && upTimeSegundos <= ultimoUptime) {
        console.log("Uptime parou de subir! Último valor:", upTimeSegundos);

        document.getElementById("status-uptime").classList.remove("ok")
        document.getElementById("status-uptime").classList.add("alerta")
        document.getElementById("status-uptime").textContent = "Alerta"
    } else {
        document.getElementById("status-uptime").classList.remove("alerta")
        document.getElementById("status-uptime").classList.add("ok")
        document.getElementById("status-uptime").textContent = "Normal"
    }

    ultimoUptime = upTimeSegundos;
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

    if (!chartCPU) {
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
                    subtitle: {
                        display: true,
                        text: 'Consumo atual de recurso.',
                        font: {
                            size: 12
                        },
                        color: 'gray',
                        padding: {
                            top: -8
                        }
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
                    ctx.fillText(usoCPU + '%', width / 2, height / 0.8);

                }
            }]
        });
    } else {
        chartCPU.data.datasets[0].data = [usoCPU, 100 - usoCPU];
        chartCPU.options.plugins.textoCentral = usoCPU;
        chartCPU.update();
    }

    if (usoCPU > limiteCPU) {
        document.getElementById("status-cpu").classList.remove("ok")
        document.getElementById("status-cpu").classList.add("alerta")
        document.getElementById("status-cpu").textContent = "Alerta"
    } else {
        document.getElementById("status-cpu").classList.remove("alerta")
        document.getElementById("status-cpu").classList.add("ok")
        document.getElementById("status-cpu").textContent = "Normal"
    }
    // executa a cada 2.5s
}

function utilizacaoDeRam(dadosBucket) {

    const velocimetroram = document.getElementById('velocimetroram').getContext('2d');

    usoRAM = dadosBucket[0]["Uso_de_RAM"];

    if (!chartRAM) {
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
                rotation: -90,
                circumference: 180,
                cutout: '65%',
                plugins: {
                    legend: { display: false },
                    title: {
                        display: true,
                        text: 'Utilização de RAM',
                        font: { size: 18, weight: 'bold' },
                        color: 'black'
                    },
                    subtitle: {
                        display: true,
                        text: 'Consumo atual de recurso.',
                        font: { size: 12 },
                        color: 'gray',
                        padding: { top: -8 }
                    },
                    tooltip: { enabled: false }
                },
            },
            plugins: [{
                id: 'textoCentral',
                afterDraw(chart) {
                    const { ctx, chartArea: { width, height } } = chart;
                    ctx.save();
                    ctx.font = 'bold 28px Barlow';
                    ctx.fillStyle = '#000';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(usoRAM + '%', width / 2, height / 0.8);
                }
            }]
        });
    } else {
        chartRAM.data.datasets[0].data = [usoRAM, 100 - usoRAM];
        chartRAM.options.plugins.textoCentral = usoRAM;
        chartRAM.update();
    }

    if (usoRAM > limiteRAM) {
        document.getElementById("status-ram").classList.remove("ok")
        document.getElementById("status-ram").classList.add("alerta")
        document.getElementById("status-ram").textContent = "Alerta"
    } else {
        document.getElementById("status-ram").classList.remove("alerta")
        document.getElementById("status-ram").classList.add("ok")
        document.getElementById("status-ram").textContent = "Normal"
    }
}

function utilizaçãoDeDisco() {

    porcentagemDiscoUsado = Math.round((discoUsado / discoTotal) * 100)

    const ctx = document.getElementById('graficoPizza').getContext('2d');

    if (!graficoDisco) {
        graficoDisco = new Chart(ctx, {
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

                    },
                    subtitle: {
                        display: true,
                        text: 'Disco livre | Disco usado.',
                        font: {
                            size: 13
                        },
                        color: 'gray',
                        padding: {
                            top: -8.5
                        }
                    },
                }
            }
        });
    } else {
        // Atualiza os dados do gráfico sem recriar
        graficoDisco.data.datasets[0].data = [100 - porcentagemDiscoUsado, porcentagemDiscoUsado];
        graficoDisco.data.labels = [`Livre ${discoTotal - discoUsado} GB`, `Usado ${discoUsado}GB`];
        graficoDisco.update(); // importante: atualiza o gráfico na tela
    }

    if (porcentagemDiscoUsado > limiteDisco) {
        document.getElementById("status-disco").classList.remove("ok")
        document.getElementById("status-disco").classList.add("alerta")
        document.getElementById("status-disco").textContent = "Alerta"

    } else {
        document.getElementById("status-disco").classList.remove("alerta")
        document.getElementById("status-disco").classList.add("ok")
        document.getElementById("status-disco").textContent = "Normal"
    }
}

function saudeDoServidor() {
    // KPIs que vamos verificar (id dos elementos)
    const kpis = [
        "status-cpu",
        "status-ram",
        "status-disco",
        "status-uptime",
        "status-total-alerta"
    ];

    let score = 0;

    // Loop para ver quantos estão em alerta
    for (let i = 0; i < kpis.length; i++) {
        const elem = document.getElementById(kpis[i]);
        if (!elem) continue;

        const texto = elem.textContent.trim();
        if (texto === "Alerta") {
            score++;
        }
    }

    // Define o status final com base no score
    let statusFinal;
    if (score === 0) {
        statusFinal = "Saudável";
    } else if (score <= 2) {
        statusFinal = "Alerta";
    } else {
        statusFinal = "Crítico";
    }

    // Atualiza o texto da saúde do servidor
    const textoSaude = document.getElementById("texto-saude-servidor");
    textoSaude.textContent = statusFinal;

    // Cores separadas manualmente
    if (statusFinal === "Saudável") {
        textoSaude.style.color = "#4addf6";
    } else if (statusFinal === "Alerta") {
        textoSaude.style.color = "#188b9f";
    } else {
        textoSaude.style.color = "#093037";
    }

    // Atualiza as bolinhas de nível
    const niveis = ["nivel10", "nivel9", "nivel8", "nivel7", "nivel6", "nivel5", "nivel4"];

    for (let i = 0; i < niveis.length; i++) {
        const bolinha = document.getElementById(niveis[i]);
        if (!bolinha) continue;

        // Saudável: cada nível tem uma cor diferente
        if (statusFinal === "Saudável") {
            const coresSaudavel = [
                "#4addf6",
                "#38cde6",
                "#2cc7e1",
                "#24b8d1",
                "#1badc6",
                "#188b9f",
                "#187484"
            ];
            bolinha.style.backgroundColor = coresSaudavel[i];
        }

        // Alerta: primeiras ficam apagadas
        else if (statusFinal === "Alerta") {
            if (i < 4) {
                bolinha.style.backgroundColor = "#c5c5c5";
            } else {
                const coresAlerta = ["#1badc6", "#188b9f", "#187484"];
                bolinha.style.backgroundColor = coresAlerta[i - 4];
            }
        }

        // Crítico: tudo apagado
        else {
            bolinha.style.backgroundColor = "#c5c5c5";
        }
    }
}


function totalAlertas(alertasServidor) {

    let totalAlertas = 0;
    const agora = new Date();

    for (let i = 0; i < alertasServidor.issues.length; i++) {

        let data = alertasServidor.issues[i].fields.created;
        let alerta = alertasServidor.issues[i].fields.summary;
        let dateObj = new Date(data);

        // console.log(dateObj.toLocaleString("pt-BR"));

        const limite24h = agora.getTime() - (24 * 60 * 60 * 1000);

        // agora você compara:
        if (dateObj.getTime() >= limite24h && alerta.includes(nomeServidor)) {

            if (alerta.includes("Alerta DISCO:") || alerta.includes("Alerta CPU:") || alerta.includes("Alerta RAM:")) {
                // console.log("Cai nas últimas 24h:", dateObj);
                totalAlertas++

            }
        }
    }

    if (totalAlertas >= 3) {
        document.getElementById("status-total-alerta").classList.remove("ok")
        document.getElementById("status-total-alerta").classList.add("alerta")
        document.getElementById("status-total-alerta").textContent = "Alerta"
    } else {
        document.getElementById("status-total-alerta").classList.remove("alerta")
        document.getElementById("status-total-alerta").classList.add("ok")
        document.getElementById("status-total-alerta").textContent = "Normal"
    }

    document.getElementById("alertas-totais").textContent = totalAlertas;
}

function distribuicaoDeAlertas24hrs(alertasServidor) {
    const labels = [];
    const cpu = Array(24).fill(0);
    const ram = Array(24).fill(0);
    const disco = Array(24).fill(0);
    const agora = new Date();

    const limite24h = agora.getTime() - (24 * 60 * 60 * 1000);

    // Cria labels das últimas 24h
    for (let i = 23; i >= 0; i--) {
        const hora = new Date(agora.getTime() - i * 3600 * 1000);
        labels.push(hora.getHours().toString().padStart(2, '0') + ':00');
    }

    for (let i = 0; i < alertasServidor.issues.length; i++) {

        let data = alertasServidor.issues[i].fields.created;
        let alerta = alertasServidor.issues[i].fields.summary;
        let dateObj = new Date(data);

        if (dateObj.getTime() >= limite24h) {

            // Calcula índice
            let diferencaHoras = Math.floor((agora - dateObj) / (1000 * 60 * 60));
            let index = 23 - diferencaHoras;

            if (index >= 0 && index < 24) {
                if (alerta.includes("Alerta DISCO:") && alerta.includes(nomeServidor)) {
                    disco[index]++;
                } else if (alerta.includes("Alerta CPU:") && alerta.includes(nomeServidor)) {
                    cpu[index]++;
                } else if (alerta.includes("Alerta RAM:") && alerta.includes(nomeServidor)) {
                    ram[index]++;
                }
            }
        }
    }

    // Desenha o gráfico
    const ctx3 = document.getElementById('graficoLinha').getContext('2d');

    if (!graficosAlertas24hrs) {
        graficosAlertas24hrs = new Chart(ctx3, {
            type: 'line',
            data: {
                labels,
                datasets: [
                    {
                        label: 'CPU',
                        data: cpu,
                        borderColor: '#45d4dc',
                        backgroundColor: 'rgba(69, 212, 220, 0.2)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.3,
                        pointRadius: 5
                    },
                    {
                        label: 'RAM',
                        data: ram,
                        borderColor: '#1f7f8d',
                        backgroundColor: 'rgba(31, 127, 141, 0.2)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.3,
                        pointRadius: 5
                    },
                    {
                        label: 'DISCO',
                        data: disco,
                        borderColor: '#0d3e47',
                        backgroundColor: 'rgba(13, 62, 71, 0.2)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.3,
                        pointRadius: 5
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Distribuição de alertas por componente (últimas 24h)',
                        font: { size: 17, weight: 'bold' },
                        color: 'black'
                    },
                    legend: {
                        display: true,
                        position: 'right'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Nº Alertas',
                            color: 'black',
                            font: { size: 14, weight: 'bold' }
                        }
                    }
                }
            }
        });
    } else {
        // Atualiza os dados existentes
        graficosAlertas24hrs.data.datasets[0].data = cpu;
        graficosAlertas24hrs.data.datasets[1].data = ram;
        graficosAlertas24hrs.data.datasets[2].data = disco;
        graficosAlertas24hrs.data.labels = labels; // atualiza labels caso hora mude
        graficosAlertas24hrs.update(); // renderiza as alterações
    }

}



// -------------------------------------------------------------------------------------------------------

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

    document.getElementById("nivel10").style.backgroundColor = "#c5c5c5";
    document.getElementById("nivel9").style.backgroundColor = "#c5c5c5";
    document.getElementById("nivel8").style.backgroundColor = "#c5c5c5";
    document.getElementById("nivel7").style.backgroundColor = "#c5c5c5";
    document.getElementById("nivel6").style.backgroundColor = "#c5c5c5";
    document.getElementById("nivel5").style.backgroundColor = "#c5c5c5";
    document.getElementById("nivel4").style.backgroundColor = "#c5c5c5";
    document.getElementById("nivel3").style.backgroundColor = "#c5c5c5";
    document.getElementById("nivel2").style.backgroundColor = "#c5c5c5";
    document.getElementById("nivel1").style.backgroundColor = "#c5c5c5";

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
                subtitle: {
                    display: true,
                    text: 'Consumo atual de recurso.',
                    font: {
                        size: 12
                    },
                    color: 'gray',
                    padding: {
                        top: -8
                    }
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
                ctx.fillText(usoCPU + '%', width / 2, height / 0.8);
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
                subtitle: {
                    display: true,
                    text: 'Consumo atual de recurso.',
                    font: {
                        size: 12
                    },
                    color: 'gray',
                    padding: {
                        top: -8
                    }
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
                ctx.fillText(usoRAM + '%', width / 2, height / 0.8);
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
                },
                subtitle: {
                    display: true,
                    text: 'Disco livre | Disco usado.',
                    font: {
                        size: 13
                    },
                    color: 'gray',
                    padding: {
                        top: -8.5
                    }
                }
            }
        }
    });

    setTimeout(() => {
        const ctx3 = document.getElementById('graficoLinha').getContext('2d');

        new Chart(ctx3, {
            type: 'line',
            data: {
                labels: ['12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'],
                datasets: [
                    {
                        label: 'CPU',
                        data: [0, 0, 0, 0, 0, 0, 0],
                        borderColor: '#f75454',
                        backgroundColor: '#f75454',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.3,
                        pointRadius: 5,
                        pointBackgroundColor: '#f75454'
                    },
                    {
                        label: 'RAM',
                        data: [0, 0, 0, 0, 0, 0, 0],
                        borderColor: '#ca1c1cff',
                        backgroundColor: '#ca1c1cff',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.3,
                        pointRadius: 5,
                        pointBackgroundColor: '#ca1c1cff'
                    },
                    {
                        label: 'DISCO',
                        data: [0, 0, 0, 0, 0, 0, 0],
                        borderColor: '#ca1c1cff',
                        backgroundColor: '#ca1c1cff',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.3,
                        pointRadius: 5,
                        pointBackgroundColor: '#ca1c1cff'
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
    }, 50);
}

