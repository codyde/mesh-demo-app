from threading import Thread
from psycopg2.extras import RealDictCursor
import psycopg2
from flask_cors import CORS
import datetime
import json
import os
import requests
from flask import Flask, jsonify, request
import eventlet
import jwt
from cryptography.fernet import Fernet
from authenticate import token_required
eventlet.monkey_patch()

try:
    with open('/vault/secrets/db', 'r') as file:
        connstring = file.read().replace('\n', '')
except:
    meshtype = os.environ.get('MESH_TYPE')
    meshns = os.environ.get('MESH_NS')
    sec = os.environ.get('fernet')
    SECRET_KEY = os.environ.get('secret_key')
    userstring = f"host={os.environ.get('POSTGRES_HOST')} \
                    port={os.environ.get('POSTGRES_PORT')} \
                    dbname=users user={os.environ.get('POSTGRES_USER')} \
                    password={os.environ.get('POSTGRES_PASSWORD')} sslmode=disable"

if meshtype == "kong-mesh":
    meshapi = f"http://kong-mesh-control-plane.{meshns}:5681/config"
elif meshtype == "kuma":
    meshapi = f"http://kuma-control-plane.{meshns}:5681/config"


app = Flask(__name__)
app.secret_key = os.environ.get('secret_key')

CORS(app)
thread = None

f = Fernet(sec.encode())


@app.route("/api/users/db", methods=["GET"])
def get_db_loc():
    try:
        conn = psycopg2.connect(userstring)
        r = requests.get(meshapi)
        data = r.json()
        if data['mode'] == 'remote':
            location = {
                'location': data['multizone']['remote']['zone'],
            }
        else:
            location = {
                'location': 'Core'
            }
        return jsonify(location)
    except:
        location = {
            'location': 'Disconnected',
            'exception': 'API Down'
        }
        return jsonify(location), 500


@app.route("/api/users", methods=["GET", "POST"])
def manage_users():
    if request.method == "GET":
        conn = psycopg2.connect(userstring)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        data = cur.execute(f'SELECT * FROM userData ORDER BY id DESC')
        test = cur.fetchall()
        return jsonify(test)
    elif request.method == "POST":
        req = request.get_json()
        _name = req['user']
        _role = req['role']
        _password = req['password'].encode()
        _encpass = f.encrypt(_password)
        _encdecode = _encpass.decode()
        _team = req['team']
        conn = psycopg2.connect(userstring)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        data = cur.execute(
            'INSERT INTO userData (name, role, password, team) VALUES (%s, %s, %s, %s)', (_name, _role, _encdecode, _team))
        conn.commit()
        user = {
            "name": _name,
            "role": _role,
            "team": _team,
            "pass": _encdecode,
            "status": "created",
            "code": 200
        }
        return jsonify(user)


@ app.route("/api/loginEndpoint", methods=["POST"])
def loginFunction():
    req = request.get_json()
    userName = req['username']
    passWord = req['password']
    conn = psycopg2.connect(userstring)
    cur = conn.cursor(cursor_factory=RealDictCursor)
    data = cur.execute(f"SELECT * FROM userData WHERE name='{userName}'")
    test = cur.fetchall()
    pwd = test[0]['password']
    clean = pwd.strip('"')
    enc_pwd = clean.encode()
    dec = f.decrypt(enc_pwd)
    fi = dec.decode()
    if passWord != fi:
        msg = {
            "message": "invalid login"
        }
        return jsonify(msg), 403
    else:
        timeLimit = datetime.datetime.utcnow() + datetime.timedelta(minutes=30)
        payload = {"user_id": userName, "exp": timeLimit}
        token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")
        return_data = {
            "error": "0",
            "message": "Successful",
            "jwtToken": token,
            "token": jwt.decode(token, SECRET_KEY, algorithms=["HS256"]),
            "Elapse_time": f"{timeLimit}"
        }
        return app.response_class(response=json.dumps(return_data), mimetype='application/json')


@app.route('/api/anEndpoint', methods=['POST'])
@token_required  # Verify token decorator
def aWebService():
    return_data = {
        "error": "0",
        "message": "You Are verified"
    }
    return app.response_class(response=json.dumps(return_data), mimetype='application/json')


@ app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers',
                         'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods',
                         'GET,PUT,POST,DELETE,OPTIONS')
    return response
