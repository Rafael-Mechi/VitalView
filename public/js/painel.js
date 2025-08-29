window.onload = function () {
    if (!sessionStorage.ID_USUARIO) {
        window.location = "login.html";
    }
    
    history.pushState(null, null, location.href);
    history.pushState(null, null, location.href);

    window.onpopstate = function () {
        let confirma = confirm("Deseja realmente sair da sua conta?");
        if (confirma) {
            sessionStorage.clear();
            window.location = "login.html";
        } else {
            history.pushState(null, null, location.href);
        }
    };
};
