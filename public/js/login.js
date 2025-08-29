function entrar() {
  
    aguardar();

    var emailVar = email_input.value;
    var senhaVar = senha_input.value;

    if (emailVar === "" || senhaVar === "") {
        finalizarAguardar("(Mensagem de erro para todos os campos em branco)");
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
        sessionStorage.ID_USUARIO = json.id;

        setTimeout(() => {
            finalizarAguardar(); 
            window.location.replace("painel.html"); 
        }, 2000); 
    })
    .catch(erro => {
        finalizarAguardar(erro.message);
    });

    return false; 
}
