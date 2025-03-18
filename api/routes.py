from flask import Flask, request, jsonify
from llm_package.rag import Rag
from llm_package.document_management import DocumentManagement
from llm_package.milvus_db import VectorDatabase
from langchain_ollama import OllamaLLM, OllamaEmbeddings
from langchain_milvus import Milvus
from langchain.text_splitter import RecursiveCharacterTextSplitter
from dotenv import load_dotenv

import os

load_dotenv()

PORT = os.getenv("PORT")


# intinaiate flask app
app = Flask(__name__)

# Initialize the Ollama LLM and DeepSeek LLM and embeddings

rag = Rag()
vector_db = VectorDatabase()
doc_manager = DocumentManagement()

llama_model = "llama3.1:70b"
llm1 = OllamaLLM(model=llama_model)
llm1_embeddings = OllamaEmbeddings(model=llama_model)
db_path = "./data/database/Milvus_Lite.db"

if os.path.exists(db_path):
    print("db exists")
else:
    print("db does nto exist")

milvus_db = vector_db.create_db(llm_embeddings=llm1_embeddings, db_path=db_path)


# API endpoint to return llm response before rag
@app.route("/query", methods=["POST"])
def llm_response():
    data = request.json
    query = data.get("query")

    response = rag.get_llm_response(llm=llm1, prompt=query)

    return jsonify({"llm_response": response})


@app.route("/add", methods=["POST"])
def upload_file():
    if "file" not in request.files:
        return {"error": "No file part"}, 400

    file = request.files["file"]  # This retrieves the uploaded file
    file_path = f"./data/documents/{file.filename}"
    file.save(file_path)  # Save it to disk

    loaded_doc = doc_manager.load_doc(file_path=file_path)
    splits = doc_manager.split_docs(loaded_doc)
    vector_db.update_db(splits=splits, vector_db=milvus_db)

    return {"message": f"File {file.filename} uploaded successfully!"}, 200


@app.route("/list-files", methods=["GET"])
def list_files():
    files = os.listdir("./data/documents")
    return jsonify({"files": files})


# run app
app.run(host="0.0.0.0", port=PORT)
