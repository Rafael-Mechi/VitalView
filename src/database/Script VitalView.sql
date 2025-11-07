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
status_alerta varchar(15) not null default 'Em alerta',
fkComponente int not null,

foreign key (fkComponente) references componentes (idComponente)
) auto_increment = 100;

create table correcao_alerta(
id int primary key auto_increment,
data_correcao datetime not null,

fkAlerta int not null,
fkUsuario int not null,

foreign key (fkAlerta) references alerta(id),
foreign key (fkUsuario) references usuario(idUsuario)

);

insert into usuario (nome, cpf, telefone, email, senha, data_criacao, fkCargo, fkHospital) values(
"analista", "333", "333", "analista@hsl.com", "123", "2025-10-10", 1, 1
);

insert into usuario (nome, cpf, telefone, email, senha, data_criacao, fkCargo, fkHospital) values(
"suporte", "333", "333", "suporte@hsl.com", "123", "2025-10-10", 2, 2
);

insert into usuario (nome, cpf, telefone, email, senha, data_criacao, fkCargo, fkHospital) values(
"admin", "333", "333", "admin@hsl.com", "123", "2025-10-10", 3, 2
);

insert into usuario (nome, cpf, telefone, email, senha, data_criacao, fkCargo, fkHospital) values(
"suporte2", "333", "333", "suporte2@hsl.com", "123", "2025-10-10",  2, 2
);

insert into usuario (nome, cpf, telefone, email, senha, data_criacao, fkCargo, fkHospital) values(
"analista", "333", "333", "analista@hsl.com", "123", "2025-10-10", 1, 2
);

insert into servidores(hostname, ip, localizacao, fkHospital, fkUsuario) values
('srv1', '192.0.0.1', 'Sala dos servidores', 1, 2);

insert into servidores(hostname, ip, localizacao, fkHospital, fkUsuario) values
('srv2', '192.0.0.2', 'Sala dos servidores', 1, 2);

insert into servidores(hostname, ip, localizacao, fkHospital, fkUsuario) values
('servidor100', '192.0.0.2', 'Sala dos servidores', 2, 2),
('servidor101', '192.0.0.2', 'Sala dos servidores', 2, 2);

insert into componentes(fkTipo, fkServidor, limite) values
(1, 1, 83.5),
(2, 1, 41.6),
(3, 1, 90.0);

insert into componentes(fkTipo, fkServidor, limite) values 
('1', '3', 99.0),
('2', '3', 89.0),
('3', '3', 80.0),
('1', '4', 96.0);

INSERT INTO alerta (data_alerta, registro, fkComponente)
VALUES 
('2025-11-04 10:30:00', 92.7, 1),  -- CPU do servidor 1
('2025-11-04 10:45:00', 88.3, 3);  -- Disco do servidor 1

INSERT INTO alerta (data_alerta, registro, fkComponente)
VALUES
('2025-11-04 14:35:00', 72.5, 4),
('2025-11-04 15:10:00', 88.3, 5),
('2025-11-04 15:10:00', 88.3,6);

-- Usuário 2 resolveu 3 alertas
INSERT INTO correcao_alerta (data_correcao, fkAlerta, fkUsuario) VALUES
('2025-11-02 09:10:00', 100, 2),
('2025-11-03 11:25:00', 101, 2),
('2025-11-04 16:40:00', 102, 2);

-- Usuário 3 resolveu 5 alertas
INSERT INTO correcao_alerta (data_correcao, fkAlerta, fkUsuario) VALUES
('2025-11-01 08:15:00', 103, 3),
('2025-11-02 13:45:00', 104, 3),
('2025-11-03 10:20:00', 105, 3),
('2025-11-04 15:10:00', 106, 3),
('2025-11-05 18:05:00', 107, 3);

-- Usuário 4 resolveu 2 alertas
INSERT INTO correcao_alerta (data_correcao, fkAlerta, fkUsuario) VALUES
('2025-11-03 09:30:00', 108, 4),
('2025-11-04 17:55:00', 109, 4);

-- Usuário 5 resolveu 4 alertas
INSERT INTO correcao_alerta (data_correcao, fkAlerta, fkUsuario) VALUES
('2025-11-01 14:00:00', 100, 5),
('2025-11-02 15:35:00', 101, 5),
('2025-11-03 13:45:00', 102, 5),
('2025-11-05 08:50:00', 103, 5);
