//Modais do Meki 💅🏻

let infoBtns = document.querySelectorAll('.infoBtn');
let modals = document.querySelectorAll('.modal');
let closeBtns = document.querySelectorAll('.closeBtn');

infoBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
        let target = btn.dataset.target;
        var modal = document.getElementById(target);
        if (modal) {
            modal.style.display = 'flex';
        }
    });
});

closeBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
        var modal = btn.closest('.modal');
        if (modal) {
            modal.style.display = 'none';
        }
    });
});

modals.forEach(function (modal) {
    modal.addEventListener('click', function (e) {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
});

// Permições

if (typeof protegerPagina === 'function') protegerPagina(['Técnico', 'Administrador']);
if (typeof aplicarCargoNaUI === 'function') aplicarCargoNaUI();

//parametrinhos do server

function obterParametrosServidor() {
    const params = new URLSearchParams(window.location.search);

    let idServidor = params.get('idServidor');
    let hostname = params.get('hostname');
    let idHospital = params.get('idhospital');

    if (idServidor) sessionStorage.ID_SERVIDOR = idServidor;
    if (hostname) sessionStorage.HOSTNAME_SERVIDOR = hostname;
    if (idHospital) sessionStorage.FK_HOSPITAL = idHospital;

    if (!idServidor) idServidor = sessionStorage.ID_SERVIDOR;
    if (!hostname) hostname = sessionStorage.HOSTNAME_SERVIDOR;
    if (!idHospital) idHospital = sessionStorage.FK_HOSPITAL;

    return { idServidor, hostname, idHospital };
}

const { idServidor, hostname, idHospital } = obterParametrosServidor();


// elements dashboardinha

const latNow = document.getElementById('latencia-atual');
const latBadge = document.getElementById('latencia-status');

const lossPctEl = document.getElementById('loss-pct');
const lossBadge = document.getElementById('loss-status');

const conVal = document.getElementById('conexoes-ativas');
const conBadge = document.getElementById('conexoes-status');

const barDown = document.getElementById('bar-down');
const barUp = document.getElementById('bar-up');

const valDownEl = document.getElementById('val-down');
const valUpEl = document.getElementById('val-up');

const downBadge = document.getElementById('down-status');
const upBadge = document.getElementById('up-status');

// principais variáveis

let LIMITES = null;
let ULTIMO_REGISTRO = null;

const CAPACIDADE_BANDA = 300;
const MAX_PONTOS = 12;

const METRICAS = {
    pacotesPerdidos: 1,
    conexoesAtivas: 0,
    banda: { usadaDown: 0, usadaUp: 0 },
    ping: {
        rttMsAtual: 0,
        enviados: 10,
        perdidos: 0
    }
};


function setBadge(el, status, numberEl) {
    if (!el) return;

    el.classList.remove('ok', 'alerta');

    if (status === 'Alerta') el.classList.add('alerta');
    if (status === 'Normal') el.classList.add('ok');

    el.textContent = status;

    if (numberEl) {
        numberEl.classList.remove('ok', 'alerta');
        if (status === 'Alerta') numberEl.classList.add('alerta');
        if (status === 'Normal') numberEl.classList.add('ok');
    }
}

function setBar(el, value, max) {
    if (!el) return;
    const pct = Math.max(0, Math.min(100, (value / max) * 100));
    el.style.width = pct + '%';
    el.setAttribute('aria-valuenow', value);
}


async function carregarLimites() {
    try {
        const resp = await fetch(`/rede/limites/${idServidor}`);
        if (!resp.ok) {
            console.error("Erro carregando limites:", resp.status);
            return;
        }

        LIMITES = await resp.json();
        console.log("LIMITES carregados:", LIMITES);
    } catch (e) {
        console.error("Erro buscar limites:", e);
    }
}


function atualizarMETRICASComRegistro(r) {

    if (r["Latencia_(ms)"] != null) {
        METRICAS.ping.rttMsAtual = r["Latencia_(ms)"];
    }

    let perdaPct = 0;
    if (r["Perda_de_Pacotes_(%)"] != null && r["Perda_de_Pacotes_(%)"] !== "") {
        perdaPct = r["Perda_de_Pacotes_(%)"];
    }

    METRICAS.ping.perdidos = (perdaPct / 100) * METRICAS.ping.enviados;

    if (r["Conexões_TCP_ESTABLISHED"] != null) {
        METRICAS.conexoesAtivas = r["Conexões_TCP_ESTABLISHED"];
    }

    if (r["Net_Down_(Mbps)"] != null) {
        METRICAS.banda.usadaDown = r["Net_Down_(Mbps)"];
    }

    if (r["Net_Up_(Mbps)"] != null) {
        METRICAS.banda.usadaUp = r["Net_Up_(Mbps)"];
    }
}

let chartRede = null;
let labelsTempo = [];
let dadosIn = [];
let dadosOut = [];


function initChart() {

    const ioCanvas = document.getElementById("ioChart");
    if (!ioCanvas || !window.Chart) return;

    const ctx = ioCanvas.getContext("2d");

    const corIn = '#2CD4C2';  
    const corOut = '#0AA8A0';  

    chartRede = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labelsTempo.length > 0 ? labelsTempo : ["--", "--", "--", "--", "--"],
            datasets: [
                {
                    label: 'Pacotes IN',
                    data: dadosIn.length > 0 ? dadosIn : [0, 0, 0, 0, 0],
                    borderColor: corIn,
                    backgroundColor: corIn + "40",
                    tension: 0.35,
                    pointRadius: 3,
                    fill: false
                },
                {
                    label: 'Pacotes OUT',
                    data: dadosOut.length > 0 ? dadosOut : [0, 0, 0, 0, 0],
                    borderColor: corOut,
                    backgroundColor: corOut + "40",
                    tension: 0.35,
                    pointRadius: 3,
                    fill: false
                }
            ]
        },
        options: {
            maintainAspectRatio: false,
            responsive: true,
            scales: {
                x: { grid: { display: false } },
                y: {
                    beginAtZero: true,
                    grid: { color: '#eef2f7' }
                }
            },
            plugins: {
                legend: { position: 'top' }
            }
        }
    });
}

function atualizarChartRede(registros) {

    labelsTempo.length = 0;
    dadosIn.length = 0;
    dadosOut.length = 0;

    registros.forEach(r => {
        labelsTempo.push(
            new Date(r["Data_da_Coleta"]).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        );
        dadosIn.push(r["Pacotes_IN_(intervalo)"] || 0);
        dadosOut.push(r["Pacotes_OUT_(intervalo)"] || 0);
    });

    if (chartRede) {
        chartRede.data.labels = labelsTempo;
        chartRede.data.datasets[0].data = dadosIn;
        chartRede.data.datasets[1].data = dadosOut;
        chartRede.update();
    }
}

function pushChartPoint(inValue, outValue) {
    const hora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    labelsTempo.push(hora);
    dadosIn.push(inValue);
    dadosOut.push(outValue);

    if (labelsTempo.length > 12) {
        labelsTempo.shift();
        dadosIn.shift();
        dadosOut.shift();
    }

    if (chartRede) chartRede.update();
}


function renderKPIs() {

    // Latência
    if (latNow && latBadge) {
        const lat = Math.round(METRICAS.ping.rttMsAtual);
        latNow.textContent = lat + ' ms';

        if (LIMITES?.latenciaMax != null) {
            setBadge(latBadge, lat <= LIMITES.latenciaMax ? 'Normal' : 'Alerta', latNow);
        }
    }

    // Perda de pacotes
    if (lossPctEl && lossBadge) {
        const perdaPct = (METRICAS.ping.perdidos / METRICAS.ping.enviados) * 100;
        lossPctEl.textContent = perdaPct.toFixed(1) + '%';

        if (LIMITES?.perdaPacotesMax != null) {
            setBadge(lossBadge, perdaPct <= LIMITES.perdaPacotesMax ? 'Normal' : 'Alerta', lossPctEl);
        }
    }

    // Conexões
    if (conVal && conBadge) {
        const conexoes = Math.round(METRICAS.conexoesAtivas);
        conVal.textContent = conexoes;

        if (LIMITES?.conexoesMin != null && LIMITES?.conexoesMax != null) {
            const ok = conexoes >= LIMITES.conexoesMin && conexoes <= LIMITES.conexoesMax;
            setBadge(conBadge, ok ? 'Normal' : 'Alerta', conVal);
        }
    }

    // down up
    if (barDown && barUp) {
        const down = Math.round(METRICAS.banda.usadaDown);
        const up = Math.round(METRICAS.banda.usadaUp);

        valDownEl.textContent = down;
        valUpEl.textContent = up;

        setBar(barDown, down, 100);
        setBar(barUp, up, 100);

        if (LIMITES?.bandDownMin != null) {
            const estadoDown = down >= LIMITES.bandDownMin ? "Normal" : "Alerta";

            setBadge(downBadge, estadoDown);

            barDown.classList.remove("ok", "alerta");

            if (estadoDown === "Normal") {
                barDown.classList.add("ok");
            } else {
                barDown.classList.add("alerta");
            }
        }

        if (LIMITES?.bandUpMin != null) {
            const estadoUp = up >= LIMITES.bandUpMin ? "Normal" : "Alerta";

            setBadge(upBadge, estadoUp);

            barUp.classList.remove("ok", "alerta");

            if (estadoUp === "Normal") {
                barUp.classList.add("ok");
            } else {
                barUp.classList.add("alerta");
            }
        }

    }
}

async function carregarDadosRede() {
    try {
        const resp = await fetch(`/rede/dados/${hostname}`);
        const dados = await resp.json();

        if (!Array.isArray(dados) || dados.length === 0) return;

        ULTIMO_REGISTRO = dados[dados.length - 1];

        atualizarMETRICASComRegistro(ULTIMO_REGISTRO);
        atualizarChartRede(dados);
        renderKPIs();

    } catch (e) {
        console.error("Erro carregar rede:", e);
    }
}

async function tickReal() {
    try {
        const resp = await fetch(`/rede/dados/${hostname}`);
        const dados = await resp.json();

        if (!Array.isArray(dados) || dados.length === 0) return;

        const ultimo = dados[dados.length - 1];
        atualizarMETRICASComRegistro(ultimo);

        pushChartPoint(
            ultimo["Pacotes_IN_(intervalo)"] || 0,
            ultimo["Pacotes_OUT_(intervalo)"] || 0
        );

        renderKPIs();

    } catch (e) {
        console.error("Erro tickReal:", e);
    }
}

(async function start() {
    await carregarLimites();
    await carregarDadosRede();   
    initChart();                 
    setInterval(tickReal, 5000);
})();
