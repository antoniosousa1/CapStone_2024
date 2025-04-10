"""
Authors: Antonio Sousa Jr(Team Lead), Matthew Greeson, Goncalo Felix, Antonio Morais, Dylan Ricci, Ryan Medeiros
Affiliation: University of Massachusetts Dartmouth
Course: CIS 498 & 499 (Senior Capstone Project)
Ownership: Rite-Solutions, Inc.
Client/Stakeholder: Brandon Carvhalo
"""

from llm_package import rag
from llm_package import document_management
from llm_package import collection_manger

from flask import Flask, request, jsonify
from flask_cors import CORS

from dotenv import load_dotenv
import os

# Initialize ENV variables
load_dotenv()
PORT = os.getenv("PORT")
USER_ID = os.getenv("USER_ID")


# Initialize flask app
app = Flask(__name__)
CORS(app)


# API endpoint to return Rag response
@app.route("/query", methods=["POST"])
def llm_response():
    data = request.json
    query = data.get("query")

    rag_response = rag.full_rag_response(query)

    return jsonify({"llm_response": rag_response})

# API endpoint that adds documents to vector db collection
@app.route("/add", methods=["POST"])
def upload_file():
    if "files" not in request.files:
        return {"error": "No files part"}, 400

    files = request.files.getlist("files")

    existing_entries = collection_manger.list_docs_in_collection()
    existing_doc_ids = {entry["doc_id"]: entry["filename"] for entry in existing_entries}

    new_files = []
    skipped = {}

    for file in files:
        file_hash = document_management.get_file_hash(file)
        if file_hash in existing_doc_ids:
            skipped[file.filename] = existing_doc_ids[file_hash]  # uploaded -> existing
        else:
            new_files.append(file)

    if not new_files:
        return {
            "uploaded": [],
            "skipped": skipped
        }, 200

    loaded_docs = document_management.load_docs(new_files)
    splits = document_management.split_docs(loaded_docs)
    collection_manger.add_docs_to_collection(splits=splits)

    return {
        "uploaded": [file.filename for file in new_files],
        "skipped": skipped
    }, 200

# API endpoint that lists the documents in the vector db collection
@app.route("/list-files", methods=["GET"])
def list_files():
    
    files = collection_manger.list_docs_in_collection()
    
    return jsonify({"files": files})

# API endpoint that drops the vector db collection
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


# API endpoint that deletes certain entries in the vector db collection
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
