var database = require("../database/config");

function buscarQtdUsuarios(idHospital) {
    var instrucao = `
        SELECT 
            c.nome AS cargo,
            COUNT(u.idUsuario) AS quantidade_usuarios
        FROM cargo c
        LEFT JOIN usuario u ON u.fkCargo = c.idcargo
        WHERE u.fkHospital = ${idHospital} AND u.ativo = 1
        GROUP BY c.idcargo, c.nome;
    `;
    return database.executar(instrucao);
}

function buscarUsuariosSistema(idHospital) {
    var instrucao = `
        SELECT 
    u.idUsuario AS id,
    u.nome AS nome,
    u.email AS email,
    c.nome AS cargo,
    u.data_criacao AS data_criacao,
    COALESCE(GROUP_CONCAT(s.hostname SEPARATOR ', '), 'Nenhum') AS 'servidores_criados'
    FROM usuario u
    INNER JOIN hospital h ON h.idHospital = u.fkHospital
    LEFT JOIN servidores s ON s.fkUsuario = u.idUsuario
    INNER JOIN cargo c ON c.idcargo = u.fkcargo
    WHERE idHospital = ${idHospital} AND u.ativo = 1
    GROUP BY u.idUsuario;`;

    return database.executar(instrucao);
}

function buscarResolucaoDeAlertas(idHospital) {
    var instrucao = `
    SELECT 
        a.id AS id_alerta,
        u.nome AS usuario,
        cgo.nome AS cargo,
        t.nome AS componente,
        a.registro AS uso_no_alerta,
        ca.data_correcao AS data_hora_correcao
    FROM correcao_alerta ca
    INNER JOIN alerta a ON ca.fkAlerta = a.id
    INNER JOIN usuario u ON ca.fkUsuario = u.idUsuario
    INNER JOIN cargo cgo ON u.fkCargo = cgo.idCargo
    INNER JOIN componentes comp ON a.fkComponente = comp.idComponente
    INNER JOIN tipoComponente t ON comp.fkTipo = t.idTipo
    INNER JOIN servidores s ON comp.fkServidor = s.idServidor
    INNER JOIN hospital h ON s.fkHospital = h.idHospital
    WHERE h.idHospital = ${idHospital}
    ORDER BY ca.data_correcao DESC;`;

    return database.executar(instrucao);
}

function usuariosMaisAlertasResolvidos(idHospital) {
    var instrucao = `
    SELECT 
    u.nome AS usuario,
    COUNT(ca.id) AS total_resolvidos
FROM correcao_alerta ca
INNER JOIN alerta a ON ca.fkAlerta = a.id
INNER JOIN componentes comp ON a.fkComponente = comp.idComponente
INNER JOIN servidores s ON comp.fkServidor = s.idServidor
INNER JOIN hospital h ON s.fkHospital = h.idHospital
INNER JOIN usuario u ON ca.fkUsuario = u.idUsuario
INNER JOIN cargo c ON u.fkCargo = c.idCargo
WHERE h.idHospital = ${idHospital}
GROUP BY u.idUsuario, u.nome, c.nome
ORDER BY total_resolvidos DESC
LIMIT 5;
`;

    return database.executar(instrucao);
}

function buscarAlertasResolvidosPendentes(idHospital) {
    var instrucao = `
    SELECT
    (SELECT COUNT(a.id)
    FROM alerta a
    INNER JOIN componentes c ON a.fkComponente = c.idComponente
    INNER JOIN servidores s ON c.fkServidor = s.idServidor
    INNER JOIN hospital h ON s.fkHospital = h.idHospital
    WHERE h.idHospital = ${idHospital}
    AND a.id NOT IN (SELECT fkAlerta FROM correcao_alerta)
    ) AS pendentes,

    (SELECT COUNT(ca.id)
    FROM correcao_alerta ca
    INNER JOIN alerta a ON ca.fkAlerta = a.id
    INNER JOIN componentes c ON a.fkComponente = c.idComponente
    INNER JOIN servidores s ON c.fkServidor = s.idServidor
    INNER JOIN hospital h ON s.fkHospital = h.idHospital
    WHERE h.idHospital = ${idHospital}
    ) AS resolvidos;
`;

    return database.executar(instrucao);
}

function buscarUsuario(idUsuario) {
    var instrucaoSql = `
        SELECT u.*
        FROM usuario u
        INNER JOIN hospital h ON h.idHospital = u.fkHospital
        WHERE u.idUsuario = ${idUsuario} AND u.ativo = 1;
    `
    return database.executar(instrucaoSql);
}

function atualizarUsuario(idUsuario, nome, cpf, telefone, email, senha, cargo) {
    var instrucaoSql = `
    UPDATE usuario SET
            nome = '${nome}',
            cpf = '${cpf}',
            telefone = '${telefone}',
            email = '${email}',
            senha = '${senha}',
            fkcargo = ${cargo}
            WHERE idUsuario = ${idUsuario}
    `

    if (!senha) {
        instrucaoSql = `
    UPDATE usuario SET
            nome = '${nome}',
            cpf = '${cpf}',
            telefone = '${telefone}',
            email = '${email}',
            fkCargo = ${cargo}
            WHERE idUsuario = ${idUsuario}
    `
    }

    return database.executar(instrucaoSql);
}

function excluirUsuario(idUsuario) {
    var instrucaoSql = `
        UPDATE usuario
        SET ativo = 0
        WHERE idUsuario = ${idUsuario};
    `
    return database.executar(instrucaoSql);
}

module.exports = {
    buscarQtdUsuarios,
    buscarUsuariosSistema,
    buscarResolucaoDeAlertas,
    usuariosMaisAlertasResolvidos,
    buscarAlertasResolvidosPendentes,
    buscarUsuario,
    atualizarUsuario,
    excluirUsuario
};
