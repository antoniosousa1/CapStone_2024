'''
File: vector_db.py
Authors: Antonio Sousa Jr(Team Lead), Matthew Greeson, Goncalo Felix, Antonio Morais, Dylan Ricci, Ryan Medeiros
Affiliation: University of Massachusetts Dartmouth
Course: CIS 498 & 499 (Senior Capstone Project)
Ownership: Rite-Solutions, Inc. 
Client/Stakeholder: Brandon Carvhalo  
Date: 2025-4-25
        
vector_db.py description and purpose: 
    -
'''

# BEGINNING OF CODE !!!
import os, time

from langchain_ollama import OllamaLLM, OllamaEmbeddings
from langchain_community.document_loaders import DirectoryLoader, TextLoader, CSVLoader, UnstructuredPDFLoader, UnstructuredWordDocumentLoader, UnstructuredPowerPointLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain.schema import Document
from langchain_milvus import Milvus # type: ignore
from langchain.vectorstores.base import VectorStoreRetriever


# Function to create a Milvus vector database with Llama embeddings
def create_milvus_db(splits: list[Document], llama_embeddings: OllamaEmbeddings, db_path: str) -> Milvus:

    # If no documents are provided, return the database without adding any texts
    if not splits:
        print("No documents to add. Returning an empty database!")
        print("-"*80)
        vector_db = Milvus(
            embedding_function=llama_embeddings,
            connection_args={"uri": db_path},
            collection_name="DataCollection",
        )
        return vector_db
    
    # Extract page content from documents for embedding
    text_splits = [doc.page_content for doc in splits]

    # Initialize Milvus vector database
    vector_db = Milvus(
        embedding_function=llama_embeddings,
        connection_args={"uri": db_path},
        collection_name="DataCollection",
    )
   
    # Generate unique IDs for each document in the database
    ids = [str(i) for i in range(len(text_splits))]

    # Add the texts (documents) to the Milvus database
    vector_db.add_texts(texts=text_splits, ids=ids)

    # Return the initialized vector database
    return vector_db

# Function to add new documents to an existing Milvus database
def add_to_milvus_db(splits: list[Document], vector_db) -> Milvus:
    # Extract page content from documents for embedding
    text_splits = [doc.page_content for doc in splits]

    # Generate unique IDs for each document
    ids = [str(i) for i in range(len(text_splits))]
   
    # Add the new texts (documents) to the Milvus database
    vector_db.add_texts(texts=text_splits, ids=ids)

    # Return the updated vector database
    return vector_db

# Function to load an existing Milvus database
def load_milvus_db(llama_embeddings: OllamaEmbeddings, db_path: str) -> Milvus:
    # Initialize and load the vector database from the specified path
    vector_store_loaded = Milvus(
        llama_embeddings,
        connection_args={"uri": db_path},
        collection_name="DataCollection",
    )
    
    # Return the loaded vector database
    return vector_store_loaded

# Function to load new documents from the specified directory and return them as a list
def load_new_docs(new_files: set, data_path: str) -> list[Document]:
    # Initialize an empty list to store newly loaded documents
    new_loaded_docs = []

    # Iterate through the provided set of new files
    for file_name in new_files:
        # Build the full file path
        file_path = os.path.join(data_path, file_name)
        
        # Ensure the file exists
        if os.path.isfile(file_path):
            try:
                # Load documents based on file type (TXT, DOCX, PDF, PPTX, CSV)
                if file_path.endswith(".txt"):
                    loader = TextLoader(file_path, encoding="utf-8")
                    docs = loader.load()
                    new_loaded_docs.extend(docs)
                    print(f"Loaded TXT file: {file_path}")
                
                elif file_path.endswith(".docx"):
                    loader = UnstructuredWordDocumentLoader(file_path)
                    docs = loader.load()
                    new_loaded_docs.extend(docs)
                    print(f"Loaded DOCX file: {file_path}")
                
                elif file_path.endswith(".pdf"):
                    loader = UnstructuredPDFLoader(file_path)
                    docs = loader.load()
                    new_loaded_docs.extend(docs)
                    print(f"Loaded PDF file: {file_path}")
                
                elif file_path.endswith(".pptx"):
                    loader = UnstructuredPowerPointLoader(file_path)
                    docs = loader.load()
                    new_loaded_docs.extend(docs)
                    print(f"Loaded PPTX file: {file_path}")
                
                elif file_path.endswith(".csv"):
                    loader = CSVLoader(file_path)
                    docs = loader.load()
                    new_loaded_docs.extend(docs)
                    print(f"Loaded CSV file: {file_path}")

                else:
                    # Handle unsupported file types
                    print(f"Unsupported file type: {file_path}")
            except Exception as e:
                # Handle errors during loading
                print(f"Error loading {file_path}: {e}")
        else:
            # Handle case where file doesn't exist
            print(f"File not found: {file_path}")
    
    # Return the list of loaded documents
    return new_loaded_docs

# Function to load all documents from a given directory path
def load_docs(data_path: str) -> list[Document]:
    # Initialize a loader for the directory and load documents
    loader = DirectoryLoader(path=data_path)
    docs = loader.load()

    # Return the loaded documents
    return docs

# Function to check if a Milvus database exists at a given path and delete it
def delete_milvus_db(db_path: str):
    # Check if the database exists and remove it
    if os.path.exists(db_path):
        os.remove(db_path)
        print("-" * 80)
        print("delete_milvus_db: PASSED")
        time.sleep(2)