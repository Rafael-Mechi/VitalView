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


insert into hospital (nome, cnpj, codigoTecnico, codigoAnalista) 
values 
('Hospital São Lucas', '12345678000195', 'TEC123', 'ANA456'),
('Hospital Vida Saudável', '98765432000188', 'TEC789', 'ANA101'),
('Clínica Santa Maria', '11223344000166', 'TEC202', 'ANA303');

select * from usuario;
select * from hospital;

   select idHospital, 
			case 
				when codigoTecnico = '${codigo}' then 'tecnico'
				when codigoAnalista = '${codigo}' then 'analista'
				else null
			end as cargo
	from hospital
	where codigoTecnico = '${codigo}' or codigoAnalista = '${codigo}'
	limit 1;
    
-- drop database vitalview;