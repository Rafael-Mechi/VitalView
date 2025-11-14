// ---------------- CONFIGURAÇÕES INICIAIS ----------------
const params = new URLSearchParams(window.location.search);
const idServidor = params.get("idServidor");

const valorAtividade = document.querySelector(".texto_esquerda h1");
const horaAtualizacao = document.querySelector(".texto_direita p:last-child");

const valorUso = document.querySelectorAll('.numero_uso_disco h1')[0];
const textoUso = document.querySelectorAll('.p_esquerda')[1];
const variacaoUso = document.querySelectorAll('.UD_texto_direita p')[0];

const valorTaxa = document.querySelectorAll('.numero_uso_disco h1')[1];
const variacaoTaxa = document.querySelectorAll('.UD_texto_direita p')[1];

const valorLatencia = document.querySelectorAll('.numero_uso_disco h1')[2];
const variacaoLatencia = document.querySelectorAll('.UD_texto_direita p')[2];

// ---------------- FUNÇÃO PRINCIPAL ----------------
async function carregarDados() {
  try {
    const resposta = await fetch(`/dashDiscoRoutes/servidores/${idServidor}/disco`);
    if (!resposta.ok) throw new Error("Falha ao buscar dados de disco");

    const dados = await resposta.json();
    console.log("Dados recebidos:", dados);
    console.log("Tipo:", typeof dados);
    console.log("Primeiros 10 itens:", Object.entries(dados).slice(0, 10));

    atualizarDash(dados);
  } catch (erro) {
    console.error("Erro ao buscar dados do bucket:", erro);
  }
}

carregarDados();
setInterval(carregarDados, 5000); // Atualiza a cada 5s

// ---------------- GRAFICO PRINCIPAL (ATIVIDADE GERAL) ----------------
const ctx = document.getElementById("graficoAtividade").getContext("2d");
const graficoAtividade = new Chart(ctx, {
  type: "line",
  data: {
    labels: Array.from({ length: 20 }, (_, i) => i + 1),
    datasets: [{
      label: "Atividade de Disco (%)",
      data: Array(20).fill(0),
      borderColor: "#00bcd4",
      tension: 0.3
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { beginAtZero: true, max: 100 },
      x: { display: false }
    },
    plugins: { legend: { display: false } }
  }
});

// ---------------- GRAFICO USO DE DISCO ----------------
const ctxUso = document.getElementById('graficoUsoDeDisco').getContext('2d');
const graficoUso = new Chart(ctxUso, {
  type: 'bar',
  data: {
    labels: ['Uso de Disco'],
    datasets: [{
      data: [0],
      backgroundColor: '#008c99',
      borderRadius: 10,
      barThickness: 20
    }]
  },
  options: {
    indexAxis: 'y',
    scales: {
      x: { min: 0, max: 100, ticks: { callback: v => v + '%' } },
      y: { display: false }
    },
    plugins: { legend: { display: false } }
  }
});

// ---------------- GRAFICO TAXA DE TRANSFERÊNCIA ----------------
const ctxTaxa = document.getElementById('graficoTaxaTransferencia').getContext('2d');
const graficoTaxa = new Chart(ctxTaxa, {
  type: 'bar',
  data: {
    labels: Array.from({ length: 30 }, (_, i) => i + 1),
    datasets: [{
      label: 'Taxa (MB/s)',
      data: Array(30).fill(0),
      backgroundColor: '#008c99',
      borderRadius: 4,
      barThickness: 6
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    scales: { x: { display: false }, y: { display: false, min: 0 } },
    plugins: { legend: { display: false } }
  }
});

// ---------------- GRAFICO LATÊNCIA ----------------
const ctxLatencia = document.getElementById('graficoLatencia').getContext('2d');
const graficoLatencia = new Chart(ctxLatencia, {
  type: 'bar',
  data: {
    labels: ['Latência média'],
    datasets: [{
      data: [0],
      backgroundColor: 'rgba(0, 255, 180, 0.8)',
      borderRadius: 8,
      barThickness: 10
    }]
  },
  options: {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    scales: { x: { display: false }, y: { display: false } },
    plugins: { legend: { display: false } }
  }
});

// ---------------- FUNÇÃO DE ATUALIZAÇÃO ----------------
function atualizarDash(dados) {
  const usoDisco = Number(dados[0]["Uso de Disco"]) || 0;
  const taxaLeitura = Number(dados[0]["Taxa escrita (MB/s)"])
  const taxaEscrita = Number(dados[0]["Taxa escrita (MB/s)"])
  const latMedia = Number(dados[0]["Latência (ms)"])
  const dataColeta = Number(dados[0]["Data da Coleta"] || new Date());

  // Gráfico principal
  const dataset = graficoAtividade.data.datasets[0];
  dataset.data.shift();
  dataset.data.push(usoDisco);
  graficoAtividade.update();

  valorAtividade.textContent = `${usoDisco.toFixed(1)}%`;
  horaAtualizacao.textContent = `Atualizado às ${new Date(dataColeta).toLocaleTimeString("pt-BR", { hour12: false })}`;

  // Uso de disco
  graficoUso.data.datasets[0].data = [usoDisco];
  graficoUso.update();
  valorUso.textContent = `${usoDisco.toFixed(1)}%`;
  textoUso.textContent = `${(usoDisco * 5).toFixed(1)} GB usados de 500 GB`;

  // Taxa de transferência média
  const taxaMedia = ((taxaLeitura + taxaEscrita) / 2).toFixed(2);
  graficoTaxa.data.datasets[0].data.shift();
  graficoTaxa.data.datasets[0].data.push(taxaMedia);
  graficoTaxa.update();
  valorTaxa.textContent = `${taxaMedia} MB/s`;

  const variacaoTx = ((Math.random() * 2 - 1) * 0.5).toFixed(1);
  variacaoTaxa.textContent = `${variacaoTx >= 0 ? "▲" : "▼"} ${variacaoTx} MB/s`;
  variacaoTaxa.style.color = variacaoTx >= 0 ? "green" : "red";

  // Latência
  graficoLatencia.data.datasets[0].data = [latMedia];
  graficoLatencia.update();
  valorLatencia.textContent = `${latMedia.toFixed(1)} ms`;

  const variacaoLat = ((Math.random() * 2 - 1) * 0.5).toFixed(1);
  variacaoLatencia.textContent = `${variacaoLat >= 0 ? "▲" : "▼"} ${variacaoLat} ms`;
  variacaoLatencia.style.color = variacaoLat >= 0 ? "red" : "green";
}