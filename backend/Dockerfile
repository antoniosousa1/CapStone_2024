#uses ubuntu base image
FROM python:3.12.10-slim
#creates directory app and changes to that directory
WORKDIR /backend
#copies local "App" directory to /app inside docker container
COPY . .

EXPOSE 5005

RUN apt-get update && apt-get install -y libgl1-mesa-glx libglib2.0-0 libmagic1 curl

#installs the needed python dependencies for the application
RUN pip install --no-cache-dir -r requirements.txt

CMD [ "python3", "-u", "api_routes.py" ]