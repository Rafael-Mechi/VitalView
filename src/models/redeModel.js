var database = require("../database/config");
var AWS = require("../aws/awsConfig.js");
const s3 = new AWS.S3();

const BUCKET_REDE = process.env.AWS_BUCKET_CLIENTE || process.env.AWS_BUCKET_NAME;

function listarServidoresPorHospital(idHospital) {
    const instrucao = `
        SELECT idServidor, hostname 
        FROM servidores
        WHERE fkHospital = ${idHospital};
    `;
    return database.executar(instrucao);
}

function buscarLimites(idServidor) {
    var sql = `
        SELECT *
        FROM limiteMetrica
        WHERE fkServidor = ${idServidor}
    `;
    return database.executar(sql);
}

async function pegarDadosRede(hostname) {
    const fileKey = `rede/${hostname}/rede_${hostname}.json`;

    const params = {
        Bucket: BUCKET_REDE,
        Key: fileKey
    };

    console.log("[S3] Buscando dados de rede:", params);

    try {
        const data = await s3.getObject(params).promise();
        const jsonStr = data.Body.toString("utf-8");
        const json = JSON.parse(jsonStr);
        return json;
    } catch (error) {
        console.error("Erro ao acessar o S3 (rede):", error);
        throw error;
    }
}

module.exports = {
    pegarDadosRede,
    buscarLimites,
    listarServidoresPorHospital
};

