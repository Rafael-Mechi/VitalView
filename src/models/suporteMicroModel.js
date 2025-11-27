var database = require("../database/config");
var AWS = require('../aws/awsConfig.js');
const s3 = new AWS.S3();
const axios = require("axios");

dominio = process.env.JIRA_DOMAIN
email = process.env.JIRA_EMAIL
token = process.env.JIRA_API_TOKEN


function buscarDadosServidores(idServidor) {

    const instrucao = `
            select * from servidores where idServidor = ${idServidor};
        `;
    return database.executar(instrucao);
}

function buscarLimitesServidor(idServidor) {

    const instrucao = `
           SELECT 
                s.idServidor,
                s.hostname,
                tc.nome AS tipoComponente,
                c.limite AS limitePercentual
                FROM componentes c
                JOIN tipoComponente tc ON c.fkTipo = tc.idTipo
                JOIN servidores s ON c.fkServidor = s.idServidor
                WHERE c.fkServidor = ${idServidor}
                AND tc.nome IN ('Cpu', 'Memória', 'Disco');

        `;
    return database.executar(instrucao);
}

function buscarListaServidores() {
    const instrucao = `
            select * from servidores;
        `;
    return database.executar(instrucao);
}

const pegarDadosBucketModel = async (bucketName, fileKey) => {

    s3.listObjectsV2({ Bucket: process.env.AWS_BUCKET_NAME }, (err, data) => {
        if (err) console.error('Erro ao listar:', err);
        else console.log('Arquivos no bucket:', data.Contents.map(obj => obj.Key));
    });

    const params = {
        Bucket: bucketName,
        Key: fileKey
    };

    try {
        const data = await s3.getObject(params).promise();
        return data.Body.toString('utf-8');
    } catch (error) {
        console.error('Erro ao acessar o S3:', error);
        throw error;
    }
};

//IGOR: Adicionei aqui ao inves de criar outro model praticamente igual (eu teria que usar os outros metodos acima de qualquer jeito)
const pegarDadosDiscoModel = async (bucketName, fileKey) => {
    const params = {
        Bucket: bucketName,
        Key: fileKey // caminho para a pasta do json de disco (lembrar de criar no bucket)
    };

    try {
        
        const data = await s3.getObject(params).promise();
        const jsonData = JSON.parse(data.Body.toString('utf-8'));
        const list = await s3.listObjectsV2({ Bucket: bucketName }).promise();
        console.log("ARQUIVOS NO BUCKET:");
        list.Contents.forEach(obj => console.log("-", JSON.stringify(obj.Key)));
        return jsonData;
    } catch (error) {
        console.error('Erro ao acessar o S3:', error);
        throw error;
    }
};

async function alertasNasUltimas24hrs(idServidor) {

    try {
        // let jql = 'project = SUP AND resolution = Unresolved ORDER BY created DESC';

        let body = {
            jql: 'project = SUP AND resolution = Unresolved ORDER BY created DESC',
            maxResults: 50,
            fieldsByKeys: true,
            fields: ["summary", "created"],
        };

        let response = await axios.post(
            `${dominio}/rest/api/3/search/jql`,
            body,
            {
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    Authorization: `Basic ${Buffer.from(
                        `${email}:${token}`,
                    ).toString("base64")}`,
                },
            }
        );

        return response.data;

    } catch (error) {
        console.error("Erro ao buscar alertas do Jira:", error);
        throw error;
    }
}




module.exports = {
    pegarDadosBucketModel,
    buscarDadosServidores,
    buscarListaServidores,
    pegarDadosDiscoModel,
    alertasNasUltimas24hrs,
    buscarLimitesServidor
};
