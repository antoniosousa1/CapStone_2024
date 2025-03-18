import os
import time
from langchain_ollama import OllamaEmbeddings
from langchain_community.document_loaders import DirectoryLoader
from langchain.schema import Document
from langchain_milvus import Milvus  # type: ignore
from langchain.vectorstores.base import VectorStoreRetriever


class VectorDatabase:

    def __init__(self, llm_embeddings: OllamaEmbeddings, db_path: str):
        """
        Initializes the vector database and creates a Milvus instance.
        """
        # Initialize Milvus vector database and store it as an instance variable
        self.vector_db = Milvus(
            embedding_function=llm_embeddings,
            connection_args={"uri": db_path},
            collection_name="DataCollection",
        )

    def update_db(self, splits: list[Document]) -> None:
        """
        Updates the Milvus database by adding new document splits.
        """
        # Extract page content and metadata from documents
        text_splits = [doc.page_content for doc in splits]
        metadatas = [doc.metadata for doc in splits]

        if not text_splits:
            print("\nWarning: No valid content found in the documents!\n")
            return

        # Generate unique IDs for each document
        ids = [str(i) for i in range(len(text_splits))]

        # Add the new texts (documents) to the Milvus database
        self.vector_db.add_texts(
            texts=text_splits, metadatas=metadatas, ids=ids  # Include metadata
        )

    def delete_db_entry(self, llama_embeddings: OllamaEmbeddings, db_path: str) -> None:
        """
        Deletes a selected entry from a Milvus database based on a similarity search and user input.
        """
        # Load the Milvus DB
        milvus_db = Milvus(
            embedding_function=llama_embeddings,
            connection_args={"uri": db_path},
            collection_name="DataCollection",
        )

        retriever = VectorStoreRetriever(vectorstore=milvus_db)

        try:
            docs = retriever.vectorstore.similarity_search(query="", k=1000)
            filenames = {doc.metadata["filename"] for doc in docs if "filename" in doc.metadata}
        except Exception as e:
            print(f"Error fetching filenames: {e}")
            return

        if not filenames:
            print("No files found in the vector database.")
            return

        print("\nStored Files:")
        filenames = list(filenames)
        for idx, fname in enumerate(filenames):
            print(f"{idx + 1}. {fname}")

        try:
            choice = int(input("\nEnter the number of the file you want to delete: ")) - 1
            selected_file = filenames[choice] if 0 <= choice < len(filenames) else None
        except ValueError:
            print("Invalid input. Please enter a number.")
            return

        if not selected_file:
            print("Invalid selection. Cancelling deletion.")
            return

        ids_to_delete = [
            doc.metadata.get("pk")
            for doc in docs
            if doc.metadata.get("filename") == selected_file and "pk" in doc.metadata
        ]

        if not ids_to_delete:
            print(f"No vectors found for file '{selected_file}'.")
            return

        try:
            milvus_db.client.delete(
                collection_name="DataCollection", ids=ids_to_delete)
            milvus_db.client.refresh_load(collection_name="DataCollection")
            print(f"Deleted {len(ids_to_delete)} vectors for file '{selected_file}'.")
        except Exception as e:
            print(f"Error during deletion: {e}")