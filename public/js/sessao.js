function limparSessao() {
    sessionStorage.clear();
    window.location = "login.html";
}

function validarSessao() {
    if (!sessionStorage.ID_USUARIO) {
        window.location = "login.html";
    }
    history.pushState(null, null, location.href);
    history.pushState(null, null, location.href);

    window.onpopstate = function () {
        history.pushState(null, null, location.href);
    };
}


function aguardar() {
    var sectionAguardar = document.getElementById("section_aguardar");
    sectionAguardar.style.display = "flex";
}

function finalizarAguardar(mensagem) {
    const cardErro = document.getElementById("cardErro");

    if(mensagem){
        cardErro.style.display = "block";
        cardErro.innerText = mensagem;

        setTimeout(() => {
            cardErro.style.display = "none";
        }, 4000); 
    } else {
        cardErro.style.display = "none";
    }

    const sectionAguardar = document.getElementById("section_aguardar");
    sectionAguardar.style.display = "none";
}
