from flask import Flask, request, jsonify
from llm_package.rag import Rag
from langchain_ollama import OllamaLLM

# Initialize the Ollama LLM and DeepSeek LLM and embeddings
deepseek_model = "llama3.1:70b"
llm1 = OllamaLLM(model=deepseek_model)
rag = Rag()

# intinaiate flask app
app = Flask(__name__)

# API endpoint to return llm response before rag
@app.route('/query', methods=['POST'])
def llm_response():
    data = request.json
    query = data.get("query")

    response = rag.get_llm_response(llm=llm1, prompt=query)
    
    return jsonify({"llm_response": response})

#run app
app.run(host="0.0.0.0", port=5001)