#uses ubuntu base image
FROM ubuntu:latest
#creates directory app and changes to that directory
WORKDIR /app
#copies local "App" directory to /app inside docker container
COPY . .
#OLLAMA_SERVER_URL set the local host ollama server address to the URL used in the application
ENV OLLAMA_SERVER_URL=http://host.docker.internal:11434
#installs the system dependencies needed for the application
RUN apt update && apt install -y python3 python3-pip libmagic1 libgl1 libglib2.0-0 curl
#installs the needed python dependencies for the application
RUN pip install --break-system-packages -r requirements.txt