from llm_package.rag import Rag
from llm_package.document_management import DocumentManagement
from llm_package import collection_manger

from langchain_ollama import OllamaLLM, OllamaEmbeddings

from flask import Flask, request, jsonify
from flask_cors import CORS

from dotenv import load_dotenv
import os


load_dotenv()
PORT = os.getenv("PORT")
USER_ID = os.getenv("USER_ID")

llama_model = "llama3.1:70b"
phi4_model = "phi4:latest"

llm1 = OllamaLLM(model=llama_model)
llm2 = OllamaLLM(model=phi4_model)
embeddings = OllamaEmbeddings(model=llama_model)


# intinaiate flask app
app = Flask(__name__)
CORS(app)  # Enables CORS for all routes

# Initialize the Ollama LLM and DeepSeek LLM and embeddings

rag = Rag()
doc_manager = DocumentManagement()

# API endpoint to return llm response before rag
@app.route("/query", methods=["POST"])
def llm_response():
    data = request.json
    query = data.get("query")

    # retrive docs
    retrieved_docs = rag.retrieve_docs(query=query, vector_store=collection_manger.get_milvus_connection())
    # create prompt
    prompt = rag.create_prompt(retrieved_docs=retrieved_docs, query=query)
    # gets response
    response = rag.get_llm_response(llm=llm1, prompt=prompt)
    print(f"Reponse: {response}")

    refined_prompt = rag.refine_prompt(retrieved_docs=retrieved_docs, llm1_context=response, question=query)
    refined_response = rag.get_llm_response(llm=llm2, prompt=refined_prompt)
    print(f"Refined Reponse: {refined_response}")
    # saves previous answers
    rag.previous_questions.append(query)
    rag.previous_answers.append(refined_response)

    return jsonify({"llm_response": refined_response})


@app.route("/add", methods=["POST"])
def upload_file():
    if "files" not in request.files:
        return {"error": "No files part"}, 400

    files = request.files.getlist("files")  # This retrieves the uploaded file

    loaded_docs = doc_manager.load_docs(files)

    splits = doc_manager.split_docs(loaded_docs)
    
    collection_manger.add_docs_to_collection(splits=splits)

    return {"message": f"Files uploaded successfully!"}, 200


@app.route("/list-files", methods=["GET"])
def list_files():
    
    files = collection_manger.list_entries_in_collection()
    
    return jsonify({"files": files})


@app.route("/clear-db-content", methods=["DELETE"])
def clear_db():
    
    try:
        collection_manger.drop_collection()
        return jsonify({"status": "success", 
                        "message": "Database collection cleared."}), 200

    except Exception as e:
        app.logger.error(f"Error clearing database: {str(e)}")
        return jsonify({"status": "failure", 
                        "message": "Internal server error"}), 500
    
@app.route("/delete-entries", methods=["DELETE"])
def delete_entries():

    data = request.json
    
    try:
        collection_manger.remove_docs_from_collection(data["ids"])
        return jsonify({"status": "success", 
                        "message": "doc entry removed."}), 200

    except Exception as e:
        app.logger.error(f"Error clearing entry: {str(e)}")
        return jsonify({"status": "failure", 
                        "message": "Internal server error"}), 500

# run app
app.run(host="0.0.0.0", port=PORT)
