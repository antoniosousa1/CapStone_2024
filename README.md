# CapStone_2024

This is the repo for our senior capstone, Generating Content using LLMs

# LangChain Documentation

https://python.langchain.com/docs/tutorials/rag/

# Ollama set up

1. Visit https://ollama.com/download and install Ollama for your given OS
2. Once Ollama is install and running, run "ollama pull llama3.1:8b" or "ollama pull llama3.1:70b" this will pull down the given model
3. Run "ollama list" to see the installed models

# Docker set up

1. Install docker https://docs.docker.com/engine/install/ and login/create account
2. Cd into "App" directory
3. Run the following command to build the image "docker build -t ollama-app ."
4. After image is created run the following command "docker run -it ollama-app"
5. You are now in the docker container control+d to exit
6. If you wish to mount your local directory so that local code changes are reflected
   in the container to make your work flow easier run "docker run -v .:/app -it ollama-app"
   in the "App" local directory
7. If you have any docker quesetions view the docs here https://docs.docker.com/

# RAGAS Evaluation Documentation

1. Home Docs -> https://docs.ragas.io/en/latest/
2. Metric Docs -> https://docs.ragas.io/en/latest/concepts/metrics/available_metrics/?h=metrics

# Running Program Concurrently

1. Use the run_script.sh script to run the front and backends at the same time
   note this runs the backend script in hte background, on close the port will not die
   if anyone makes changes to the backend you must restart the port for them to show up
   also when you are done working please kill the port or change hte run port. If everyoens program
   is running on port 5001 it will make it hard to work

# Flask

# Running Frontend and Backend serperatly

1. Split terminal to get two bash terminals
2. from the ~/fronted directory run the following command for the frontend terminal

- npm run dev 

3. from the ~/Capstone directory run the following command for the backend terminal

- python3 backend/api_routes.py

4. Go to http://localhost:8501 this will be the frontend of the application

1. ~/Capstone/backend/api_routes.py will be our backend code file, this is where the api end points will be
2. This flask app will be listening to requests from the frontend to run the given api endpoint

# Milvus Server set up

https://milvus.io/docs/install_standalone-docker.md