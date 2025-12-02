	drop database if exists VitalView;
	create database VitalView;

CREATE USER 'aluno'@'%' IDENTIFIED BY 'sptech';
GRANT ALL PRIVILEGES ON *.* TO 'aluno'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;


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
	('hsl', '12345678000199', '(11) 4002-8922', 'HOSP002', 2);

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
	('srv1', '123.123.0.33', 'alab', 2),
	('srv2', '156.117.0.34', 'alab', 2),
	('srv3', '112.221.0.35', 'alab', 2);


	create table tipoComponente (
		idTipo int primary key auto_increment,
		nome VARCHAR(45) not null unique
	);

	insert into tipoComponente(nome) values( 
		   ("Cpu")
	);
	insert into tipoComponente(nome) values( 
		   ("Memoria")
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

	create table metrica (
	idMetrica int primary key auto_increment,
		metrica VARCHAR(45) not null unique
	);

	insert into metrica (metrica) values
	("Download"),
	("Upload"),
	("PacoteIn"),
	("PacoteOut"),
	("Conexao"),
	("Latencia"),
	("PerdaPacote"),
    ("TaxaLeitura"),
    ("TaxaEscrita"),
    ("LatenciaDisco");

	create table limiteMetrica (
		idlimite int primary key auto_increment,
		fkMetrica int not null,
		fkServidor int not null,
		
		limite decimal(4, 1) not null,
		
		constraint chk_limite_metrica check (limite <= 100.0),
		
		foreign key (fkMetrica) references metrica(idMetrica),
		foreign key(fkServidor) references servidores(idServidor)
		); 
		
	insert into limiteMetrica (fkMetrica, fkServidor, limite) values 
	(1, 3, 9.0),
	(2, 3, 0.1),
	(3, 3, 37.1),
	(4, 3, 4.6),
	(5, 3, 34),
	(6, 3, 18.8),
	(7, 3, 0.5),
    (8, 3, 0.5),
    (9, 3, 0.5),
    (10, 3, 10.0),
    (1, 2, 9.0),
	(2, 2, 0.1),
	(3, 2, 37.1),
	(4, 2, 4.6),
	(5, 2, 34),
	(6, 2, 18.8),
	(7, 2, 0.5),
    (8, 2, 0.5),
    (9, 2, 0.5),
    (10, 2, 10.0),
    (1, 1, 9.0),
	(2, 1, 0.1),
	(3, 1, 37.1),
	(4, 1, 4.6),
	(5, 1, 34),
	(6, 1, 18.8),
	(7, 1, 0.5),
    (8, 1, 0.5),
    (9, 1, 0.5),
    (10, 1, 10.0);

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
	"analista", "333", "333", "analista0@hsl.com", "123", "2025-10-10", 1, 1
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

	insert into componentes(fkTipo, fkServidor, limite) values 
	(1, 1, 83.5),
	(2, 1, 54.6),
	(3, 1, 85.0),
	(4, 1, 100.0),
	(1, 2, 83.5),
	(2, 2, 69.6),
	(3, 2, 85.0),
	(4, 2, 100.0),
	(1, 3, 83.5),
	(2, 3, 85.6),
	(3, 3, 85.0),
	(4, 3, 100.0);

	-- ALERTAS do hospital 2
	INSERT INTO alerta (id, data_alerta, registro, fkComponente)
	VALUES
	(100, '2025-11-04 14:35:00', 72.5, 4),  -- CPU servidor 3
	(101, '2025-11-04 15:10:00', 88.3, 5),  -- Memoria servidor 3
	(102, '2025-11-04 15:10:00', 88.3, 6);  -- Disco servidor 3


	-- Usuário 2 (suporte) resolveu 2 alertas
	INSERT INTO correcao_alerta (data_correcao, fkAlerta, fkUsuario) VALUES
	('2025-11-04 16:40:00', 100, 2),
	('2025-11-04 17:00:00', 101, 2);

	-- Usuário 3 (admin) resolveu 1 alerta
	INSERT INTO correcao_alerta (data_correcao, fkAlerta, fkUsuario) VALUES
	('2025-11-04 17:30:00', 102, 3);  
	
	INSERT INTO alerta (data_alerta, registro, fkComponente) VALUES
('2024-12-03 14:37:00', 88.9, 3),
('2024-12-05 09:14:00', 95.2, 5),
('2024-12-07 18:20:00', 102.4, 4),
('2024-12-10 14:37:00', 90.1, 3),
('2024-12-12 07:55:00', 94.6, 2),
('2024-12-16 21:30:00', 108.2, 11),
('2024-12-17 14:37:00', 87.6, 3),
('2024-12-20 11:43:00', 101.3, 10),
('2024-12-24 14:37:00', 89.8, 3),
('2024-12-29 16:10:00', 92.1, 8);

INSERT INTO alerta (data_alerta, registro, fkComponente) VALUES
('2025-01-03 10:02:00', 91.4, 1),
('2025-01-07 14:37:00', 88.5, 3),
('2025-01-09 08:10:00', 96.7, 6),
('2025-01-11 13:55:00', 104.1, 4),
('2025-01-14 14:37:00', 90.8, 3),
('2025-01-17 19:44:00', 109.3, 12),
('2025-01-21 14:37:00', 89.0, 3),
('2025-01-25 09:20:00', 94.2, 7),
('2025-01-28 14:37:00', 87.9, 3);

INSERT INTO alerta (data_alerta, registro, fkComponente) VALUES
('2025-02-01 12:15:00', 97.8, 9),
('2025-02-04 14:37:00', 88.6, 3),
('2025-02-08 17:40:00', 103.4, 4),
('2025-02-11 14:37:00', 90.2, 3),
('2025-02-15 09:50:00', 92.7, 2),
('2025-02-18 14:37:00', 89.1, 3),
('2025-02-22 20:33:00', 106.6, 10),
('2025-02-25 14:37:00', 87.5, 3);

INSERT INTO alerta (data_alerta, registro, fkComponente) VALUES
('2025-03-02 08:22:00', 92.2, 6),
('2025-03-04 14:37:00', 88.5, 3),
('2025-03-06 16:10:00', 103.1, 11),
('2025-03-09 10:37:00', 87.5, 1),
('2025-03-11 14:37:00', 90.2, 3),
('2025-03-14 19:55:00', 107.4, 12),
('2025-03-18 14:37:00', 89.7, 3),
('2025-03-20 09:43:00', 96.1, 8),
('2025-03-25 14:37:00', 91.5, 3);

INSERT INTO alerta (data_alerta, registro, fkComponente) VALUES
('2025-04-01 14:37:00', 87.3, 3),
('2025-04-03 11:00:00', 93.8, 2),
('2025-04-05 07:40:00', 105.4, 4),
('2025-04-08 14:37:00', 88.0, 3),
('2025-04-10 18:34:00', 97.1, 7),
('2025-04-12 09:20:00', 90.4, 5),
('2025-04-15 14:37:00', 89.2, 3),
('2025-04-20 20:10:00', 108.6, 11),
('2025-04-22 14:37:00', 90.3, 3),
('2025-04-29 14:37:00', 88.8, 3);

INSERT INTO alerta (data_alerta, registro, fkComponente) VALUES
('2025-05-02 07:33:00', 93.4, 1),
('2025-05-06 14:37:00', 88.4, 3),
('2025-05-09 19:14:00', 104.8, 4),
('2025-05-13 14:37:00', 89.9, 3),
('2025-05-16 09:22:00', 92.3, 5),
('2025-05-20 14:37:00', 90.1, 3),
('2025-05-23 21:40:00', 110.4, 12),
('2025-05-27 14:37:00', 87.8, 3);

INSERT INTO alerta (data_alerta, registro, fkComponente) VALUES
('2025-06-01 10:55:00', 94.1, 2),
('2025-06-03 14:37:00', 88.0, 3),
('2025-06-06 09:11:00', 100.6, 7),
('2025-06-10 14:37:00', 90.3, 3),
('2025-06-14 17:45:00', 105.9, 4),
('2025-06-17 14:37:00', 88.6, 3),
('2025-06-22 13:32:00', 97.3, 8),
('2025-06-24 14:37:00', 89.9, 3);

INSERT INTO alerta (data_alerta, registro, fkComponente) VALUES
('2025-07-02 09:20:00', 94.3, 6),
('2025-07-08 14:37:00', 89.0, 3),
('2025-07-11 19:40:00', 108.5, 12),
('2025-07-15 14:37:00', 87.9, 3),
('2025-07-18 08:50:00', 92.2, 2),
('2025-07-22 14:37:00', 90.4, 3),
('2025-07-26 17:12:00', 103.3, 4),
('2025-07-29 14:37:00', 89.2, 3);

INSERT INTO alerta (data_alerta, registro, fkComponente) VALUES
('2025-08-01 12:33:00', 93.3, 5),
('2025-08-05 14:37:00', 88.4, 3),
('2025-08-08 18:40:00', 101.9, 10),
('2025-08-12 14:37:00', 90.1, 3),
('2025-08-16 09:20:00', 92.6, 8),
('2025-08-19 14:37:00', 88.8, 3),
('2025-08-23 20:40:00', 109.7, 12),
('2025-08-26 14:37:00', 90.4, 3);

INSERT INTO alerta (data_alerta, registro, fkComponente) VALUES
('2025-09-02 14:37:00', 89.3, 3),
('2025-09-05 09:10:00', 94.6, 2),
('2025-09-09 14:37:00', 90.4, 3),
('2025-09-12 17:50:00', 105.2, 4),
('2025-09-16 14:37:00', 88.7, 3),
('2025-09-19 13:15:00', 97.1, 11),
('2025-09-23 14:37:00', 89.8, 3),
('2025-09-27 19:22:00', 108.9, 10);

INSERT INTO alerta (data_alerta, registro, fkComponente) VALUES
('2025-10-01 08:22:00', 92.3, 1),
('2025-10-07 14:37:00', 88.6, 3),
('2025-10-10 11:55:00', 96.8, 5),
('2025-10-14 14:37:00', 89.9, 3),
('2025-10-18 20:12:00', 106.6, 12),
('2025-10-21 14:37:00', 87.5, 3),
('2025-10-26 18:44:00', 103.9, 4),
('2025-10-28 14:37:00', 90.3, 3);

INSERT INTO alerta (data_alerta, registro, fkComponente) VALUES
('2025-11-01 09:33:00', 95.1, 6),
('2025-11-04 14:37:00', 88.3, 3),
('2025-11-08 16:21:00', 101.6, 10),
('2025-11-11 14:37:00', 90.1, 3),
('2025-11-15 07:42:00', 93.8, 2),
('2025-11-18 14:37:00', 89.0, 3),
('2025-11-22 22:31:00', 108.4, 12),
('2025-11-25 14:37:00', 88.2, 3);

INSERT INTO alerta (data_alerta, registro, fkComponente) VALUES
('2025-12-02 07:55:00', 89.1, 2),
('2025-12-02 09:33:00', 95.4, 6),
('2025-12-02 11:12:00', 102.0, 4),
('2025-12-02 14:37:00', 88.7, 3),
('2025-12-02 16:50:00', 91.8, 9),
('2025-12-02 19:22:00', 108.1, 12),
('2025-12-02 22:05:00', 93.6, 5),
('2025-12-02 07:55:00', 89.1, 3),
('2025-12-02 09:33:00', 95.4, 4),
('2025-12-02 11:12:00', 102.0, 8),
('2025-12-02 14:37:00', 88.7, 10),
('2025-12-02 16:50:00', 91.8, 11);