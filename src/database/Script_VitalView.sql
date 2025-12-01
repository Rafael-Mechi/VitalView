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
	(2, 1, 41.6),
	(3, 1, 85.0),
	(4, 1, 100.0),
	(1, 2, 83.5),
	(2, 2, 41.6),
	(3, 2, 85.0),
	(4, 2, 100.0),
	(1, 3, 83.5),
	(2, 3, 41.6),
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
('2024-11-04 09:05:00', 88.0, 1),
('2024-11-04 09:12:00', 89.1, 5),
('2024-11-04 09:22:00', 86.7, 9),

('2024-11-04 09:17:00', 45.0, 2),
('2024-11-04 09:26:00', 47.2, 6),
('2024-11-04 09:38:00', 43.8, 10),

('2024-11-04 09:42:00', 87.5, 3),
('2024-11-04 09:51:00', 89.0, 7),
('2024-11-04 10:05:00', 85.9, 11),

('2024-11-04 14:08:00', 89.1, 3),
('2024-11-04 14:17:00', 90.0, 7),
('2024-11-04 14:33:00', 87.8, 11),

('2024-11-05 09:26:00', 44.8, 2),
('2024-11-05 09:36:00', 46.1, 6),
('2024-11-05 09:49:00', 43.2, 10),

('2024-11-05 14:05:00', 88.3, 3),
('2024-11-05 14:16:00', 89.7, 7),
('2024-11-05 14:30:00', 86.9, 11),

('2024-12-02 09:04:00', 88.5, 1),
('2024-12-02 09:12:00', 89.6, 5),
('2024-12-02 09:25:00', 87.3, 9),

('2024-12-02 09:29:00', 44.7, 2),
('2024-12-02 09:37:00', 46.0, 6),
('2024-12-02 09:50:00', 43.5, 10),

('2024-12-02 14:11:00', 90.0, 1),
('2024-12-02 14:20:00', 91.2, 5),
('2024-12-02 14:33:00', 88.7, 9),

('2024-12-03 09:46:00', 42.3, 2),
('2024-12-03 09:55:00', 44.1, 6),
('2024-12-03 10:08:00', 41.9, 10),

('2024-12-03 10:15:00', 85.4, 3),
('2024-12-03 10:25:00', 86.7, 7),
('2024-12-03 10:38:00', 84.3, 11),

('2024-12-03 14:22:00', 88.3, 3),
('2024-12-03 14:32:00', 89.5, 7),
('2024-12-03 14:45:00', 87.0, 11),

('2024-12-04 09:05:00', 90.1, 1),
('2024-12-04 09:14:00', 91.3, 5),
('2024-12-04 09:27:00', 88.6, 9),

('2024-12-04 10:18:00', 47.2, 2),
('2024-12-04 10:26:00', 48.5, 6),
('2025-01-06 09:03:00', 87.0, 1),
('2025-01-06 09:11:00', 88.3, 5),
('2025-01-06 09:22:00', 85.8, 9),

('2025-01-06 09:41:00', 43.8, 2),
('2025-01-06 09:50:00', 45.2, 6),
('2025-01-06 10:03:00', 42.6, 10),

('2025-01-06 10:10:00', 86.5, 3),
('2025-01-06 10:20:00', 87.7, 7),
('2025-01-06 10:33:00', 85.1, 11),

('2025-01-14 15:18:00', 91.3, 1),
('2025-01-14 15:27:00', 92.4, 5),
('2025-02-03 09:02:00', 88.1, 1),
('2025-02-03 09:10:00', 89.5, 5),
('2025-02-03 09:22:00', 86.7, 9),

('2025-02-03 09:37:00', 43.3, 2),
('2025-02-03 09:46:00', 44.8, 6),
('2025-02-03 09:58:00', 42.1, 10),

('2025-02-03 10:11:00', 85.6, 3),
('2025-02-03 10:20:00', 86.8, 7),
('2025-02-03 10:33:00', 84.9, 11),

('2025-02-03 14:07:00', 89.9, 3),
('2025-02-03 14:17:00', 91.1, 7),
('2025-02-03 14:30:00', 88.5, 11),
('2025-03-03 09:04:00', 87.6, 1),
('2025-03-03 09:13:00', 88.9, 5),
('2025-03-03 09:25:00', 86.4, 9),

('2025-03-03 09:39:00', 44.1, 2),
('2025-03-03 09:48:00', 45.3, 6),
('2025-03-03 10:01:00', 42.7, 10),

('2025-03-03 10:05:00', 85.3, 3),
('2025-03-03 10:14:00', 86.5, 7),
('2025-03-03 10:27:00', 84.1, 11),

('2025-03-03 14:10:00', 88.9, 3),
('2025-03-03 14:20:00', 90.2, 7),
('2025-03-03 14:33:00', 87.6, 11),
('2025-04-02 09:03:00', 88.2, 1),
('2025-04-02 09:12:00', 89.5, 5),
('2025-04-02 09:25:00', 86.9, 9),

('2025-04-02 09:36:00', 43.6, 2),
('2025-04-02 09:45:00', 44.9, 6),
('2025-04-02 09:58:00', 42.3, 10),

('2025-04-02 10:04:00', 85.8, 3),
('2025-04-02 10:14:00', 87.0, 7),
('2025-04-02 10:27:00', 84.5, 11),

('2025-04-02 14:11:00', 89.2, 3),
('2025-04-02 14:20:00', 90.5, 7),
('2025-04-02 14:33:00', 87.8, 11),

('2025-04-03 09:14:00', 90.6, 1),
('2025-04-03 09:23:00', 91.9, 5),
('2025-04-03 09:36:00', 88.7, 9),
('2025-05-05 09:05:00', 88.4, 1),
('2025-05-05 09:14:00', 89.7, 5),
('2025-05-05 09:27:00', 86.8, 9),

('2025-05-05 09:37:00', 43.9, 2),
('2025-05-05 09:46:00', 45.2, 6),
('2025-05-05 09:59:00', 42.5, 10),

('2025-05-05 10:05:00', 85.2, 3),
('2025-05-05 10:14:00', 86.5, 7),
('2025-05-05 10:27:00', 84.1, 11),

('2025-05-05 14:09:00', 89.7, 3),
('2025-05-05 14:18:00', 90.9, 7),
('2025-05-05 14:31:00', 88.2, 11),

('2025-05-06 09:11:00', 90.5, 1),
('2025-05-06 09:20:00', 91.8, 5),
('2025-05-06 09:33:00', 88.9, 9),

('2025-05-06 10:26:00', 47.1, 2),
('2025-05-06 10:35:00', 48.4, 6),
('2025-05-06 10:48:00', 45.7, 10),

('2025-05-06 14:30:00', 88.6, 3),
('2025-05-06 14:39:00', 89.9, 7),
('2025-05-06 14:52:00', 87.1, 11),

('2025-05-13 15:22:00', 91.6, 1),
('2025-05-13 15:31:00', 92.9, 5),
('2025-05-13 15:44:00', 89.8, 9),
('2025-06-02 09:02:00', 87.9, 1),
('2025-06-02 09:11:00', 89.2, 5),
('2025-06-02 09:24:00', 86.5, 9),

('2025-06-04 14:06:00', 86.4, 3),
('2025-06-04 14:15:00', 87.7, 7),
('2025-06-04 14:28:00', 85.1, 11),

('2025-06-05 09:10:00', 88.6, 1),
('2025-06-05 09:19:00', 89.9, 5),
('2025-06-05 09:32:00', 86.8, 9),

('2025-06-05 14:12:00', 90.7, 1),
('2025-06-05 14:21:00', 91.9, 5),
('2025-06-05 14:34:00', 88.8, 9),

('2025-06-06 09:29:00', 45.2, 2),
('2025-06-06 09:38:00', 46.5, 6),
('2025-06-06 09:51:00', 43.7, 10),

('2025-06-09 10:13:00', 87.3, 3),
('2025-06-09 10:22:00', 88.6, 7),
('2025-06-09 10:35:00', 85.9, 11),

('2025-06-10 15:16:00', 91.1, 1),
('2025-06-10 15:25:00', 92.4, 5),
('2025-06-10 15:38:00', 89.7, 9),
('2025-07-02 09:04:00', 88.3, 1),
('2025-07-02 09:13:00', 89.6, 5),
('2025-07-02 09:26:00', 86.9, 9),

('2025-07-02 09:38:00', 43.7, 2),
('2025-07-02 09:47:00', 45.0, 6),
('2025-07-02 10:00:00', 42.3, 10),

('2025-07-02 10:06:00', 85.9, 3),
('2025-07-02 10:15:00', 87.2, 7),
('2025-07-02 10:28:00', 84.5, 11),

('2025-07-02 14:09:00', 89.5, 3),
('2025-08-04 09:03:00', 88.7, 1),
('2025-08-04 09:12:00', 90.0, 5),
('2025-08-04 09:25:00', 87.3, 9),

('2025-08-04 09:35:00', 43.2, 2),
('2025-08-04 09:44:00', 44.5, 6),
('2025-08-04 09:57:00', 41.8, 10),

('2025-08-04 10:02:00', 85.4, 3),
('2025-08-04 10:11:00', 86.7, 7),
('2025-08-04 10:24:00', 84.1, 11),

('2025-08-04 14:08:00', 89.3, 3),
('2025-08-04 14:17:00', 90.6, 7),
('2025-08-04 14:30:00', 87.9, 11),

('2025-08-05 09:13:00', 90.8, 1),
('2025-08-05 09:22:00', 92.1, 5),
('2025-08-05 09:35:00', 89.4, 9),

('2025-08-05 10:24:00', 47.6, 2),
('2025-08-05 10:33:00', 48.9, 6),
('2025-08-05 10:46:00', 46.1, 10),

('2025-08-05 14:29:00', 88.2, 3),
('2025-08-05 14:38:00', 89.5, 7),
('2025-08-05 14:51:00', 86.7, 11),
('2025-09-01 09:04:00', 87.8, 1),
('2025-09-01 09:13:00', 89.1, 5),
('2025-09-01 09:26:00', 86.4, 9),

('2025-09-01 09:36:00', 43.0, 2),
('2025-09-01 09:45:00', 44.3, 6),
('2025-09-01 09:58:00', 41.7, 10),

('2025-09-04 14:15:00', 90.2, 1),
('2025-09-04 14:24:00', 91.5, 5),
('2025-09-04 14:37:00', 88.6, 9),

('2025-09-05 09:27:00', 45.8, 2),
('2025-09-05 09:36:00', 47.1, 6),
('2025-09-05 09:49:00', 44.3, 10),

('2025-09-08 10:11:00', 87.9, 3),
('2025-09-08 10:20:00', 89.2, 7),
('2025-09-08 10:33:00', 86.5, 11),

('2025-09-09 15:23:00', 91.7, 1),
('2025-09-09 15:32:00', 92.9, 5),
('2025-09-09 15:45:00', 90.0, 9),
('2025-10-01 09:03:00', 88.6, 1),
('2025-10-01 09:12:00', 89.9, 5),
('2025-10-01 09:25:00', 86.8, 9),

('2025-10-01 09:34:00', 43.4, 2),
('2025-10-01 09:43:00', 44.7, 6),
('2025-10-01 09:56:00', 41.9, 10),

('2025-10-01 10:04:00', 85.6, 3),
('2025-10-01 10:13:00', 86.9, 7),
('2025-10-01 10:26:00', 84.2, 11),

('2025-10-01 14:10:00', 89.6, 3),
('2025-10-01 14:19:00', 90.9, 7),
('2025-10-01 14:32:00', 88.3, 11),

('2025-10-02 09:14:00', 90.7, 1),
('2025-10-02 09:23:00', 91.9, 5),
('2025-10-02 09:36:00', 89.0, 9),

('2025-10-02 10:22:00', 47.3, 2),
('2025-10-02 10:31:00', 48.6, 6),
('2025-10-02 10:44:00', 45.8, 10),

('2025-10-02 14:29:00', 88.9, 3),
('2025-10-02 14:38:00', 90.2, 7),
('2025-10-02 14:51:00', 87.5, 11),
('2025-11-01 09:05:00', 88.7, 1),
('2025-11-01 09:12:00', 89.9, 5),
('2025-11-01 09:25:00', 86.8, 9),

('2025-11-01 09:34:00', 43.5, 2),
('2025-11-01 09:43:00', 44.8, 6),
('2025-11-01 09:56:00', 41.9, 10),

('2025-11-01 10:04:00', 85.7, 3),
('2025-11-01 10:13:00', 86.9, 7),
('2025-11-01 10:26:00', 84.2, 11),

('2025-11-02 09:14:00', 90.1, 1),
('2025-11-02 09:23:00', 91.4, 5),
('2025-11-02 09:36:00', 88.5, 9),

('2025-11-02 10:22:00', 47.1, 2),
('2025-11-02 10:31:00', 48.3, 6),
('2025-11-02 10:44:00', 45.7, 10),

('2025-11-02 14:29:00', 88.9, 3),
('2025-11-02 14:38:00', 90.2, 7),
('2025-11-02 14:51:00', 87.5, 11),

('2025-11-03 09:05:00', 84.5, 1),
('2025-11-03 09:14:00', 85.8, 5),
('2025-11-03 09:27:00', 82.9, 9),

('2025-11-03 09:36:00', 42.3, 2),
('2025-11-03 09:45:00', 43.7, 6),
('2025-11-03 09:58:00', 41.2, 10),

('2025-11-03 10:04:00', 85.9, 3),
('2025-11-03 10:13:00', 87.1, 7),
('2025-11-03 10:26:00', 84.5, 11),
('2025-11-30 00:00:00', 82.6, 2),
('2025-11-30 00:00:00', 82.6, 6),
('2025-11-30 00:00:00', 82.6, 10);

INSERT INTO alerta (data_alerta, registro, fkComponente) VALUES
('2025-12-01 00:10:00', 91.4, 4),
('2025-12-01 00:21:00', 91.4, 5),
('2025-12-01 00:21:00', 91.4, 6),
('2025-12-01 00:06:00', 91.4, 4),
('2025-12-01 00:07:00', 91.4, 5),
('2025-12-01 00:06:30', 91.4, 6),
('2025-12-01 00:06:20', 91.4, 4),
('2025-12-01 00:08:00', 91.4, 5),
('2025-12-01 00:06:00', 91.4, 6);