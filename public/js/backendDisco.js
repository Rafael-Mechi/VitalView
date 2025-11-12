 // ---------------- GRAFICO PRINCIPAL DE ATIVIDADE ----------------
  const ctx = document.getElementById("graficoAtividade").getContext("2d");
  const valorAtividade = document.querySelector(".texto_esquerda h1");
  const horaAtualizacao = document.querySelector(".texto_direita p:last-child");

  const dadosMock = {
    labels: ["-5s", "-4s", "-3s", "-2s", "-1s", "now()"],
    datasets: [
      {
        label: "Atividade (%)",
        data: [10, 50, 70, 50, 33, 50],
        borderColor: "#00c49f",
        backgroundColor: "rgba(0,196,159,0.2)",
        fill: true,
        tension: 0.3,
        pointRadius: 0,
      },
    ],
  };

  const opcoes = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: { color: "rgba(255,255,255,0.05)" },
        ticks: { color: "#aaa" },
      },
      x: {
        grid: { display: false },
        ticks: { color: "#aaa" },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#222",
        titleColor: "#fff",
        bodyColor: "#fff",
      },
    },
    animation: { duration: 600, easing: "easeOutQuart" },
  };

  const graficoAtividade = new Chart(ctx, {
    type: "line",
    data: dadosMock,
    options: opcoes,
  });

  setInterval(() => {
    const novoValor = Math.floor(Math.random() * 100);
    const dataset = graficoAtividade.data.datasets[0];
    dataset.data.shift();
    dataset.data.push(novoValor);
    graficoAtividade.update();

    valorAtividade.textContent = `${novoValor}%`;

    const agora = new Date();
    horaAtualizacao.textContent = agora.toLocaleTimeString("pt-BR", { hour12: false });
  }, 1500);


  // ---------------- GRAFICO DE USO DE DISCO ----------------
  const ctx1 = document.getElementById('graficoUsoDeDisco').getContext('2d');
  const valorUso = document.querySelectorAll('.numero_uso_disco h1')[0];
  const textoUso = document.querySelectorAll('.p_esquerda')[1];
  const variacaoUso = document.querySelectorAll('.UD_texto_direita p')[0];

  const graficoUso = new Chart(ctx1, {
    type: 'bar',
    data: {
      labels: ['Uso de Disco'],
      datasets: [{
        label: 'Usado',
        data: [94.4],
        backgroundColor: '#008c99',
        borderRadius: 10,
        barThickness: 20
      }]
    },
    options: {
      indexAxis: 'y',
      scales: {
        x: {
          min: 0,
          max: 100,
          ticks: { callback: value => value + '%' }
        },
        y: { display: false }
      },
      plugins: { legend: { display: false }, tooltip: { enabled: false } }
    }
  });

  setInterval(() => {
    const novoValor = (Math.random() * 100).toFixed(1);
    graficoUso.data.datasets[0].data = [novoValor];
    graficoUso.update();

    valorUso.textContent = `${novoValor}%`;
    textoUso.textContent = `${(novoValor * 5).toFixed(1)} GB usados de 500 GB`;

    const variacao = (Math.random() * 1 - 0.5).toFixed(1);
    variacaoUso.textContent = `${variacao >= 0 ? "▲" : "▼"} ${variacao}%`;
    variacaoUso.style.color = variacao >= 0 ? "red" : "green";
  }, 2000);


  // ---------------- TAXA DE TRANSFERÊNCIA ----------------
  const ctx2 = document.getElementById('graficoTaxaTransferencia').getContext('2d');
  const valorTaxa = document.querySelectorAll('.numero_uso_disco h1')[1];
  const variacaoTaxa = document.querySelectorAll('.UD_texto_direita p')[1];

  const dadosMock2 = Array.from({ length: 30 }, () => Math.random() * 100);
  const graficoTaxa = new Chart(ctx2, {
    type: 'bar',
    data: {
      labels: dadosMock2.map((_, i) => i + 1),
      datasets: [{
        label: 'Taxa',
        data: dadosMock2,
        backgroundColor: '#008c99',
        borderRadius: 4,
        borderSkipped: false,
        barThickness: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { display: false },
        y: { display: false, min: 0, max: 100 }
      },
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
      animation: { duration: 500 }
    }
  });

  setInterval(() => {
    const novoValor = (Math.random() * 200).toFixed(1);
    graficoTaxa.data.datasets[0].data.shift();
    graficoTaxa.data.datasets[0].data.push(novoValor);
    graficoTaxa.update();

    const variacao = (Math.random() * 2 - 1).toFixed(1);
    valorTaxa.textContent = `${novoValor} MB/s`;
    variacaoTaxa.textContent = `${variacao >= 0 ? "▲" : "▼"} ${variacao} MB/s`;
    variacaoTaxa.style.color = variacao >= 0 ? "green" : "red";
  }, 1200);


  // ---------------- LATÊNCIA MÉDIA ----------------
  const ctxLatencia = document.getElementById('graficoLatencia').getContext('2d');
  const valorLatencia = document.querySelectorAll('.numero_uso_disco h1')[2];
  const variacaoLatencia = document.querySelectorAll('.UD_texto_direita p')[2];

  const graficoLatencia = new Chart(ctxLatencia, {
    type: 'bar',
    data: {
      labels: ['Latência média'],
      datasets: [{
        data: [22.7],
        backgroundColor: 'rgba(0, 255, 180, 0.8)',
        borderRadius: 8,
        barThickness: 10
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { min: 0, max: 100, display: false, grid: { display: false } },
        y: { display: false, grid: { display: false } }
      },
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
      animation: { duration: 500 }
    }
  });

  setInterval(() => {
    const novoValor = (Math.random() * 60).toFixed(1);
    graficoLatencia.data.datasets[0].data = [novoValor];
    graficoLatencia.update();

    valorLatencia.textContent = `${novoValor} ms`;

    const variacao = (Math.random() * 2 - 1).toFixed(1);
    variacaoLatencia.textContent = `${variacao >= 0 ? "▲" : "▼"} ${variacao} ms`;
    variacaoLatencia.style.color = variacao >= 0 ? "red" : "green";
  }, 1500);