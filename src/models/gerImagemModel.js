var database = require("../database/config");
var AWS = require('../aws/awsConfig.js');
const s3 = new AWS.S3();

// function buscarDadosServidores(idServidor) {

//     const instrucao = `
//             select * from servidores where idServidor = ${idServidor};
//         `;
//     return database.executar(instrucao);
// }

// function buscarListaServidores() {
//     const instrucao = `
//             select * from servidores;
//         `;
//     return database.executar(instrucao);
// }

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
// const pegarDadosDiscoModel = async (bucketName, fileKey) => {
//     const params = {
//         Bucket: bucketName,
//         Key: fileKey // caminho para a pasta do json de disco (lembrar de criar no bucket)
//     };

//     try {
//         const data = await s3.getObject(params).promise();
//         const jsonData = JSON.parse(data.Body.toString('utf-8'));
//         return jsonData;
//     } catch (error) {
//         console.error('Erro ao acessar o S3:', error);
//         throw error;
//     }
// };




module.exports = {
    pegarDadosBucketModel
};
