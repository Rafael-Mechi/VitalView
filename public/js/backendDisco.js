// ---------------- CONFIGURAÇÕES INICIAIS ----------------
const params = new URLSearchParams(window.location.search);
const idServidor = params.get("idServidor");
const idHospital = sessionStorage.FK_HOSPITAL;
const nomeHospital = sessionStorage.NOME_HOSPITAL;
const nomeServidor = params.get("hostname");
const key = `${idServidor}_${nomeServidor}_${nomeHospital}.json`;


console.log(idServidor);
console.log(idHospital);
console.log(nomeHospital);



//------------------Puxando as classes do HTML-------------------
//Grafico atividade
const valorAtividade = document.querySelector(".texto_esquerda h1");
const horaAtualizacao = document.querySelector(".texto_direita p:last-child");

//grafico uso de disco
const valorUso = document.querySelectorAll('.numero_uso_disco h1')[0];
const textoUso = document.querySelectorAll('.p_esquerda')[1];
const variacaoUso = document.querySelectorAll('.UD_texto_direita p')[0];

//Grafico taxa de transferencia
const valorTaxa = document.querySelectorAll('.numero_uso_disco h1')[1];
const variacaoTaxa = document.querySelectorAll('.UD_texto_direita p')[1];

//Grafico letencia
const valorLatencia = document.querySelectorAll('.numero_uso_disco h1')[2];
const variacaoLatencia = document.querySelectorAll('.UD_texto_direita p')[2];

//Icones de alerta
const statusUso = document.querySelector('.status-usoDisco');
const statusTaxa = document.querySelector('.status-taxa');
const statusLatencia = document.querySelector('.status-latencia');

//Variavies para pegar a ultima captura para fazer a comparação:
let ultimoUso = null;
let ultimaTaxaMedia = null;
let ultimaLatencia = null;



// ---------------- FUNÇÃO PRINCIPAL ----------------
async function carregarDados() {

  try {
    //Fazendo um fetch para puxar os dados e os limites
   const [bucketRes, limitesRes] = await Promise.all([
      fetch(`/dashDiscoRoutes/buscar-dados-bucket-disco/${key}`),
      fetch(`/dashDiscoRoutes/buscar-limites/${idServidor}`)
    ]);

    if (!bucketRes.ok) throw new Error("Falha ao buscar dados de disco")
    if (!limitesRes.ok) throw new Error("Falha ao puxar os limites de componentes")
    

    //Convertendo para json só pra garantir
    const dados = await bucketRes.json()
    const limites = await limitesRes.json()

    console.log("Dados recebidos:", dados)
    console.log("Limites recebidos:", limites)
    
    atualizarDash(dados, limites);
  } catch (erro) {
    console.error("Erro ao buscar dados do bucket:", erro);
  }
}

carregarDados();
setInterval(carregarDados, 3000); // Atualiza a cada 3s

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
    labels: ['Disco_usado_(bytes)'],
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
function atualizarDash(dados, limites) {
  const usoDisco = Number(dados[0]["Disco_usado_(bytes)"]) || 0;
  const discoTotal =  Number(dados[0]["Disco_total_(bytes)"])
  const taxaLeitura = Number(dados[0]["Disco_taxa_leitura_mbs"])
  const taxaEscrita = Number(dados[0]["Disco_taxa_escrita_mbs"])
  const latMediaLeitura = Number(dados[0]["Disco_latencia_leitura"]) 
  const latMediaEscrita = Number(dados[0]["Disco_latencia_escrita"])
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
  textoUso.textContent = `${(usoDisco).toFixed(1)} GB usados de ${discoTotal.toFixed()} GB`;

  // Taxa de transferência média
  const taxaMedia = ((taxaLeitura + taxaEscrita) / 2).toFixed(2);
  graficoTaxa.data.datasets[0].data.shift();
  graficoTaxa.data.datasets[0].data.push(taxaMedia);
  graficoTaxa.update();
  valorTaxa.textContent = `${taxaMedia} MB/s`;


  // Latência
  const latMedia = (latMediaLeitura + latMediaEscrita) / 2;
  graficoLatencia.data.datasets[0].data = [latMedia];
  graficoLatencia.update();
  valorLatencia.textContent = `${latMedia.toFixed(2)} ms`;

//Chamando função para calcular a variação das KPIS
ultimoUso = calcularVariacao(usoDisco, ultimoUso, variacaoUso, "%")
ultimaTaxaMedia = calcularVariacao(taxaMedia, ultimaTaxaMedia, variacaoTaxa, "MB/s")
ultimaLatencia = calcularVariacao(latMedia, ultimaLatencia, variacaoLatencia, "ms")


// Atualiza para as proximas
ultimoUso = usoDisco;
ultimaTaxaMedia = taxaMedia;
ultimaLatencia = latMedia;

}


function irParaTelaDeGestao(){

  window.location.href = `dashboardGerImagemServidor.html?idServidor=${idServidor}&hostname=${nomeServidor}&idhospital=${nomeHospital}`;

}

function escolherServidor() {
    const select = document.getElementById("listaServidores");

    fetch(`/dashDiscoRoutes/buscar-servidores`)
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

//Função para atualizar o "normal dos graficos e KPIS"
function atualizarStatus(valorAtual, limite, elemento) {
    if (!limite || limite <= 0) return;

    if (valorAtual > limite) {
        elemento.classList.remove("ok");
        elemento.classList.add("alerta");
        elemento.textContent = "Alerta";
    } else {
        elemento.classList.remove("alerta");
        elemento.classList.add("ok");
        elemento.textContent = "Normal";
    }
}

//Função para calcular a varicao das KPIS comparando o valor anterior
function calcularVariacao(valorAtual, valorAnterior, elemento, unidade) {
    if (valorAnterior === null) {
        elemento.textContent = "—";
        elemento.style.color = "gray";
        return valorAtual; // volta o novo "último"
    }

    const diferenca = valorAtual - valorAnterior;

    if (diferenca > 0) {
        elemento.textContent = `▲ +${diferenca.toFixed(2)} ${unidade}`;
        elemento.style.color = "red";
    } else if (diferenca < 0) {
        elemento.textContent = `▼ ${Math.abs(diferenca).toFixed(2)} ${unidade}`;
        elemento.style.color = "green";
    } else {
        elemento.textContent = `0 ${unidade}`;
        elemento.style.color = "gray";
    }

    return valorAtual;
}
