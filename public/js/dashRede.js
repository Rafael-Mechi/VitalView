// Servidor identificator ＼(ﾟｰﾟ＼)

function obterParametrosServidor() {
    const params = new URLSearchParams(window.location.search);

    let idServidor = params.get('idServidor');
    let hostname = params.get('hostname');
    let idHospital = params.get('idhospital');

    //salvo no sessionStorage
    if (idServidor) sessionStorage.ID_SERVIDOR = idServidor;
    if (hostname) sessionStorage.HOSTNAME_SERVIDOR = hostname;
    if (idHospital) sessionStorage.FK_HOSPITAL = idHospital;

    //pega do sessionStorage
    if (!idServidor) idServidor = sessionStorage.ID_SERVIDOR;
    if (!hostname) hostname = sessionStorage.HOSTNAME_SERVIDOR;
    if (!idHospital) idHospital = sessionStorage.FK_HOSPITAL;

    return { idServidor, hostname, idHospital };
}

// modais do Meki 💅🏻
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

        // my permissions bitch 💅🏻
        if (typeof protegerPagina === 'function') protegerPagina(['Técnico', 'Administrador']);
        if (typeof aplicarCargoNaUI === 'function') aplicarCargoNaUI();

        // Utilitários dos gráficos
        const teal = '#14b8a6';
        const teal2 = '#0ea5e9';

        function setBadge(el, status, numberEl) {
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
            const pct = Math.max(0, Math.min(100, (value / max) * 100));
            el.style.width = pct + '%';
            el.setAttribute('aria-valuenow', value);
        }

        // Variação dos dados mocados
        function jitter(base, maxStep, min = 0, max = Infinity) {
            const v = base + (Math.random() * 2 - 1) * maxStep;
            return Math.max(min, Math.min(max, v));
        }

        // Dados pré mocados
        const CAPACIDADE_BANDA = 300;
        const MAX_PONTOS = 12;

        const METRICAS = {
            pacotesPerdidos: 1,
            conexoesAtivas: 38,
            banda: { capacidade: CAPACIDADE_BANDA, usadaDown: 85, usadaUp: 18 },
            ping: {
                rttMsAtual: 23,
                enviados: 10,
                perdidos: 1
            }
        };

        // Elementos 
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

        // Gráfico entrada e saída
        const ioCanvas = document.getElementById('ioChart');
        let ioChart = null;

        function initChart() {
            if (!ioCanvas || !window.Chart) return;

            const agora = () => new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

            const ioLabels = Array.from({ length: 5 }, (_, i) => agora());
            const entrada = [40, 80, 10, 25, 40];
            const saida = [10, 30, 5, 12, 30];

            ioChart = new Chart(ioCanvas, {
                type: 'line',
                data: {
                    labels: ioLabels,
                    datasets: [
                        { label: 'Entrada', data: entrada, borderColor: teal2, backgroundColor: teal2, tension: .35, pointRadius: 3, fill: false },
                        { label: 'Saída', data: saida, borderColor: teal, backgroundColor: teal, tension: .35, pointRadius: 3, fill: false }
                    ]
                },
                options: {
                    maintainAspectRatio: false,
                    scales: { x: { grid: { display: false } }, y: { beginAtZero: true, grid: { color: '#eef2f7' } } },
                    plugins: { legend: { position: 'top' } }
                }
            });
        }

        function pushChartPoint(inVal, outVal) {
            if (!ioChart) return;
            const label = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

            ioChart.data.labels.push(label);
            ioChart.data.datasets[0].data.push(inVal);
            ioChart.data.datasets[1].data.push(outVal);

            while (ioChart.data.labels.length > MAX_PONTOS) {
                ioChart.data.labels.shift();
                ioChart.data.datasets.forEach(d => d.data.shift());
            }
            ioChart.update();
        }

        // KPI: Conexões
        function renderKPIs() {
            // Latência
            if (latNow && latBadge) {
                latNow.textContent = Math.round(METRICAS.ping.rttMsAtual) + ' ms';
                setBadge(latBadge, METRICAS.ping.rttMsAtual <= 80 ? 'Normal' : 'Alerta', latNow);
            }

            // Perda de Pacotes (%)
            if (lossPctEl && lossBadge) {
                const perdaPct = METRICAS.ping.enviados > 0
                    ? (METRICAS.ping.perdidos / METRICAS.ping.enviados) * 100
                    : 0;
                lossPctEl.textContent = perdaPct.toFixed(1) + '%';
                setBadge(lossBadge, perdaPct < 5 ? 'Normal' : 'Alerta', lossPctEl);
            }

            // Conexões
            if (conVal && conBadge) {
                conVal.textContent = Math.round(METRICAS.conexoesAtivas);
                const ok = METRICAS.conexoesAtivas >= 10 && METRICAS.conexoesAtivas <= 200;
                setBadge(conBadge, ok ? 'Normal' : 'Alerta', conVal);
            }

            // Barras Download/Upload
            if (barDown && barUp && valDownEl && valUpEl && downBadge && upBadge) {
                const down = Math.round(METRICAS.banda.usadaDown);
                const up = Math.round(METRICAS.banda.usadaUp);

                setBar(barDown, down, 100);
                setBar(barUp, up, 100);

                valDownEl.textContent = down;
                valUpEl.textContent = up;

                setBadge(downBadge, down >= 70 ? 'Normal' : 'Alerta');
                setBadge(upBadge, up >= 30 ? 'Normal' : 'Alerta');
            }
        }

        // SIMULAÇÃO DE DADOS
        function tickMock() {
            // Latência varia suavemente entre 15 e 120 ms
            METRICAS.ping.rttMsAtual = jitter(METRICAS.ping.rttMsAtual, 6, 15, 120);

            // Pacotes enviados/perdidos
            METRICAS.ping.enviados = Math.max(1, Math.round(jitter(METRICAS.ping.enviados, 2, 5, 30)));
            METRICAS.ping.perdidos = Math.round(Math.max(0, Math.min(METRICAS.ping.enviados, jitter(METRICAS.ping.perdidos, 1, 0, 5))));

            // Conexões ativas
            METRICAS.conexoesAtivas = Math.round(jitter(METRICAS.conexoesAtivas, 5, 12, 220));

            // Consumo de banda simulado (Mbps)
            METRICAS.banda.usadaDown = jitter(METRICAS.banda.usadaDown, 10, 10, 100);
            METRICAS.banda.usadaUp = jitter(METRICAS.banda.usadaUp, 5, 2, 100);

            // Gráfico IN/OUT
            const inPkts = Math.round(jitter(70, 25, 5, 140));
            const outPkts = Math.round(jitter(40, 20, 3, 100));
            pushChartPoint(inPkts, outPkts);

            renderKPIs();
        }

        initChart();
        renderKPIs();
        const TIMER_MS = 2000; // 2s
        const timerId = setInterval(tickMock, TIMER_MS);