#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
    CREATE DATABASE users;
    \connect users;
	CREATE TABLE userData (
    	id        SERIAL PRIMARY KEY,
    	name        TEXT,
        role        TEXT,
		password	TEXT,
		team        TEXT
	);
	INSERT into userData (name, role, password, team) VALUES ('admin', 'admin', 'gAAAAABgd9ojoMgr2j0RoieIBVnXVoBzVN9Lylls8BAQdLrbi8IcW7DtqQY8Ta4aM5Y9BIbipyt5brg5jSzIrDd2GdO-fV-VZA==', 'admin');
EOSQL