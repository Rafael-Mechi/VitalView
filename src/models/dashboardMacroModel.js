var database = require("../database/config");
var AWS = require('../aws/awsConfig.js');
const s3 = new AWS.S3();

// Busca servidores do hospital
function buscarDadosDashboard(idHospital) {
    var instrucaoSql = `
        SELECT 
            s.idServidor as id,
            s.hostname as nome,
            s.ip,
            s.localizacao,
            (SELECT c.limite FROM componentes c WHERE c.fkServidor = s.idServidor AND c.fkTipo = 1) as limite_cpu,
            (SELECT c.limite FROM componentes c WHERE c.fkServidor = s.idServidor AND c.fkTipo = 2) as limite_ram, 
            (SELECT c.limite FROM componentes c WHERE c.fkServidor = s.idServidor AND c.fkTipo = 3) as limite_disco,
            (SELECT COUNT(*) FROM alerta a 
             JOIN componentes c ON a.fkComponente = c.idComponente
             LEFT JOIN correcao_alerta ca ON a.id = ca.fkAlerta
             WHERE c.fkServidor = s.idServidor AND ca.id IS NULL) as qtd_alertas_ativos,
            (SELECT TIMEDIFF(NOW(), MIN(a.data_alerta)) 
             FROM alerta a 
             JOIN componentes c ON a.fkComponente = c.idComponente
             LEFT JOIN correcao_alerta ca ON a.id = ca.fkAlerta
             WHERE c.fkServidor = s.idServidor AND ca.id IS NULL) as tempo_alerta
        FROM servidores s
        WHERE s.fkHospital = ${idHospital}
        ORDER BY s.hostname;
    `;
    return database.executar(instrucaoSql);
}

// Busca KPIs
function buscarKPIs(idHospital) {
    var instrucaoSql = `
        SELECT 
            COUNT(DISTINCT s.idServidor) as total_servidores,
            COUNT(DISTINCT CASE 
                WHEN EXISTS (
                    SELECT 1 FROM alerta a 
                    JOIN componentes c ON a.fkComponente = c.idComponente
                    LEFT JOIN correcao_alerta ca ON a.id = ca.fkAlerta
                    WHERE c.fkServidor = s.idServidor AND ca.id IS NULL
                ) THEN s.idServidor 
            END) as servidores_alerta,
            (SELECT COUNT(*) FROM alerta a
             JOIN componentes c ON a.fkComponente = c.idComponente
             JOIN servidores s2 ON c.fkServidor = s2.idServidor
             WHERE a.data_alerta >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
             AND s2.fkHospital = ${idHospital}) as alertas_24h,
            (SELECT COUNT(*) FROM alerta a
             JOIN componentes c ON a.fkComponente = c.idComponente
             JOIN servidores s2 ON c.fkServidor = s2.idServidor
             WHERE a.data_alerta BETWEEN DATE_SUB(NOW(), INTERVAL 48 HOUR) AND DATE_SUB(NOW(), INTERVAL 24 HOUR)
             AND s2.fkHospital = ${idHospital}) as alertas_anterior
        FROM servidores s
        WHERE s.fkHospital = ${idHospital}
    `;
    return database.executar(instrucaoSql);
}

// Busca total de alertas
function buscarAlertasGerais(idHospital) {
    var instrucaoSql = `
        SELECT COUNT(*) as total_alertas
        FROM alerta a
        JOIN componentes c ON a.fkComponente = c.idComponente
        JOIN servidores s ON c.fkServidor = s.idServidor
        WHERE s.fkHospital = ${idHospital};
    `;
    return database.executar(instrucaoSql);
}

// Busca arquivo S3
const buscarDadosBucketMacro = async (fileKey) => {
    const bucketName = process.env.AWS_BUCKET_NAME || "bucket-munir-dashmacro";

    console.log(`📁 Buscando no S3: ${fileKey}`);

    // Debug: lista arquivos do bucket
    try {
        const lista = await s3.listObjectsV2({ Bucket: bucketName }).promise();
        console.log('📁 Arquivos disponíveis:', lista.Contents.map(obj => obj.Key));
    } catch (err) {
        console.error('❌ Erro ao listar bucket:', err);
    }

    const params = {
        Bucket: bucketName,
        Key: fileKey
    };

    try {
        const data = await s3.getObject(params).promise();
        const jsonData = JSON.parse(data.Body.toString('utf-8'));
        console.log(`✅ Arquivo ${fileKey} carregado com ${jsonData.length} registros`);
        return jsonData;
    } catch (error) {
        if (error.code === 'NoSuchKey') {
            console.log(`⚠️ Arquivo ${fileKey} não encontrado no bucket`);
            return []; // Retorna array vazio se arquivo não existir
        }
        console.error('❌ Erro ao acessar o S3:', error);
        throw error;
    }
};

module.exports = {
    buscarDadosDashboard,
    buscarKPIs,
    buscarAlertasGerais,
    buscarDadosBucketMacro
};