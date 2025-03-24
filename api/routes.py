from flask import Flask, request, jsonify
from llm_package.rag import Rag
from llm_package.document_management import DocumentManagement
from llm_package.milvus_db import VectorDatabase
from langchain_ollama import OllamaLLM, OllamaEmbeddings
from langchain_milvus import Milvus
from langchain.text_splitter import RecursiveCharacterTextSplitter
from pymilvus import connections, Collection, utility
import os
from dotenv import load_dotenv

import os
import shutil

load_dotenv()

PORT = os.getenv("PORT")
DB_PATH = os.getenv("DB_PATH")

llama_model = "llama3.1:70b"
llm1 = OllamaLLM(model=llama_model)
llm1_embeddings = OllamaEmbeddings(model=llama_model)


# intinaiate flask app
app = Flask(__name__)

# Initialize the Ollama LLM and DeepSeek LLM and embeddings

rag = Rag()
milvus_db = VectorDatabase(llm_embeddings=llm1_embeddings, db_path=DB_PATH)
doc_manager = DocumentManagement()


if os.path.exists(DB_PATH):
    print("db exists")
else:
    print("db does not exist")


# API endpoint to return llm response before rag
@app.route("/query", methods=["POST"])
def llm_response():
    data = request.json
    query = data.get("query")

    # creates retriver for context
    retriever = rag.create_retriever(milvus_db.vector_db)
    # retrive docs
    retrieved_docs = rag.retrieve_docs(retriever, query)
    # create prompt
    prompt = rag.create_prompt(retrieved_docs=retrieved_docs, query=query)

    response = rag.get_llm_response(llm=llm1, prompt=prompt)

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
    milvus_db.update_db(splits=splits)

    return {"message": f"File {file.filename} uploaded successfully!"}, 200


@app.route("/list-files", methods=["GET"])
def list_files():
    files = os.listdir("./data/documents")
    return jsonify({"files": files})


@app.route("/clear-db-content", methods=["DELETE"])
def clear_db():
    global empty_collection
    try:
        # Purge the database or clear collection 
        milvus_db.purge_collection() 
        shutil.rmtree(os.getenv("DOCUMENTS_PATH"))

        # Rebuild the folder after it is deleted by shutil
        os.makedirs(os.getenv("DOCUMENTS_PATH"), exist_ok=True)  # Create the folder again if needed
        empty_collection = False

        return jsonify({"status": "success", "message": "Database collection cleared."}), 200
    except Exception as e:
        # Log the error and return a 500 response
        app.logger.error(f"Error clearing database: {str(e)}")
        return jsonify({"status": "failure", "message": "Internal server error"}), 500
    

@app.route("/check_condition", methods=["GET"])
def check_collection():
    """Check if the collection exists and has data."""

    connections.connect(alias="default", uri=os.getenv("DB_PATH"))
    collection_name = "DataCollection"

    if not utility.has_collection(collection_name):
        return jsonify({"exists": False, "has_data": False})

    collection = Collection(collection_name)
    collection.load()  # Ensure the collection is loaded before querying

    return jsonify({"exists": True, "has_data": collection.num_entities > 0})
# run app
app.run(host="0.0.0.0", port=PORT)
