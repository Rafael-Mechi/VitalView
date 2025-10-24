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
            sessionStorage.NOME_USUARIO = json.nome;
            sessionStorage.FK_HOSPITAL = json.fkHospital;
            sessionStorage.CARGO_USUARIO = json.cargo;

            const cargoNormalizado = String(json.cargo || "")
                .normalize("NFD").replace(/[\u0300-\u036f]/g, "") 
                .trim().toLowerCase();

            const rota = rotaPorCargo(cargoNormalizado);

            finalizarAguardar();
            
            window.location.replace(rota);
        })
        .catch((erro) => {
            finalizarAguardar(erro.message || "Falha ao autenticar.");
        });

    return false;
}

function rotaPorCargo(cargoNormalizado) {
    // Mapa usando chaves
    const MAP = {
        analista: "dashboardAnalista.html",
        tecnico: "dashboardSuporteMacro.html",
        administrador: "bemVindo.html",
    };
    return MAP[cargoNormalizado] || "dashboardAnalista.html";
}