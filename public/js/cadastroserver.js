function salvar(){
    let hostnameVar = ipt_hostname.value;
    let ipVar = ipt_ip.value;
    let ramVar = ipt_ram.value;
    let discoVar = ipt_disco.value;

    let porcentagem_cpuVar = ipt_porcentagem_cpu.value;
    let porcentagem_ramVar = ipt_porcentagem_ram.value;
    let porcentagem_discoVar = ipt_porcentagem_disco.value;

    let fkHospitalVar = sessionStorage.FK_HOSPITAL;

    fetch("/servidores/cadastrar-servidor", {
        method: "POST",
        headers:{
            "Content-Type": "application/json",
        },
        body: JSON.stringify({

        hostnameServer: hostnameVar,
        ipServer: ipVar,
        fkHospitalServer: fkHospitalVar
      }),
    })
        .then((resposta) => {
            if(resposta.ok){
                alert("Servidor cadastrado com sucesso!")
            }else {
                    alert("Erro ao cadastrar. Verifique os dados e tente novamente.");
                }
        })
        .catch((erro) => {
                console.error("Erro na requisição: ", erro);
                alert("Erro na conexão com o servidor.");
            });
}