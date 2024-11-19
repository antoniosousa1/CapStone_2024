#uses ubuntu base image
FROM ubuntu:latest
#creates directory app and changes to that directory
WORKDIR /app
#copies local "App" directory to /app inside docker container
COPY . .
#OLLAMA_SERVER_URL set the local host ollama server address to the URL used in the application
ENV OLLAMA_SERVER_URL=http://host.docker.internal:11434
#sets the default PATH to inside the virutal enviroment so during runtime venv/bin/<python commands> is not necessary
ENV PATH="/app/venv/bin:$PATH"
#installs the system dependencies needed for the application
RUN apt update && apt install -y python3 python3-pip python3-venv libmagic1 libgl1 libglib2.0-0 curl
#installs the needed python dependencies for the application
RUN python3 -m venv venv && venv/bin/pip install --upgrade pip && venv/bin/pip install -r requirements.txt