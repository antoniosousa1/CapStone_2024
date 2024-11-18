FROM ubuntu:latest

WORKDIR /app

COPY . .

RUN apt update && apt install -y python3 python3-pip python3-venv libmagic1 libgl1 libglib2.0-0 curl

RUN python3 -m venv venv && venv/bin/pip install --upgrade pip && venv/bin/pip install -r requirements.txt