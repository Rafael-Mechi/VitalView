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
	a.id,
    s.hostname AS Servidor,
    a.data_alerta AS 'Data e hora do alerta',
    t.nome AS Componente,
    a.registro AS 'Registro (%)'
    FROM alerta a
    INNER JOIN componentes c ON a.fkComponente = c.idComponente
    INNER JOIN tipoComponente t ON c.fkTipo = t.idTipo
    INNER JOIN servidores s ON c.fkServidor = s.idServidor
    INNER JOIN hospital h on h.idHospital = s.fkHospital
    WHERE idHospital = 2
    ORDER BY a.data_alerta DESC;

