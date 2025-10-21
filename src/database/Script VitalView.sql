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
    foreign key(fkHospital) references hospital(idHospital)
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
    
    limite int not null,
    
    foreign key (fkTipo) references tipoComponente(idTipo),
    foreign key(fkServidor) references servidores(idServidor)
);


create table capturas (
    idCapturas int primary key auto_increment,
    dataHora datetime not null,
    valor decimal(5,2) not null,
    status boolean,
    fkComponente int not null,
    foreign key (fkComponente) references componentes(idComponente)
);

create table alerta(
id int primary key auto_increment,
data_alerta datetime not null,
registro float not null,
fkComponente int not null
);


insert into usuario (nome, cpf, telefone, email, senha, fkCargo, fkHospital) values(
"analista", "333", "333", "analista@.com", "123", 1, 1
);

insert into usuario (nome, cpf, telefone, email, senha, fkCargo, fkHospital) values(
"suporte", "333", "333", "suporte@.com", "123", 2, 2
);

insert into usuario (nome, cpf, telefone, email, senha, fkCargo, fkHospital) values(
"admin", "333", "333", "admin@.com", "123", 3, 2
);

select * from usuario;
select * from servidores;
select * from hospital;
select * from cargo;
select * from tipoComponente;
select * from componentes;

-- drop database vitalview;
