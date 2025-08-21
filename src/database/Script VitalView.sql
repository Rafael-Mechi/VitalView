create database VitalView;
use VitalView;

create table hospital(
idHospital int not null auto_increment primary key,
nome varchar(100),
cnpj varchar(14),
codigoTecnico varchar(20),
codigoAnalista varchar(20));

create table usuario(
idUsuario int not null auto_increment primary key,
nome varchar(100),
email varchar(100),
senha varchar(45),
cargo varchar(45),
fkHospital int not null,
foreign key (fkHospital) references hospital(idHospital),
constraint chk_cargo check (cargo in ('tecnico', 'analista')));

create table endereco(
idEndereco int not null auto_increment primary key,
logradouro varchar(100),
numero varchar(20),
complemento varchar(20),
bairro varchar(45),
cidade varchar(45),
estado varchar(45),
cep varchar(8),
fkHospital int not null,
foreign key (fkHospital) references hospital(idHospital));

create table alerta(
idAlerta int not null auto_increment primary key,
dataHora datetime default current_timestamp,
cpu decimal(5,2),
memoria decimal(5,2),
disco decimal(5,2),
statusCpu boolean,
statusMemoria boolean,
statusDisco boolean,
fkHospital INT,
foreign key (fkHospital) references hospital(idHospital));