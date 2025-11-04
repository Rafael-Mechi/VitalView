drop database if exists VitalView;
create database VitalView;

use VitalView;

create table endereco (
    idEndereco int not null auto_increment primary key,
    logradouro varchar(100),
    numero varchar(20),
    complemento varchar(20),
    bairro varchar(45),
    cidade varchar(45),
    estado varchar(45),
    cep varchar(8)
);

insert into endereco (logradouro, numero, complemento, bairro, cidade, estado, cep) VALUES
('Av. Paulista', '1000', 'Bloco A', 'Bela Vista', 'São Paulo', 'SP', '01311000');

insert into endereco (logradouro, numero, complemento, bairro, cidade, estado, cep) VALUES
('Av. Paulista', '1000', 'Bloco A', 'Bela Vista', 'São Paulo', 'SP', '01311000');

create table hospital (
    idHospital int not null auto_increment primary key,
    nome varchar(100),
    cnpj varchar(14),
    telefone varchar(20),
	codigo varchar(10),
    fkendereco int not null,
    foreign key (fkendereco) references endereco (idEndereco)
);

insert into hospital (nome, cnpj, telefone, codigo, fkEndereco) VALUES
('Hospital Central São Lucas', '12345678000199', '(11) 4002-8922', 'HOSP001', 1);

insert into hospital (nome, cnpj, telefone, codigo, fkEndereco) VALUES
('Sirio libanes', '12345678000199', '(11) 4002-8922', 'HOSP002', 2);

create table cargo (
    idcargo int not null auto_increment primary key,
	nome varchar(45)
);

insert into cargo(nome) values ('Analista'), ('Técnico'), ('Administrador');

create table usuario (
    idUsuario int not null auto_increment primary key,
    nome varchar(100),
	cpf varchar(11),
	telefone varchar(20),
    email varchar(100),
    senha varchar(45),
    data_criacao date,
	fkcargo int not null,
    fkHospital int not null,
    foreign key (fkHospital) references hospital(idHospital),
	foreign key (fkcargo) references cargo(idcargo)
);




create table servidores (
    idServidor int primary key auto_increment,
    hostname varchar(45) not null,
    ip varchar(80) not null,
    localizacao varchar(75) not null,
    fkHospital int,
    fkUsuario int,
    foreign key(fkHospital) references hospital(idHospital),
    foreign key(fkUsuario) references usuario(idUsuario)
);

-- insert into servidores (hostname, ip, fkHospital) values
-- ('Servidor Principal', '192.168.0.10', 1),
-- ('Servidor Backup', '192.168.0.11', 1);




create table tipoComponente (
    idTipo int primary key auto_increment,
    nome VARCHAR(45) not null unique
);

insert into tipoComponente(nome) values( 
       ("Cpu")
);
insert into tipoComponente(nome) values( 
       ("Memória")
);
insert into tipoComponente(nome) values( 
       ("Disco")
);


create table componentes (
    idComponente int primary key auto_increment,
    fkTipo int not null,
    fkServidor int not null,
    
    limite decimal(4, 1) not null,
    
    constraint chk_limite check (limite <= 100.0),
    
    foreign key (fkTipo) references tipoComponente(idTipo),
    foreign key(fkServidor) references servidores(idServidor)
);
use VitalView;


create table alerta(
id int primary key auto_increment,
data_alerta datetime not null,
registro float not null,
fkComponente int not null,

foreign key (fkComponente) references componentes (idComponente)
) auto_increment = 100;

create table correcao_alerta(
id int primary key auto_increment,
data_correcao datetime not null,

fkAlerta int not null,

foreign key (fkAlerta) references alerta(id)

);


insert into usuario (nome, cpf, telefone, email, senha, fkCargo, fkHospital) values(
"analista", "333", "333", "analista@hsl.com", "123", 1, 1
);

insert into usuario (nome, cpf, telefone, email, senha, data_criacao, fkCargo, fkHospital) values(
"suporte", "333", "333", "suporte@hsl.com", "123", "2025-10-10", 2, 2
);

insert into usuario (nome, cpf, telefone, email, senha, data_criacao, fkCargo, fkHospital) values(
"admin", "333", "333", "admin@hsl.com", "123", "2025-10-10", 3, 2
);

insert into usuario (nome, cpf, telefone, email, senha, data_criacao, fkCargo, fkHospital) values(
"suporte2", "333", "333", "suporte2@hsl.com", "2025-10-10", "123", 2, 2
);

insert into usuario (nome, cpf, telefone, email, senha, fkCargo, fkHospital) values(
"analista", "333", "333", "analista@hsl.com", "123", 1, 2
);

insert into servidores(hostname, ip, localizacao, fkHospital, fkUsuario) values
('srv1', '192.0.0.1', 'Sala dos servidores', 1, 2);

insert into servidores(hostname, ip, localizacao, fkHospital, fkUsuario) values
('srv2', '192.0.0.2', 'Sala dos servidores', 1, 2);

insert into componentes(fkTipo, fkServidor, limite) values
(1, 1, 83.5),
(2, 1, 41.6),
(3, 1, 90.0);

INSERT INTO alerta (data_alerta, registro, fkComponente)
VALUES 
('2025-11-04 10:30:00', 92.7, 1),  -- CPU do servidor 1
('2025-11-04 10:45:00', 88.3, 3);  -- Disco do servidor 1


select * from usuario;
select * from servidores;
select * from hospital;
select * from cargo;
select * from tipoComponente;
select * from componentes;
select * from alerta;

SELECT 
  u.idUsuario AS ID,
  u.nome AS Nome,
  u.email AS Email,
  c.nome AS Cargo,
  u.data_criacao AS 'Data de criação',
  COALESCE(GROUP_CONCAT(s.hostname SEPARATOR ', '), 'Nenhum') AS 'Servidores criados'
FROM usuario u
INNER JOIN hospital h ON h.idHospital = u.fkHospital
LEFT JOIN servidores s ON s.fkUsuario = u.idUsuario
INNER JOIN cargo c ON c.idcargo = u.fkcargo
WHERE idHospital = 2
GROUP BY u.idUsuario;

SELECT 
  c.nome AS Cargo,
  COUNT(u.idUsuario) AS 'Quantidade de usuários'
FROM cargo c
LEFT JOIN usuario u ON u.fkCargo = c.idcargo
WHERE u.fkHospital = 2
GROUP BY c.idcargo, c.nome;


SELECT 
    s.hostname AS Servidor,
    a.data_alerta AS 'Data e hora do alerta',
    t.nome AS Componente,
    a.registro AS 'Registro (%)'
FROM alerta a
INNER JOIN componentes c ON a.fkComponente = c.idComponente
INNER JOIN tipoComponente t ON c.fkTipo = t.idTipo
INNER JOIN servidores s ON c.fkServidor = s.idServidor
ORDER BY a.data_alerta DESC;


-- drop database vitalview;
