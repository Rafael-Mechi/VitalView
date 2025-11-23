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
let processos

const id = params.get("idServidor");
const nomeServidor = params.get("hostname");
const nomeHospital = sessionStorage.NOME_HOSPITAL;

const idServidor = id;
const key = `${id}_${nomeServidor}_${nomeHospital}.json`;
const key2 = `processos_${id}_${nomeServidor}_${nomeHospital}.json`

console.log(key)

lottie.loadAnimation({
    container: document.getElementById('loading'),
    renderer: 'svg',
    loop: true,
    autoplay: true,
    path: './assets/loading/loading.json'
});

document.addEventListener("DOMContentLoaded", async () => {

    console.log(key2)

    // Mostra o loading
    document.getElementById("loading").style.display = "flex";
    document.getElementById("main-container").style.display = "none";

    try {
        //Faz as duas requisições ao mesmo tempo resBucket, resProcess
        const [resBanco, resLimites, resBucket, resProcess, resAlertas] = await Promise.all([
            fetch(`/suporteMicroRoutes/buscar-dados-banco/${idServidor}`),
            fetch(`/suporteMicroRoutes/limites-componentes/${idServidor}`),
            fetch(`/suporteMicroRoutes/buscar-dados-bucket/${key}`),
            fetch(`/suporteMicroRoutes/buscar-dados-bucket/${key2}`),
            fetch(`/suporteMicroRoutes/buscar-alertas-servidores/${idServidor}`)
        ]);

        //Converte ambas para JSON dadosBucket, dadosProcessos
        const [dadosBanco, dadosLimites, dadosBucket, dadosProcessos, alertasServidor] = await Promise.all([
            resBanco.json(),
            resLimites.json(),
            resBucket.json(),
            resProcess.json(),
            resAlertas.json()
        ]);

        if (dadosLimites.length > 0) {
            limiteCPU = dadosLimites[0].limitePercentual
            limiteDisco = dadosLimites[1].limitePercentual
            limiteRAM = dadosLimites[2].limitePercentual
        }

        console.log(limiteCPU)
        console.log(limiteDisco)
        console.log(limiteRAM)

        //Dados do banco
        if (dadosBanco.length > 0) {
            ip = dadosBanco[0].ip;
            hostname = dadosBanco[0].hostname;
            localizacao = dadosBanco[0].localizacao;
        }

        // Dados do bucket
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

        console.log(alertasServidor)

        if (alertasServidor.length > 0) {

        }

        processos = dadosProcessos;
        renderizarProcessos(processos);
        //Exibe tudo 
        plotarDados(dadosBucket, dadosLimites, dadosProcessos, alertasServidor);

    } catch (erro) {
        console.log("Erro ao buscar o arquivo do bucket");
        console.log("Verifique se o voce tem o json principal e o json de processos no bucket");
        console.log("Verifique se o token do jira está configurado no .env");
        console.log("Verifique se o servidor que esta tentando acessar tem os parametros de limite cpu ram e disco");
        console.error(erro)
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

//dadosBucket, dadosProcessos

function plotarDados(dadosBucket, dadosLimite, dadosProcessos, alertasServidor) {

    document.getElementById("ativo-inativo-desconectado").textContent = "Ativo";
    detalhesServidor();
    utilizaçãoDeDisco();
    utilizacaoCPU(dadosBucket);
    utilizacaoDeRam(dadosBucket);
    escolherServidor();
    uptimeSistema(dadosBucket);
    processosServidor(dadosProcessos);
    saudeDoServidor(dadosBucket);
    totalAlertas(alertasServidor);

    setTimeout(() => {
        distribuicaoDeAlertas24hrs(alertasServidor);
    }, 50);

    // Esconde o loading e mostra o conteúdo
    document.getElementById("loading").style.display = "none";
    document.getElementById("main-container").style.display = "flex";
}

function processosServidor(dadosProcessos) {

    const tbody = document.getElementById("tbody-processos");
    console.log(dadosProcessos)

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

document.getElementById("listaProcessos").addEventListener("change", function () {
    console.log("teste")
    const filtro = this.value;
    const processosFiltrados = filtrarProcessos(processos, filtro);
    renderizarProcessos(processosFiltrados);
});


function filtrarProcessos(dados, filtro) {

    let processos = [...dados]; // cópia do array original

    switch (filtro) {

        case "ram":
            processos.sort((a, b) => b.Uso_Ram_Percent - a.Uso_Ram_Percent);
            break;

        case "threads":
            processos.sort((a, b) => b.Num_Threads - a.Num_Threads);
            break;

        case "status-running":
            processos = processos.filter(p => p.Status === "running");
            break;

        case "status-stopped":
            processos = processos.filter(p => p.Status === "stopped");
            break;
    }

    return processos;
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
    let i = 0
    let ultimoUptime = null;

    upTime = dadosBucket[0]["Uptime_(s)"]

    const interval = setInterval(() => {
        if (i >= dadosBucket.length) {
            clearInterval(interval); // para o setInterval quando terminar
            return;
        }

        const upTimeSegundos = dadosBucket[i]["Uptime_(s)"];
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


    const interval = setInterval(() => {
        if (i >= dadosBucket.length) {
            clearInterval(interval); // para o setInterval quando terminar
            return;
        }

        usoCPU = dadosBucket[i]["Uso_de_Cpu"]

        chartCPU.data.datasets[0].data = [usoCPU, 100 - usoCPU];
        chartCPU.update();

        if (usoCPU > limiteCPU) {
            document.getElementById("status-cpu").classList.remove("ok")
            document.getElementById("status-cpu").classList.add("alerta")
            document.getElementById("status-cpu").textContent = "Alerta"
        } else {
            document.getElementById("status-cpu").classList.remove("alerta")
            document.getElementById("status-cpu").classList.add("ok")
            document.getElementById("status-cpu").textContent = "Normal"
        }

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

    const interval = setInterval(() => {
        if (i >= dadosBucket.length) {
            clearInterval(interval); // para o setInterval quando terminar
            return;
        }

        usoRAM = dadosBucket[i]["Uso_de_RAM"]

        chartRAM.data.datasets[0].data = [usoRAM, 100 - usoRAM];
        chartRAM.update();

        if (usoRAM > limiteRAM) {
            document.getElementById("status-ram").classList.remove("ok")
            document.getElementById("status-ram").classList.add("alerta")
            document.getElementById("status-ram").textContent = "Alerta"
        } else {
            document.getElementById("status-ram").classList.remove("alerta")
            document.getElementById("status-ram").classList.add("ok")
            document.getElementById("status-ram").textContent = "Normal"
        }
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


        i++;
    }, 1500);
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
        if (dateObj.getTime() >= limite24h) {

            if (alerta.includes("Alerta DISCO:") || alerta.includes("Alerta CPU:") || alerta.includes("Alerta RAM:")) {
                console.log(alerta)
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
                if (alerta.includes("Alerta DISCO:")) {
                    disco[index]++;
                } else if (alerta.includes("Alerta CPU:")) {
                    cpu[index]++;
                } else if (alerta.includes("Alerta RAM:")) {
                    ram[index]++;
                }
            }
        }
    }

    // Desenha o gráfico
    const ctx3 = document.getElementById('graficoLinha').getContext('2d');

    new Chart(ctx3, {
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
}



// -------------------------------------------------------------------------------------------------------


