from flask import Flask, request, jsonify
from llm_package.rag import Rag
from llm_package.document_management import DocumentManagement
from llm_package.milvus_db import VectorDatabase
from langchain_ollama import OllamaLLM, OllamaEmbeddings
from dotenv import load_dotenv

import os

load_dotenv()

PORT = os.getenv("PORT")
DB_PATH = os.getenv("DB_PATH")

llama_model = "llama3.1:70b"
deepseek_model = "deepseek-r1:70b"

llm1 = OllamaLLM(model=deepseek_model)

llm2 = OllamaLLM(model=llama_model)

embeddings = OllamaEmbeddings(model=llama_model)


# intinaiate flask app
app = Flask(__name__)

# Initialize the Ollama LLM and DeepSeek LLM and embeddings

rag = Rag()
milvus_db = VectorDatabase(llm_embeddings=embeddings, db_path=DB_PATH)
doc_manager = DocumentManagement()


if os.path.exists(DB_PATH):
    print("db exists")
else:
    print("db does nto exist")


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


# run app
app.run(host="0.0.0.0", port=PORT)
