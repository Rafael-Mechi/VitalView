//  // --- 1. Coleta de dados (simulação) ---
//     async function pegandoDadosGerais() {
      
        
//     }

//     // --- 2. Renderização de métricas ---
//     function renderMetrics(metrics) {
//       const container = document.getElementById("metrics");
//       container.innerHTML = `
//         <div class="metric">CPU: ${metrics.cpuUsage}%</div>
//         <div class="metric">Memória: ${metrics.memoryUsage}%</div>
//         <div class="metric">Ping médio: ${metrics.pingAvg}ms</div>
//       `;
//     }

//     // --- 3. Inicialização da dashboard ---
//     async function initDashboard() {
//       const metrics = await getMetrics();
//       renderMetrics(metrics);
//     }

//     // --- 4. Execução no momento certo ---
//     document.addEventListener("DOMContentLoaded", initDashboard);