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

    var nomeVar = nome_input.value;
    var emailVar = email_input.value;
    var senhaVar = senha_input.value;
    var cpfVar = cpf_input.value;
    var telefoneVar = telefone_input.value;
    var confirmacaoSenhaVar = confirmacao_senha_input.value;
    var cargoVar = cargo_input.value;
    var hospitalVar = hospital_input.value;
    var codigoVar = codigo_input.value;
    var resposta = ""

    const regraEmail = ['@', '.', '#', '$', '%', '&', '*', '(', ')']
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
      hospitalVar == "") {

      cardErro.style.display = "block";
      mensagem_erro.innerHTML = "(Preencha todos os campos em branco)";
      return false;

    } else if (qtdTentativas <= 0) {
      resposta = "Tentativas esgotadas! Recarregue a pagina!"
    }
    else {

      for (var i = 0; i < 1; i++) {
        if (nomeVar.length > 20) {
          qtdTentativas--
          resposta = 'Nome de usuário grande demais.<br><br>O nome deve conter no máximo 20 caracteres.'
        } else if (!emailVar.includes('@') && !emailVar.includes('.')) {
          qtdTentativas--
          resposta = 'emailVar Inválido. Deve conter @ e .'
        } else if (senhaVar.length < 8 || senhaVar.length > 128 || !CaracterEspeciais.some(char => senhaVar.includes(char))) {
          qtdTentativas--
          resposta = 'Senha inválida.<br><br>Deve estar entre 8 e 128 caracteres e conter ao menos um caractere especial.'
        } else if (confirmacaoSenhaVar != senhaVar) {
          qtdTentativas--
          resposta = 'A confirmação de senha está diferente'
        } else {
          resposta = "parabens! Cadastro realizado com sucesso"
          qtdTentativas = 0

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
                cardErro.style.display = "block";

                mensagem_erro.innerHTML =
                  "Cadastro realizado com sucesso! Redirecionando para tela de Login...";

                setTimeout(() => {
                  window.location = "login.html";
                }, "2000");

                limparFormulario();
              } else {
                throw "Houve um erro ao tentar realizar o cadastro!";
              }
            })
            .catch(function (resposta) {
              console.log(`#ERRO: ${resposta}`);

            });

          return false;
        }
      }
    }
    document.getElementById('div_resposta').innerHTML = resposta
  }