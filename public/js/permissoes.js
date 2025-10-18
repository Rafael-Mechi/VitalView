// Bloqueia a página inteira se o cargo não estiver permitido
function protegerPagina(rolesPermitidos = []) {
  const cargo = sessionStorage.CARGO_USUARIO;
  if (!cargo || (rolesPermitidos.length && !rolesPermitidos.includes(cargo))) {
    window.location.replace("index.html"); 
  }
}

// Esconde/mostra elementos marcados com data-role="Analista,Técnico,Administrador"
function aplicarCargoNaUI() {
  const cargo = sessionStorage.CARGO_USUARIO;
  if (!cargo) {
    window.location.replace("login.html");
    return;
  }
  document.querySelectorAll('[data-role]').forEach(el => {
    const roles = el.getAttribute('data-role').split(',').map(s => s.trim());
    el.style.display = roles.includes(cargo) ? '' : 'none';
  });
}

document.addEventListener('DOMContentLoaded', aplicarCargoNaUI);
