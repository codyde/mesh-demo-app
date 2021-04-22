FROM postgres:10.5

WORKDIR /

COPY create-db-data.sh /docker-entrypoint-initdb.d/init-db-data.sh
COPY create-user-data.sh /docker-entrypoint-initdb.d/init-user-data.sh


ENV POSTGRES_PASSWORD=postgres_password
