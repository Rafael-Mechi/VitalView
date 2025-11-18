// var ambiente_processo = 'producao';
var ambiente_processo = 'desenvolvimento';

var caminho_env = ambiente_processo === 'producao' ? '.env' : '.env.dev';
// Acima, temos o uso do operador ternário para definir o caminho do arquivo .env
// A sintaxe do operador ternário é: condição ? valor_se_verdadeiro : valor_se_falso

require("dotenv").config({ path: caminho_env });
console.log("Usuário do banco:", process.env.AMBIENTE_PROCESSO);

var express = require("express");
var cors = require("cors");
var path = require("path");
require('dotenv').config();
var PORTA_APP = process.env.APP_PORT;
var HOST_APP = process.env.APP_HOST;

var app = express();

var indexRouter = require("./src/routes/index");
var usuarioRouter = require("./src/routes/usuarios");
var servidorRouter = require("./src/routes/servidores");
var controleUsuariosRouter = require("./src/routes/controleUsuarios");
var suporteMicroRoutes = require("./src/routes/suporteMicroRoutes")
var historicoAlertaRouter = require("./src/routes/historicoAlertas")
var dashboardMacroRouter = require("./src/routes/dashboardMacroRoutes");
var dashboardAnalistaRouter = require("./src/routes/dashboardAnalistaRoutes");
var dashboardDiscoRouter = require("./src/routes/dashDiscoRoutes")
var dashboardGerImagem = require("./src/routes/gerImagemRoutes")
var reqJira = require("./src/routes/jiraRoutes")

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use(cors());

app.use("/", indexRouter);
app.use("/usuarios", usuarioRouter);
app.use("/servidores", servidorRouter);
app.use("/controle-usuarios", controleUsuariosRouter)
app.use("/suporteMicroRoutes",suporteMicroRoutes)
app.use("/historico-alertas", historicoAlertaRouter)
app.use("/servidores", dashboardMacroRouter);
app.use("/analista", dashboardAnalistaRouter);
app.use("/dashDiscoRoutes", dashboardDiscoRouter)
app.use("/ger-imagem", dashboardGerImagem)
app.use("/jira", reqJira)

app.listen(PORTA_APP, function () {
    console.log(`
    ##   ##  ######   #####             ####       ##     ######     ##              ##  ##    ####    ######  
    ##   ##  ##       ##  ##            ## ##     ####      ##      ####             ##  ##     ##         ##  
    ##   ##  ##       ##  ##            ##  ##   ##  ##     ##     ##  ##            ##  ##     ##        ##   
    ## # ##  ####     #####    ######   ##  ##   ######     ##     ######   ######   ##  ##     ##       ##    
    #######  ##       ##  ##            ##  ##   ##  ##     ##     ##  ##            ##  ##     ##      ##     
    ### ###  ##       ##  ##            ## ##    ##  ##     ##     ##  ##             ####      ##     ##      
    ##   ##  ######   #####             ####     ##  ##     ##     ##  ##              ##      ####    ######  
    \n\n\n                                                                                                 
    Servidor do seu site já está rodando! Acesse o caminho a seguir para visualizar .: http://${HOST_APP}:${PORTA_APP} :. \n\n
    Você está rodando sua aplicação em ambiente de .:${ambiente_processo}:. \n\n
    \tSe .:desenvolvimento:. você está se conectando ao banco local. \n
    \tSe .:producao:. você está se conectando ao banco remoto. \n\n
    \t\tPara alterar o ambiente, comente ou descomente as linhas 1 ou 2 no arquivo 'app.js'\n\n`);
});
