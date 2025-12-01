var database = require("../database/config");
var AWS = require("../aws/awsConfig.js");
const s3 = new AWS.S3();

const BUCKET_ANALISTA = process.env.AWS_BUCKET_CLIENTE || process.env.AWS_BUCKET_NAME;

async function topServidoresComMaisAlertas(idHospital, periodo) {
    let filtroData = getFiltroData(periodo);
    
    const instrucao = `
    SELECT 
        s.idServidor,
        s.hostname,
        s.ip,
        s.localizacao,
        COUNT(a.id) AS quantidade_alertas
    FROM 
        alerta a
    JOIN 
        componentes c ON a.fkComponente = c.idComponente
    JOIN 
        servidores s ON c.fkServidor = s.idServidor
    WHERE 
        s.fkHospital = ${idHospital}
        AND ${filtroData}
    GROUP BY 
        s.idServidor, s.hostname, s.ip, s.localizacao
    ORDER BY 
        quantidade_alertas DESC
    LIMIT 5;
    `
    return database.executar(instrucao);
}

async function distribuicaoAlertasPorComponente(idHospital, periodo) {
    let filtroData = getFiltroData(periodo);
    
    const instrucao = `
    SELECT 
        tc.nome AS componente,
        COUNT(a.id) AS quantidade_alertas
    FROM alerta a
    JOIN componentes c ON a.fkComponente = c.idComponente
    JOIN tipoComponente tc ON c.fkTipo = tc.idTipo
    JOIN servidores s ON c.fkServidor = s.idServidor
    JOIN hospital h ON s.fkHospital = h.idHospital
    WHERE 
        h.idHospital = ${idHospital}
        AND ${filtroData}
    GROUP BY tc.nome
    ORDER BY quantidade_alertas DESC;
    `;
    return database.executar(instrucao);
}

async function contarAlertasNoPeriodo(idHospital, periodo) {
    let filtroData = getFiltroData(periodo);
    
    const instrucao = `
    SELECT 
        COUNT(a.id) AS quantidade_alertas
    FROM 
        alerta a
    JOIN 
        componentes c ON a.fkComponente = c.idComponente
    JOIN 
        servidores s ON c.fkServidor = s.idServidor
    JOIN 
        hospital h ON s.fkHospital = h.idHospital
    WHERE 
        h.idHospital = ${idHospital}
        AND ${filtroData}
    `;
    return database.executar(instrucao);
}

async function distribuicaoAlertasAno(idHospital, periodo) {
    let instrucao = '';
    
    switch(periodo) {
        case 'dia':
            instrucao = `
            SELECT 
                DATE_FORMAT(a.data_alerta, '%Y-%m-%d %H:00:00') AS periodo,
                HOUR(a.data_alerta) AS hora,
                COUNT(a.id) AS quantidade_alertas
            FROM 
                alerta a
            JOIN 
                componentes c ON a.fkComponente = c.idComponente
            JOIN 
                servidores s ON c.fkServidor = s.idServidor
            JOIN 
                hospital h ON s.fkHospital = h.idHospital
            WHERE 
                h.idHospital = ${idHospital}
                AND a.data_alerta >= CURDATE()
                AND a.data_alerta < CURDATE() + INTERVAL 1 DAY
            GROUP BY 
                periodo, hora
            ORDER BY 
                periodo ASC`;
            break;
            
        case 'semana':
            instrucao = `
            SELECT 
                DATE_FORMAT(a.data_alerta, '%Y-%m-%d') AS periodo,
                DAYNAME(a.data_alerta) AS dia_semana,
                COUNT(a.id) AS quantidade_alertas
            FROM 
                alerta a
            JOIN 
                componentes c ON a.fkComponente = c.idComponente
            JOIN 
                servidores s ON c.fkServidor = s.idServidor
            JOIN 
                hospital h ON s.fkHospital = h.idHospital
            WHERE 
                h.idHospital = ${idHospital}
                AND a.data_alerta >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
                AND a.data_alerta < CURDATE() + INTERVAL 1 DAY
            GROUP BY 
                periodo, dia_semana
            ORDER BY 
                periodo ASC`;
            break;
            
        case 'mes':
            instrucao = `
            SELECT 
                DAY(a.data_alerta) AS dia_mes,
                COUNT(a.id) AS quantidade_alertas
            FROM 
                alerta a
            JOIN 
                componentes c ON a.fkComponente = c.idComponente
            JOIN 
                servidores s ON c.fkServidor = s.idServidor
            JOIN 
                hospital h ON s.fkHospital = h.idHospital
            WHERE 
                h.idHospital = ${idHospital}
                AND a.data_alerta >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
                AND a.data_alerta < DATE_ADD(DATE_FORMAT(CURDATE(), '%Y-%m-01'), INTERVAL 1 MONTH)
            GROUP BY 
                dia_mes
            ORDER BY 
                dia_mes ASC`;
            break;
            
        case 'trimestre':
            instrucao = `
            SELECT 
                DATE_FORMAT(a.data_alerta, '%Y-%m') AS periodo,
                MONTH(a.data_alerta) AS mes,
                COUNT(a.id) AS quantidade_alertas
            FROM 
                alerta a
            JOIN 
                componentes c ON a.fkComponente = c.idComponente
            JOIN 
                servidores s ON c.fkServidor = s.idServidor
            JOIN 
                hospital h ON s.fkHospital = h.idHospital
            WHERE 
                h.idHospital = ${idHospital}
                AND a.data_alerta >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)
            GROUP BY 
                periodo, mes
            ORDER BY 
                periodo ASC`;
            break;
            
        case 'semestre':
            instrucao = `
            SELECT 
                DATE_FORMAT(a.data_alerta, '%Y-%m') AS periodo,
                MONTH(a.data_alerta) AS mes,
                COUNT(a.id) AS quantidade_alertas
            FROM 
                alerta a
            JOIN 
                componentes c ON a.fkComponente = c.idComponente
            JOIN 
                servidores s ON c.fkServidor = s.idServidor
            JOIN 
                hospital h ON s.fkHospital = h.idHospital
            WHERE 
                h.idHospital = ${idHospital}
                AND a.data_alerta >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
            GROUP BY 
                periodo, mes
            ORDER BY 
                periodo ASC`;
            break;
            
        case 'ano':
        default:
            instrucao = `
            SELECT 
                DATE_FORMAT(a.data_alerta, '%Y-%m') AS periodo,
                COUNT(a.id) AS quantidade_alertas
            FROM 
                alerta a
            JOIN 
                componentes c ON a.fkComponente = c.idComponente
            JOIN 
                servidores s ON c.fkServidor = s.idServidor
            JOIN 
                hospital h ON s.fkHospital = h.idHospital
            WHERE 
                h.idHospital = ${idHospital}
                AND a.data_alerta >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
            GROUP BY 
                periodo
            ORDER BY 
                periodo ASC`;
            break;
    }
    
    return database.executar(instrucao);
}

async function diaSemanaComMaisAlertas(idHospital, periodo) {
    let filtroData = getFiltroData(periodo);
    let instrucao = '';
    
    if (periodo === 'dia') {
        // Para o período 'dia', retorna a hora com mais alertas
        instrucao = `
        SELECT 
            HOUR(a.data_alerta) AS hora,
            COUNT(a.id) AS quantidade_alertas
        FROM 
            alerta a
        JOIN 
            componentes c ON a.fkComponente = c.idComponente
        JOIN 
            servidores s ON c.fkServidor = s.idServidor
        JOIN 
            hospital h ON s.fkHospital = h.idHospital
        WHERE 
            h.idHospital = ${idHospital}
            AND ${filtroData}
        GROUP BY 
            hora
        ORDER BY 
            quantidade_alertas DESC
        LIMIT 1;
        `;
    } else {
        // Para outros períodos, retorna o dia da semana com mais alertas
        instrucao = `
        SELECT 
            DAYNAME(a.data_alerta) AS dia_semana,
            DAYOFWEEK(a.data_alerta) AS ordem_dia,
            COUNT(a.id) AS quantidade_alertas
        FROM 
            alerta a
        JOIN 
            componentes c ON a.fkComponente = c.idComponente
        JOIN 
            servidores s ON c.fkServidor = s.idServidor
        JOIN 
            hospital h ON s.fkHospital = h.idHospital
        WHERE 
            h.idHospital = ${idHospital}
            AND ${filtroData}
        GROUP BY 
            dia_semana, ordem_dia
        ORDER BY 
            quantidade_alertas DESC
        LIMIT 1;
        `;
    }
    
    return database.executar(instrucao);
}

// Função auxiliar para filtro de data
function getFiltroData(periodo) {
    switch(periodo) {
        case 'dia':
            return `a.data_alerta >= CURDATE() 
                    AND a.data_alerta < CURDATE() + INTERVAL 1 DAY`;
        case 'semana':
            return `a.data_alerta >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) 
                    AND a.data_alerta < CURDATE() + INTERVAL 1 DAY`;
        case 'mes':
            return `a.data_alerta >= DATE_FORMAT(CURDATE(), '%Y-%m-01') 
                    AND a.data_alerta < DATE_ADD(DATE_FORMAT(CURDATE(), '%Y-%m-01'), INTERVAL 1 MONTH)`;
        case 'trimestre':
            return `a.data_alerta >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)`;
        case 'semestre':
            return `a.data_alerta >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)`;
        case 'ano':
            return `a.data_alerta >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)`;
        default:
            return `a.data_alerta >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)`;
    }
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

function buscarServidores(idHospital){
    const instrucao = `
    SELECT 
        s.idServidor,
        s.hostname,
        h.nome
    FROM 
        servidores s
    INNER JOIN hospital h on h.idHospital = s.fkHospital
    WHERE 
        s.fkHospital = ${idHospital};
    `;
    return database.executar(instrucao);
}

module.exports = {
    topServidoresComMaisAlertas,
    distribuicaoAlertasPorComponente,
    contarAlertasNoPeriodo,
    distribuicaoAlertasAno,
    diaSemanaComMaisAlertas,
    pegarDadosBucketModel,
    buscarServidores
};