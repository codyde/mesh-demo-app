from celery import Celery
from threading import Thread
from flask_socketio import SocketIO, emit
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
    redishost = os.environ.get('REDIS_HOST')
    redisport = os.environ.get('REDIS_PORT')
    pghost = os.environ.get('POSTGRES_HOST')
    pguser = os.environ.get('POSTGRES_USER')
    pgpass = os.environ.get('POSTGRES_PASSWORD')
    pgport = os.environ.get('POSTGRES_PORT')
    pgdb = os.environ.get('POSTGRES_DATABASE')
    meshtype = os.environ.get('MESH-TYPE')
    meshns = os.environ.get('MESH-NS')
    sec = os.environ.get('fernet')
    SECRET_KEY = os.environ.get('secret_key')
    connstring = f"host={pghost} port={pgport} dbname={pgdb} user={pguser} password={pgpass} sslmode=disable"
    userstring = f"host={pghost} port={pgport} dbname=users user={pguser} password={pgpass} sslmode=disable"

app = Flask(__name__)
app.secret_key = SECRET_KEY
socketio = SocketIO(app, cors_allowed_origins='*',
                    logger=True, engineio_logger=True)

CORS(app)
thread = None

f = Fernet(sec.encode())


def make_celery(app):
    celery = Celery(
        app.import_name,
        backend=app.config['CELERY_RESULT_BACKEND'],
        broker=app.config['CELERY_BROKER_URL']
    )
    celery.conf.update(app.config)

    class ContextTask(celery.Task):
        def __call__(self, *args, **kwargs):
            with app.app_context():
                return self.run(*args, **kwargs)

    celery.Task = ContextTask
    return celery


app.config.update(
    CELERY_BROKER_URL=f'redis://{redishost}:{redisport}',
    CELERY_RESULT_BACKEND=f'redis://{redishost}:{redisport}'
)
celery = make_celery(app)


@celery.task()
def post_data(req):
    """Background task using celery - async"""
    _title = req['title']
    _text = req['text']
    conn = None
    try:
        conn = psycopg2.connect(connstring)
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO textData (title, text) VALUES (%s, %s)", (_title, _text))
        conn.commit()
        print("Data push happening now")
        cur = conn.cursor(cursor_factory=RealDictCursor)
        data = cur.execute('SELECT * FROM textData ORDER BY id DESC')
        test = cur.fetchall()
        moredata = jsonify(test)
        # print(test)
    except psycopg2.DatabaseError as e:
        print(f'Error {e}')
    finally:
        if conn:
            conn.close()
    return


@app.route("/api/posts", methods=["GET", "POST", "DELETE"])
def manage_post():
    if request.method == "GET":
        conn = psycopg2.connect(connstring)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        data = cur.execute('SELECT * FROM textData ORDER BY id DESC')
        test = cur.fetchall()
        return jsonify(test)
    elif request.method == "POST":
        req = request.get_json()
        result = post_data.delay(req)
        print(result)
        response = {
            'status': 'data sent',
            'status_code': 200
        }
        conn = psycopg2.connect(connstring)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        data = cur.execute('SELECT * FROM textData ORDER BY id DESC')
        out = cur.fetchall()
        socketio.emit('my event', out)
        return jsonify(response)
    elif request.method == "DELETE":
        conn = psycopg2.connect(connstring)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        data = cur.execute('DELETE FROM textData')
        conn.commit()
        response = {
            'status': 'ok',
            'status_code': 200
        }
        conn = psycopg2.connect(connstring)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        data = cur.execute('SELECT * FROM textData ORDER BY id DESC')
        out = cur.fetchall()
        socketio.emit('my event', out)
        return jsonify(response)


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


@ app.route("/api/health", methods=["GET"])
def get_health():
    if meshtype == "kong-mesh":
        r = requests.get(f"http://kong-mesh-control-plane.{meshns}:5681")
        data = r.json()
        stats = {
            'version': '15',
            'api-status': 'healthy',
            'product': data['tagline'],
            'mesh-version': data['version']
        }
    elif meshtype == "kuma":
        r = requests.get(f"http://kuma-control-plane.{meshns}:5681")
        data = r.json()
        stats = {
            'version': '15',
            'api-status': 'healthy',
            'product': data['tagline'],
            'mesh-version': data['version']
        }
    else:
        {
            'version': '15',
            'api-status': 'healthy',
        }

    socketio.emit('health event', stats)
    return jsonify(stats)


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


@ socketio.on('health event')
def handle_health(stats):
    print('received')
    return jsonify(stats)


@ socketio.on('my event')
def handle_event(data):
    print('received')
    return jsonify(data)


@ socketio.on('connected')
def handle_connect():
    while True:
        socketio.sleep(3)
        print('connected')


@ app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers',
                         'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods',
                         'GET,PUT,POST,DELETE,OPTIONS')
    return response
