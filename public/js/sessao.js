function limparSessao() {
    sessionStorage.clear();
    window.location = "login.html";
}


function aguardar() {
    var sectionAguardar = document.getElementById("section_aguardar");
    sectionAguardar.style.display = "flex";
}

function finalizarAguardar(texto) {
    var sectionAguardar = document.getElementById("section_aguardar");
    sectionAguardar.style.display = "none";

    var sectionErrosLogin = document.getElementById("section_erros_login");
    if (texto) {
        sectionErrosLogin.style.display = "flex";
        sectionErrosLogin.innerHTML = texto;

        setTimeout(() => {
            sectionErrosLogin.style.display = 'none';
        }, 4000);
    }
}


function aguardar() {
    var sectionAguardar = document.getElementById("section_aguardar");
    sectionAguardar.style.display = "flex";
}