'''
File: vector_db.py
Authors: Antonio Sousa Jr(Team Lead), Matthew Greeson, Goncalo Felix, Antonio Morais, Dylan Ricci, Ryan Medeiros
Affiliation: University of Massachusetts Dartmouth
Course: CIS 498 & 499 (Senior Capstone Project)
Ownership: Rite-Solutions, Inc. 
Client/Stakeholder: Brandon Carvhalo  
Date: 2025-4-25
        
vector_db.py description and purpose: 
    - This python file allows the vector database to handle any CRUD operations, it is called by the main python file llm.py which then calls the specific functions 
      as needed. More details to follow for the description! :) 
'''

# Import necessary libraries for file handling and time management
import os, time

# Importing classes for working with Llama embeddings, document loaders, and Milvus database from LangChain
from langchain_ollama import OllamaEmbeddings
from langchain_community.document_loaders import (
    DirectoryLoader, TextLoader, CSVLoader, UnstructuredPDFLoader,
    UnstructuredWordDocumentLoader, UnstructuredPowerPointLoader
)
from langchain.schema import Document
from langchain_milvus import Milvus  # type: ignore
from langchain.vectorstores.base import VectorStoreRetriever

class VectorDatabase():
    
    # Function to create a Milvus vector database with Llama embeddings
    def create_milvus_db(self, splits: list[Document], llama_embeddings: OllamaEmbeddings, db_path: str) -> Milvus:

        # If no documents are provided, return the database without adding any texts
        if not splits:
            print("\nNo documents to add. Returning an empty database!\n")
            print("-"*80)
            vector_db = Milvus(
                embedding_function=llama_embeddings,
                connection_args={"uri": db_path},
                collection_name="DataCollection",
            )
            return vector_db

        # Extract page content from documents for embedding
        text_splits = [doc.page_content for doc in splits]
        metadatas = [doc.metadata for doc in splits]

        # Initialize Milvus vector database
        vector_db = Milvus(
            embedding_function=llama_embeddings,
            connection_args={"uri": db_path},
            collection_name="DataCollection",
        )
    
        # Generate unique IDs for each document in the database
        ids = [str(i) for i in range(len(text_splits))]
        # print("IDS ON CREATE:")
        # print(ids)

        # Add the texts (documents) to the Milvus database

        metadata = [{"doc_id": doc_id, "filename": doc.metadata.get("source", "unknown")} for doc_id, doc in zip(ids, splits)]
        #print(metadata)
        
        vector_db.add_texts(
            self,
            texts=text_splits, 
            metadatas=metadatas,
            ids=ids,
        )

        # Return the initialized vector database
        return vector_db

    def add_to_milvus_db(self, splits: list[Document], vector_db) -> Milvus:
        
        # Extract page content from documents for embedding
        text_splits = [doc.page_content for doc in splits]
        metadatas = [doc.metadata for doc in splits]

        if not text_splits:
            print("\nWarning: No valid content found in the documents!\n")
            print("-"*100)
            return vector_db  # or handle this case differently

        # Generate unique IDs for each document
        ids = [str(i) for i in range(len(text_splits))]

        # Add the new texts (documents) to the Milvus database
        vector_db.add_texts(
            texts=text_splits, 
            metadatas=metadatas,  # Include metadata
            ids=ids
        )

        # Return the updated vector database
        return vector_db

    # Function to load an existing Milvus database
    def load_milvus_db(self, llama_embeddings: OllamaEmbeddings, db_path: str) -> Milvus:
        """
        Loads an existing Milvus vector database from the specified path.
        """
        # Initialize and load the vector database from the specified path
        vector_store_loaded = Milvus(
            llama_embeddings,
            connection_args={"uri": db_path},
            collection_name="DataCollection",
        )
        
        # Return the loaded vector database
        return vector_store_loaded

    # Function to load new documents from the specified directory and return them as a list
    def load_new_docs(self, new_files: set, data_path: str) -> list[Document]:
        """
        Loads new documents from a specified directory based on a set of file names.
        Supports multiple file types such as TXT, DOCX, PDF, PPTX, and CSV.
        """
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
                        print(f"\nLoaded TXT file: {file_path}\n")
                    
                    elif file_path.endswith(".docx"):
                        loader = UnstructuredWordDocumentLoader(file_path)
                        docs = loader.load()
                        new_loaded_docs.extend(docs)
                        print(f"\nLoaded DOCX file: {file_path}\n")
                    
                    elif file_path.endswith(".pdf"):
                        loader = UnstructuredPDFLoader(file_path)
                        docs = loader.load()
                        new_loaded_docs.extend(docs)
                        print(f"\nLoaded PDF file: {file_path}\n")
                    
                    elif file_path.endswith(".pptx"):
                        loader = UnstructuredPowerPointLoader(file_path)
                        docs = loader.load()
                        new_loaded_docs.extend(docs)
                        print(f"\nLoaded PPTX file: {file_path}\n")
                    
                    elif file_path.endswith(".csv"):
                        loader = CSVLoader(file_path)
                        docs = loader.load()
                        new_loaded_docs.extend(docs)
                        print(f"\nLoaded CSV file: {file_path}\n")

                    else:
                        # Handle unsupported file types
                        print(f"\nUnsupported file type: {file_path}\n")
                except Exception as e:
                    # Handle errors during loading
                    print(f"\nError loading {file_path}: {e}\n")
            else:
                # Handle case where file doesn't exist
                print(f"\nFile not found: {file_path}\n")
        
        # Return the list of loaded documents
        return new_loaded_docs

    # Function to load all documents from a given directory path
    def load_docs(self, data_path: str) -> list[Document]:
        """
        Loads all documents from the specified directory.
        """
        # Initialize a loader for the directory and load documents
        loader = DirectoryLoader(path=data_path)
        docs = loader.load()

        # Return the loaded documents
        return docs

    # Function to check if a Milvus database exists at a given path and delete it
    def delete_milvus_db(self, db_path: str):
        """
        Deletes a Milvus database if it exists at the specified path.
        """
        # Check if the database exists and remove it
        if os.path.exists(db_path):
            os.remove(db_path)
            time.sleep(2)

    # Function to delete vectors from the Milvus database using keyword search
    def milvus_delete_entry(self, llama_embeddings: OllamaEmbeddings, db_path: str):
        """
        Deletes a selected entry from a Milvus database based on a similarity search and user input.
        """
        # Initialize Milvus DB
        collectionName = "DataCollection"
        milvus_db = Milvus(
            embedding_function=llama_embeddings,
            connection_args={"uri": db_path},
            collection_name=collectionName,
        )

        retriever = VectorStoreRetriever(vectorstore=milvus_db)

        # Perform similarity search to locate all stored documents
        try:
            docs = retriever.vectorstore.similarity_search(query="", k=1000)

            # Extract unique filenames from metadata
            filenames = {doc.metadata["filename"] for doc in docs if "filename" in doc.metadata}

        except Exception as e:
            print(f"Error fetching filenames: {e}")
            return

        if not filenames:
            print("No files found in the vector database.")
            return

        print("\nStored Files:")
        filenames = list(filenames)  # Convert to a list for indexing
        for idx, fname in enumerate(filenames):
            print(f"{idx+1}. {fname}")

        # Prompt user to choose a file for deletion
        try:
            choice = int(input("\nEnter the number of the file you want to delete: ")) - 1
            selected_file = filenames[choice] if 0 <= choice < len(filenames) else None
        except ValueError:
            print("Invalid input. Please enter a number.")
            return

        if not selected_file:
            print("Invalid selection. Cancelling deletion.")
            return

        # Filter doc_ids for the selected file
        ids_to_delete = [
            doc.metadata.get("pk") for doc in docs 
            if doc.metadata.get("filename") == selected_file and "pk" in doc.metadata
        ]

        if not ids_to_delete:
            print(f"No vectors found for file '{selected_file}'.")
            return

        try:
            milvus_db.client.delete(collection_name=collectionName, ids=ids_to_delete)
            milvus_db.client.refresh_load(collection_name=collectionName)
            print(f"Deleted {len(ids_to_delete)} vectors for file '{selected_file}'.")
        except Exception as e:
            print(f"Error during deletion: {e}")

    def update_list(self, vector_store):
        """
        Updates the list of filenames in the vector database by performing a similarity search and fetching the filenames.
        """
        collectionName = "DataCollection"
        
        # Perform a similarity search to get documents
        try:
            retriever = VectorStoreRetriever(vectorstore=vector_store)
            docs = retriever.vectorstore.similarity_search(query="", k=1000)

            # Extract unique filenames from the documents' metadata
            filenames = {doc.metadata["filename"] for doc in docs if "filename" in doc.metadata}

            if not filenames:
                print("No files found in the vector database.")
                return

            # Update the filenames list in the vector store
            vector_store.filenames = list(filenames)  # Assuming vector_db has a 'filenames' attribute to store the list

            print("\nUpdated filenames list:")
            for idx, fname in enumerate(vector_store.filenames):
                print(f"{idx + 1}. {fname}")
            print("\n"+ "-"*100)

        except Exception as e:
            print(f"Error updating filenames list: {e}")