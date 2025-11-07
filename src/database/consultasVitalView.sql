use VitalView;

select * from usuario;
select * from servidores;
select * from hospital;
select * from cargo;
select * from tipoComponente;
select * from componentes;
select * from alerta;
select * from correcao_alerta;

-- buscar quantidade de usuários de cada cargo
SELECT 
  c.nome AS Cargo,
  COUNT(u.idUsuario) AS 'Quantidade de usuários'
FROM cargo c
LEFT JOIN usuario u ON u.fkCargo = c.idcargo
WHERE u.fkHospital = 2
GROUP BY c.idcargo, c.nome;

-- buscar histórico de alertas
SELECT
    a.id as id_alerta,
    s.hostname AS servidor,
    a.data_alerta AS data_hora,
    t.nome AS componente,
    a.registro AS registro,
    a.status_alerta AS status
    FROM alerta a
    INNER JOIN componentes c ON a.fkComponente = c.idComponente
    INNER JOIN tipoComponente t ON c.fkTipo = t.idTipo
    INNER JOIN servidores s ON c.fkServidor = s.idServidor
    INNER JOIN hospital h ON h.idHospital = s.fkHospital
    WHERE h.idHospital = 2
    ORDER BY 
    CASE 
        WHEN a.status_alerta = 'Em alerta' THEN 1
        ELSE 2
    END,
    a.data_alerta ASC;

-- Tabela de alertas resolvidos
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
ORDER BY ca.data_correcao DESC;

-- 5 usuários com mais alertas resolvidos
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
WHERE h.idHospital = 2
GROUP BY u.idUsuario, u.nome, c.nome
ORDER BY total_resolvidos DESC
LIMIT 5;


select * from usuario;