FROM mysql:latest

ENV MYSQL_ROOT_PASSWORD=sptech

COPY src/database/Script_VitalView.sql /docker-entrypoint-initdb.d/

EXPOSE 3306
