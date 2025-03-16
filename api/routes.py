from flask import Blueprint, request, jsonify
from llm_package.rag import Rag
from langchain_ollama import OllamaLLM

# Initialize the Ollama LLM and DeepSeek LLM and embeddings
deepseek_model = "llama3.1:70b"
llm1 = OllamaLLM(model=deepseek_model)
rag = Rag()

# Create a Blueprint for the API
api = Blueprint('api', __name__)

# API endpoint to double the given number
@api.route('/query', methods=['POST'])
def llm_response():
    data = request.json
    query = data.get("query")

    response = rag.get_llm_response(llm=llm1, prompt=query)
    
    return jsonify({"llm_response": response})
