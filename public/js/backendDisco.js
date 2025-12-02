// ---------------- CONFIGURAÇÕES INICIAIS ----------------
const params = new URLSearchParams(window.location.search);
const idServidor = params.get("idServidor");
const idHospital = sessionStorage.FK_HOSPITAL;
const nomeHospital = sessionStorage.NOME_HOSPITAL;
const nomeServidor = params.get("hostname");
const key = `${idServidor}_${nomeServidor}_${nomeHospital}_disco.json`;


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
const variacaoUso = document.querySelectorAll('.indicadorVariacao')[0];

//Grafico taxa de transferencia
const valorTaxa = document.querySelectorAll('.numero_uso_disco h1')[1];
const variacaoTaxa = document.querySelectorAll('.indicadorVariacao')[1];

//Grafico letencia
const valorLatencia = document.querySelectorAll('.numero_uso_disco h1')[2];
const variacaoLatencia = document.querySelectorAll('.indicadorVariacao')[2];

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

    //Ordena por Data de coleta
    dados.sort((a, b) => new Date(a.Data_da_Coleta) - new Date(b.Data_da_Coleta));


    const registroAtual = dados[dados.length-1] //pega sempre o ultimo registro
    const registroAnterior = dados.length > 1 ? dados[dados.length - 2] : null;
    
    atualizarDash(registroAtual, registroAnterior, limites);


    //Chamando a funcao para calcular sobrecarga
    const previsao = preverSobrecarga(dados);
    if (!previsao.erro) {
    // Atualiza o título da previsão no dashboard
    document.querySelector(".kpi_grafico_previsao .texto_esquerdaPrevisao h1").textContent = previsao.dataPrevista;


     // monta o eixo x do gradico (horas)
    const labels = gerarLabels(previsao.historico, previsao.previsao);

    // Preehnche o grafico
    grafico.data.labels = labels;
    grafico.data.datasets[0].data = previsao.historico.concat(Array(previsao.previsao.length).fill(null));
    grafico.data.datasets[1].data = Array(previsao.historico.length).fill(null).concat(previsao.previsao);
    grafico.update();

    }
  } catch (erro) {
    console.error("Erro ao buscar dados do bucket:", erro);
  }
}


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
    labels: ['Disco_usado_(GB)'],
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


// ---------------- GRAFICO PREVISÃO DE SOBRECARGA ----------------
const ctxPrevisao = document.getElementById('graficoPrevisao').getContext('2d');

 function gerarLabels(historico, previsao) {
  const agora = new Date();
  const total = historico.length + previsao.length;
  const labels = [];

  for (let i = 0; i < total; i++) {
    const tempo = new Date(agora.getTime() + i * 3000); // 3s por coleta
    const hora = tempo.toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    labels.push(hora);
  }

  return labels;
}

const labels = []

  const grafico = new Chart(ctxPrevisao, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Uso de Disco (Histórico)',
          data: [],
          borderWidth: 2,
          borderColor: '#008c99',
          backgroundColor: 'transparent',
          tension: 0.3
        },
        {
          label: 'Projeção',
          data: [],
          borderWidth: 2,
          borderColor: 'rgba(255, 0, 0, 1)',
          borderDash: [8, 8],
          backgroundColor: 'transparent',
          tension: 0.3
        }
      ]
    },

    options: {
      responsive: true,
      maintainAspectRatio: false,

      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          enabled: true
        }
      },

      scales: {
        x: {
          title: {
            display: true,
            text: "Hora"
          },
          grid: {
            color: "#ddd"
          }
        },
        y: {
          title: {
            display: true,
            text: "Uso de Disco (GB)"
          },
          beginAtZero: true,
          grid: {
            color: "#ddd"
          }
        }
      }
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
    scales: {
      x: {
        display: false
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'MB/s',
          font: { size: 12 }
        },
        ticks: {
          stepSize: 0.5
        },
        min: 0
      }
    },
    plugins: {
      title: {
        display: true,
        font: { size: 16 }
      },
      tooltip: {
        callbacks: {
          label: ctx => `Taxa: ${ctx.parsed.y.toFixed(2)} MB/s`
        }
      },
      legend: {
        display: false
      }
    }
  }
});


// ---------------- GRAFICO LATÊNCIA ----------------
const ctxLatencia = document.getElementById('graficoLatencia').getContext('2d');

const gradient = ctxLatencia.createLinearGradient(0, 0, 300, 0);
gradient.addColorStop(0, 'rgba(0, 255, 180, 0.4)');
gradient.addColorStop(1, 'rgba(0, 255, 180, 0.9)');

const graficoLatencia = new Chart(ctxLatencia, {
  type: 'bar',
  data: {
    labels: [" "],
    datasets: [{
      label: 'ms',
      data: [0],
      backgroundColor: gradient,
      borderRadius: 12,
      borderSkipped: false,
      barThickness: 22
    }]
  },
  options: {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,

    scales: {
      x: {
        grid: {
          color: 'rgba(255,255,255,0.08)',
          drawBorder: false
        },
        ticks: {
          color: '#ccc',
          font: { size: 12 }
        }
      },
      y: {
        ticks: {
          color: '#eee',
          font: { size: 14 }
        },
        grid: { display: false }
      }
    },

    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(20,20,20,0.9)',
        padding: 10,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
        callbacks: {
          label: ctx => `Latência: ${ctx.raw} ms`
        }
      }
    },

    animation: {
      duration: 700,
      easing: 'easeOutQuart'
    }
  }
});



// ---------------- FUNÇÃO DE ATUALIZAÇÃO ----------------
function atualizarDash(dados, dadosAnterior, limites) {
  const usoDisco = Number(dados["Disco_usado_(bytes)"]);
  const discoTotal =  Number(dados["Disco_total_(bytes)"])
  const porcentagemDisco = (usoDisco / discoTotal) * 100 // para calcular a porcentagem 
  const taxaLeitura = Number(dados["Disco_taxa_leitura_mbs"])
  const taxaEscrita = Number(dados["Disco_taxa_escrita_mbs"])
  const latMediaLeitura = Number(dados["Disco_latencia_leitura"]) 
  const latMediaEscrita = Number(dados["Disco_latencia_escrita"])
  const dataColeta = (dados["Data da Coleta"] || new Date());
  const taxaTotal = taxaLeitura + taxaEscrita;
  


  // Valores anteriores para calcular a variação
  const usoDiscoAnterior = dadosAnterior ? Number(dadosAnterior["Disco_usado_(bytes)"]) : null;
  const taxaLeituraAnterior = dadosAnterior ? Number(dadosAnterior["Disco_taxa_leitura_mbs"]) : null;
  const taxaEscritaAnterior = dadosAnterior ? Number(dadosAnterior["Disco_taxa_escrita_mbs"]) : null;
  const latMediaLeituraAnterior = dadosAnterior ? Number(dadosAnterior["Disco_latencia_leitura"]) : null;
  const latMediaEscritaAnterior = dadosAnterior ? Number(dadosAnterior["Disco_latencia_escrita"]) : null;
  const porcentagemDiscoAnterior = dadosAnterior ? (Number(dadosAnterior["Disco_usado_(bytes)"]) / Number(dadosAnterior["Disco_total_(bytes)"])) * 100 : null;

  
  // Uso de disco
  graficoUso.data.datasets[0].data = [porcentagemDisco];
  graficoUso.update();
  valorUso.textContent = `${porcentagemDisco.toFixed(1)}%`;
  textoUso.textContent = `${(usoDisco).toFixed(1)} GB usados de ${discoTotal.toFixed()} GB`;

  // Taxa de transferência média
  const taxaMedia = ((taxaLeitura + taxaEscrita) / 2).toFixed(2);
  graficoTaxa.data.datasets[0].data.shift(); // tira o primeiro registro e quando adiciona o novo
  graficoTaxa.data.datasets[0].data.push(taxaMedia);
  graficoTaxa.update();
  valorTaxa.textContent = `${taxaMedia} MB/s`;

  // Latência
  const latMedia = (latMediaLeitura + latMediaEscrita) / 2;
  graficoLatencia.data.datasets[0].data = [latMedia];
  graficoLatencia.update();
  valorLatencia.textContent = `${latMedia.toFixed(2)} ms`;

  // Gráfico principal
  const atividade = Math.min((taxaTotal * latMedia) / 100, 100);
  const dataset = graficoAtividade.data.datasets[0];
  dataset.data.shift();
  dataset.data.push(atividade);
  graficoAtividade.update();

  valorAtividade.textContent = `${atividade.toFixed(4)}%`;
  horaAtualizacao.textContent = `Atualizado às ${new Date(dataColeta).toLocaleTimeString("pt-BR", { hour12: false })}`;

//Chamando função para calcular a variação das KPIS
calcularVariacao(usoDisco, usoDiscoAnterior, variacaoUso, "%");
calcularVariacao(Number(taxaMedia), (taxaLeituraAnterior + taxaEscritaAnterior) / 2, variacaoTaxa, "MB/s");
calcularVariacao(latMedia, (latMediaLeituraAnterior + latMediaEscritaAnterior) / 2, variacaoLatencia, "ms");

}


function irParaTelaDeGestao(){

  window.location.href = `dashboardGerImagemServidor.html?idServidor=${idServidor}&hostname=${nomeServidor}&idhospital=${nomeHospital}`;

}

function escolherServidor() {
    const select = document.getElementById("listaServidores");
    const idServidorAtual = idServidor

    fetch(`/dashDiscoRoutes/buscar-servidores`)
        .then(response => response.json())
        .then(data => {
          console.log(data)
            data.forEach(servidor => {
                const option = document.createElement("option");
                option.value = servidor.idServidor;
                option.textContent = servidor.hostname;
                if(servidor.idServidor == idServidorAtual){
                  option.selected = true;
                }
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
        window.location.href = `dashDisco.html?idServidor=${idServidorSelecionado}&hostname=${hostname}&idhospital=${idHospital}`;
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
  if (!elemento) return valorAtual;
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
}

function preverSobrecarga(dados) {
  const usados = []

  //for que percorre todos os registros e salva o disco cheio no vetor
  for (let i = 0; i < dados.length; i++) {
    const valor = Number(dados[i]["Disco_usado_(bytes)"]);
    if (!isNaN(valor)) usados.push(valor);
  }

  const total = Number(dados[dados.length - 1]["Disco_total_(bytes)"]);
  const limite = 0.9 * total;

  const primeiro = usados[0];
  const ultimo = usados[usados.length - 1];
  const taxa = (ultimo - primeiro) / (usados.length - 1);

  const coletasRestantes = Math.ceil((limite - ultimo) / taxa);

  // gera pontos de projeção para o grafico
  const previsao = [];
  let valor = ultimo;
  for (let i = 0; i < coletasRestantes; i++) {
    valor += taxa;
    previsao.push(valor);
  }

  const agora = new Date();
  const futuro = new Date(agora.getTime() + coletasRestantes * 3000);

  return {
    historico: usados,
    previsao,
    atualGB: ultimo.toFixed(2),
    limiteGB: limite.toFixed(2),
    taxaGB: taxa.toFixed(2),
    coletasRestantes,
    dataPrevista: futuro.toLocaleString("pt-BR", { hour12: false })
  };
}


// Chame a função junto com carregarDados
window.onload = escolherServidor;
carregarDados();
setInterval(carregarDados, 3000); // Atualiza a cada 3s

