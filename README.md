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