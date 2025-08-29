function mostrar(){
    console.log(cargo_input.value);
    
  }
  const selectCargo = document.getElementById("cargo_input");
  const selectHospital = document.getElementById("hospital_input");

  fetch("/usuarios/procurarCargos", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    }
  })
    .then(function (resposta) {
      console.log("resposta: ", resposta);

      if (resposta.ok) {
        return resposta.json();
      } else {
        throw "Erro na requisição";
      }
    })
    .then(function (dados) {
      console.log("dados: ", dados);

      cardErro.style.display = "block";
      mensagem_erro.innerHTML = "";

      dados.forEach(cargo => {
        let novaOpcao = new Option(cargo.nome, cargo.idcargo);
        selectCargo.add(novaOpcao);
      });
    })
    .catch(function (erro) {
      console.log(`#ERRO: ${erro}`);
    });

  fetch("/usuarios/procurarHospitais", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    }
  })
    .then(function (resposta) {
      console.log("resposta: ", resposta);

      if (resposta.ok) {
        return resposta.json();
      } else {
        throw "Erro na requisição";
      }
    })
    .then(function (dados) {
      console.log("dados: ", dados);

      cardErro.style.display = "block";
      mensagem_erro.innerHTML = "";

      dados.forEach(hospital => {
        let novaOpcao = new Option(hospital.nome, hospital.idhospital);
        selectHospital.add(novaOpcao);
      });
    })
    .catch(function (erro) {
      console.log(`#ERRO: ${erro}`);
    });


  var qtdTentativas = 30;
  function cadastrar() {
    aguardar();

    var nomeVar = nome_input.value;
    var emailVar = email_input.value;
    var senhaVar = senha_input.value;
    var cpfVar = cpf_input.value;
    var telefoneVar = telefone_input.value;
    var confirmacaoSenhaVar = confirmacao_senha_input.value;
    var cargoVar = cargo_input.value;
    var hospitalVar = hospital_input.value;
    var codigoVar = codigo_input.value;

    const CaracterEspeciais = ['!', '@', '#', '$', '%', '&', '*', '(', ')']

    if (
      nomeVar == "" ||
      emailVar == "" ||
      senhaVar == "" ||
      cpfVar == "" ||
      telefoneVar == "" ||
      confirmacaoSenhaVar == "" ||
      cargoVar == "" ||
      codigoVar == "" ||
      hospitalVar == ""

    ) {finalizarAguardar("Os campos não podem ser vazios.");
      return false;
  }
  if (nomeVar.length <= 1) {
    finalizarAguardar("O nome deve conter mais de 1 caractere.");
    return false;
  }

  if(senhaVar.length < 8 || senhaVar.length > 128 || !CaracterEspeciais.some(char => senhaVar.includes(char))){
    finalizarAguardar("Sua senha deve ter mais de 8 caracteres e possuir caracteres Especiais!")
    return false
  }

  if (cnpjVar.length != 14) {
    finalizarAguardar("O CNPJ é inválido.");
    return false;
  } 

  if (!emailVar.includes('@') || !emailVar.includes('.')) {
    finalizarAguardar("O e-mail é inválido.");
    return false;
  }
    else {
          fetch("/usuarios/cadastrar", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({

              nome: nomeVar,
              email: emailVar,
              cpf: cpfVar,
              telefone: telefoneVar,
              senha: senhaVar,
              cargo: cargoVar,
              hospital: hospitalVar,
              codigo: codigoVar

            }),
          })
            .then(function (resposta) {
      console.log("resposta: ", resposta);

      if (resposta.ok) {
        var sectionErrosLogin = document.getElementById("section_erros_login");
        sectionErrosLogin.style.backgroundColor = '#069006';
      
        finalizarAguardar("Cadastro realizado com sucesso! Redirecionando para tela de login...");

        setTimeout(() => {
          window.location = "login.html";
        }, "2000");
      } else {
        throw "Houve um erro ao tentar realizar o cadastro!";
      }
    })
    .catch(function (resposta) {
      console.log(`#ERRO: ${resposta}`);
      finalizarAguardar(resposta);
    });
}

    function sumirMensagem() {
      cardErro.style.display = "none";
    }
}