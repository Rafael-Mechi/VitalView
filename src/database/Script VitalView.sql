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
    ativo boolean default true,
    
	fkcargo int not null,
    fkHospital int not null,
		
    foreign key (fkHospital) references hospital(idHospital),
	foreign key (fkcargo) references cargo(idcargo)
);

create table exclusaoAlerta(
	id int primary key auto_increment,
    caminhoImagem varchar(155) not null,
    apagavel tinyint default 1,
    dataHora datetime not null,
    
    fkUsuario int not null,
    
    foreign key fkUsuario (fkUsuario) references usuario(idUsuario)
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

insert into servidores (hostname, ip, localizacao, fkHospital) values
('Servidor Principal', '192.168.0.10', 'ala01', 1),
('Servidor Backup', '192.168.0.11', 'ala2', 1),
('srv1', '123.123.0.33', 'alab', 1);


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

insert into tipoComponente(nome) values( 
       ("Rede")
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

create table rede (
idRede int primary key auto_increment,
    metrica VARCHAR(45) not null unique
);

insert into rede (metrica) values
("Download"),
("Upload"),
("PacoteIn"),
("PacoteOut"),
("Conexao"),
("Latencia"),
("PerdaPacote");

create table limiteRede (
    idlimite int primary key auto_increment,
    fkRede int not null,
    fkServidor int not null,
    
    limite decimal(4, 1) not null,
    
    constraint chk_limite_rede check (limite <= 100.0),
    
    foreign key (fkRede) references rede(idRede),
    foreign key(fkServidor) references servidores(idServidor)
    ); 
    
insert into limiteRede (fkRede, fkServidor, limite) values 
(1, 3, 9.0),
(2, 3, 0.1),
(3, 3, 37.1),
(4, 3, 4.6),
(5, 3, 34),
(6, 3, 18.8),
(7, 3, 0.5);

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


insert into componentes (fkTipo, fkServidor, limite) values
(4, 3, 100.0);


-- ALERTAS do hospital 2
INSERT INTO alerta (id, data_alerta, registro, fkComponente)
VALUES
(100, '2025-11-04 14:35:00', 72.5, 4),  -- CPU servidor 3
(101, '2025-11-04 15:10:00', 88.3, 5),  -- Memória servidor 3
(102, '2025-11-04 15:10:00', 88.3, 6),  -- Disco servidor 3
(103, '2025-11-04 16:30:00', 90.2, 7),  -- CPU servidor 4
(104, '2025-11-04 16:30:00', 90.2, 7);  -- CPU servidor 4


-- Usuário 2 (suporte) resolveu 2 alertas
INSERT INTO correcao_alerta (data_correcao, fkAlerta, fkUsuario) VALUES
('2025-11-04 16:40:00', 100, 2),
('2025-11-04 17:00:00', 101, 2);

-- Usuário 3 (admin) resolveu 1 alerta
INSERT INTO correcao_alerta (data_correcao, fkAlerta, fkUsuario) VALUES
('2025-11-04 17:30:00', 102, 3);

-- Usuário 4 (suporte2) resolveu 1 alerta
INSERT INTO correcao_alerta (data_correcao, fkAlerta, fkUsuario) VALUES
('2025-11-04 17:55:00', 103, 4);

-- Usuário 5 (analista) resolveu 1 alerta
INSERT INTO correcao_alerta (data_correcao, fkAlerta, fkUsuario) VALUES
('2025-11-05 08:50:00', 104, 5);

select * from usuario;

select * from componentes;

select * from alerta;

select * from correcao_alerta;

select * from rede;

select * from limiteRede;