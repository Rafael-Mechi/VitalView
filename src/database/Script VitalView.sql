-- Active: 1750092138630@@127.0.0.1@3306@VitalView
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
create table hospital (
    idHospital int not null auto_increment primary key,
    nome varchar(100),
    cnpj varchar(14),
    telefone varchar(20),
	codigo varchar(10),
    fkendereco int not null,
    foreign key (fkendereco) references endereco (idEndereco)
);

create table cargo (
    idcargo int not null auto_increment primary key,
	nome varchar(45)
)

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


create table alerta (
    idAlerta int not null auto_increment primary key,
    dataHora datetime default current_timestamp,
    cpu decimal(5, 2),
    memoria decimal(5, 2),
    disco decimal(5, 2),
    statusCpu boolean,
    statusMemoria boolean,
    statusDisco boolean,
    fkHospital INT,
    foreign key (fkHospital) references hospital (idHospital)
);

insert into cargo(nome) values ('Analista'), ('Técnico');


select * from usuario;

select * from hospital;


-- drop database vitalview;