#uses ubuntu base image
FROM python:3.12.3-slim
#creates directory app and changes to that directory
WORKDIR /backend
#copies local "App" directory to /app inside docker container
COPY . .

EXPOSE 5005
#installs the needed python dependencies for the application
RUN pip install --no-cache-dir -r requirements.txt