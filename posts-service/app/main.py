from celery import Celery
from threading import Thread
from flask_socketio import SocketIO, emit
from psycopg2.extras import RealDictCursor
import psycopg2
from flask_cors import CORS
import datetime
import json
import redis
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
    meshtype = os.environ.get('MESH_TYPE')
    meshns = os.environ.get('MESH_NS')
    SECRET_KEY = os.environ.get('secret_key')
    connstring = f"host={pghost} port={pgport} dbname={pgdb} user={pguser} password={pgpass} sslmode=disable"

if meshtype == "kong-mesh":
    meshapi = f"http://kong-mesh-control-plane.{meshns}:5681/config"
elif meshtype == "kuma":
    meshapi = f"http://kuma-control-plane.{meshns}:5681/config"

app = Flask(__name__)
app.secret_key = SECRET_KEY
socketio = SocketIO(app, cors_allowed_origins='*',
                    logger=True, engineio_logger=True)

CORS(app)
thread = None


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


@app.route("/api/posts/redis", methods=["GET"])
def get_redis():
    try:
        r = redis.Redis(redishost, redisport, socket_connect_timeout=1)
        a = requests.get(meshapi)
        data = a.json()
        r.ping()
        if data['mode'] == 'remote':
            location = data['multizone']['remote']['zone']
        else:
            location: 'Core'
        rhealth = {
            "host": redishost,
            "health": "up",
            "location": location
        }
        return jsonify(rhealth)
    except:
        rhealth = {
            "host": redishost,
            "health": "down",
            "location": "disconnected"
        }
        return jsonify(rhealth)


@ app.route("/api/posts/db", methods=["GET"])
def get_api_loc():
    try:
        conn = psycopg2.connect(connstring)
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
        return jsonify(location)


@ app.route("/api/posts", methods=["GET", "POST", "DELETE"])
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
