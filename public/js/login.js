function entrar() {
  
    aguardar();

    var emailVar = email_input.value;
    var senhaVar = senha_input.value;

    if (emailVar === "" || senhaVar === "") {
        finalizarAguardar("Preencha todos os campos!");
        return false;
    }

    fetch("/usuarios/autenticar", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            emailServer: emailVar,
            senhaServer: senhaVar
        })
    })
    .then(resposta => {
        if (resposta.ok) {
            return resposta.json(); 
        } else {
            return resposta.text().then(texto => { throw new Error(texto); });
        }
    })
    .then(json => {
        sessionStorage.EMAIL_USUARIO = json.email;
        sessionStorage.NOME_USUARIO = json.nome
        sessionStorage.FK_HOSPITAL = json.fkHospital;
        sessionStorage.CARGO_USUARIO = json.cargo;

        const rota = rotaPorCargo(json.cargo);

        setTimeout(() => {
            finalizarAguardar(); 
            window.location.replace("dashboardAnalista.html"); 
        }, 2000); 
    })
    .catch(erro => {
        finalizarAguardar(erro.message);
    });

    return false; 
}

function rotaPorCargo(cargo) {
  
  const MAP = {
    'Analista': 'dashboardAnalista.html',
    'Técnico':  'dashboardSuporteMacro.html',   
  };
  
  return MAP[cargo] || 'dashboardAnalista.html';
}
