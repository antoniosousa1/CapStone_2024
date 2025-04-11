"""
Authors: Antonio Sousa Jr(Team Lead), Matthew Greeson, Goncalo Felix, Antonio Morais, Dylan Ricci, Ryan Medeiros
Affiliation: University of Massachusetts Dartmouth
Course: CIS 498 & 499 (Senior Capstone Project)
Ownership: Rite-Solutions, Inc.
Client/Stakeholder: Brandon Carvhalo
"""

from llm_package import rag
from llm_package import collection_manger

from flask import Flask, request, jsonify
from flask_cors import CORS

from dotenv import load_dotenv
import os


# Initialize ENV variables
load_dotenv()
PORT = os.getenv("PORT")
USER_ID = os.getenv("USER_ID")
OLLAMA_SERVER_URL = os.getenv("OLLAMA_SERVER_URL")



# Initialize flask app
app = Flask(__name__)
CORS(app)


# API endpoint to return Rag response
@app.route("/query", methods=["POST"])
def llm_response():

    try:
        data = request.json
        query = data.get("query")
        rag_response = rag.full_rag_response(query)

        return jsonify({"llm_response": rag_response})

    except Exception as e:
        print(f"Error getting llm response: {e}")
        return jsonify({"error": "An unexpected error occurred while processing your request."}), 500


# API endpoint that adds documents to vector db collection
@app.route("/add", methods=["POST"])
def upload_file():

    try:
        # Get list of files
        files = request.files.getlist("files")
        # Call the function that handles the file processing and collection update
        result = collection_manger.add_docs_to_collection(files)
        print(f"result: {result}")
        # Return the result from the function
        return jsonify(result), 200

    except Exception as e:
        print(f"Failed to add documents: {e}")
        return jsonify({"error": "Failed to add documents"}), 500


# API endpoint that lists the documents in the vector db collection
@app.route("/list-files", methods=["GET"])
def list_files():

    try:
        files = collection_manger.list_docs_in_collection()
        return jsonify({"files": files}), 200

    except Exception as e:
        print(f"Error listing files: {e}")
        return jsonify({"error": "Failed to list files."}), 500


# API endpoint that drops the vector db collection
@app.route("/clear-db-content", methods=["DELETE"])
def clear_db():

    try:
        collection_manger.drop_collection()
        return jsonify({"status": "success", "message": "Database collection cleared."}), 200

    except Exception as e:
        print(f"Error dropping collection: {e}")
        return jsonify({"status": "failure", "message": "Internal server error"}), 500


# API endpoint that deletes certain entries in the vector db collection
@app.route("/delete-entries", methods=["DELETE"])
def delete_entries():

    data = request.json

    try:
        collection_manger.remove_docs_from_collection(data["ids"])
        return jsonify({"status": "success", "message": "doc entry removed."}), 200

    except Exception as e:
        print(f"Error clearing entry: {e}")
        return jsonify({"status": "failure", "message": "Internal server error"}), 500


# run app
app.run(host="0.0.0.0", port=PORT)
