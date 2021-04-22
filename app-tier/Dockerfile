FROM ubuntu:18.04

LABEL maintainer "Cody De Arkland <cdearkland@vmware.com>"
LABEL description "Python API tier running flask, gunicorn, and supervisord"

# Copy python requirements file
COPY requirements.txt /tmp/requirements.txt

RUN apt update -y &&  apt install -y \
    gcc \
    python3 \
    libffi-dev \
    python3-pip \
    python-pip \
    bash \
    libpq-dev \ 
    python3-dev \ 
    musl-dev \
    git && \
    pip3 install --upgrade pip setuptools && \
    pip3 uninstall jwt && \
    pip3 install -r /tmp/requirements.txt && \
    rm -r /root/.cache && \
    apt-get autoremove -y && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

RUN pip install git+https://github.com/Supervisor/supervisor@master

COPY ./app /app
COPY app.conf /usr/supervisord.conf

CMD ["/usr/local/bin/supervisord","--nodaemon","-c","/usr/supervisord.conf"]

