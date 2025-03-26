import os
import time
from uuid import uuid4
from langchain_ollama import OllamaEmbeddings
from langchain_community.document_loaders import DirectoryLoader
from langchain.schema import Document
from langchain_milvus import Milvus  # type: ignore
from langchain.vectorstores.base import VectorStoreRetriever
from pymilvus import Collection, CollectionSchema, DataType, FieldSchema, connections, utility

class VectorDatabase:

    def __init__(self, llm_embeddings: OllamaEmbeddings, db_path: str, collection_name: str):
        """
        Initializes the vector database and creates a Milvus instance.
        """
        # Store collection name as an attribute
        self.collection_name = collection_name
        self.db_path = db_path
        self.embedding_function = llm_embeddings
        
        # Initialize Milvus vector database and store it as an instance variable
        self.vector_db = Milvus(
            embedding_function=llm_embeddings,
            connection_args={"uri": db_path},
            collection_name=self.collection_name,
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
        ids = [str(uuid4()) for _ in range(len(text_splits))]
        # Add the new texts (documents) to the Milvus database
        # Add the new texts (documents) to the Milvus database
        self.vector_db.add_texts(
            texts=text_splits,
            metadatas=[{**metadata, "page_content": text} for metadata, text in zip(metadatas, text_splits)], # modified this line.
            ids=ids,
        )
    
        return ids

    def delete_db_entry(self, filename: str) -> None:
        """
        Deletes all vectors associated with a specific filename from the Milvus database.
        """
        retriever = VectorStoreRetriever(vectorstore=self.vector_db)

        try:
            docs = retriever.vectorstore.similarity_search(query="", k=1000)
            ids_to_delete = [
                doc.metadata.get("pk")
                for doc in docs
                if doc.metadata.get("filename") == filename and "pk" in doc.metadata
            ]

        except Exception as e:
            print(f"Error fetching vectors: {e}")
            return

        if not ids_to_delete:
            print(f"No vectors found for file '{filename}'.")
            return

        try:
            self.vector_db.client.delete(
                collection_name="DataCollection", ids=ids_to_delete
            )
            self.vector_db.client.refresh_load(collection_name="DataCollection")
            print(f"Deleted {len(ids_to_delete)} vectors for file '{filename}'.")
        except Exception as e:
            print(f"Error during deletion: {e}")
        except Exception as e:
            print(f"Error during purge: {e}")
            raise  # Re-raise the exception to propagate errors

            # Dun
    def purge_collection(self):
        # Check if the collection already exists in the Milvus database
        if utility.has_collection(self.collection_name):
            # If the collection exists, drop it
            utility.drop_collection(self.collection_name)
            print(f"Collection '{self.collection_name}' has been dropped.")
            
            # Add a small delay to allow the operation to complete before proceeding
            time.sleep(.5)

        # After dropping the collection, check if it now doesn't exist
        if not utility.has_collection(self.collection_name):
            # If the collection doesn't exist, recreate it
            print(f"Collection '{self.collection_name}' does not exist. Recreating it...")

            # Get the embedding dimensions by passing a test document to the embedding function
            # This helps in determining the size of the vector field in the schema
            embeddings = self.embedding_function.embed_documents(["test"])  # Example to check embedding dimension
            embedding_dim = len(embeddings[0])  # Get the dimension of the first embedding

            # Define the fields for the collection schema
            # 'pk' is a primary key field of type VARCHAR (36 characters max)
            fields = [
                FieldSchema(name="pk", dtype=DataType.VARCHAR, is_primary=True, max_length=36),  # Primary key field
                FieldSchema(name="vector", dtype=DataType.FLOAT_VECTOR, dim=embedding_dim),  # Vector field with embedding dimension
                FieldSchema(name="text", dtype=DataType.VARCHAR, max_length=65535), # added the text field.
            ]
            
            # Create the schema for the collection with dynamic fields enabled
            schema = CollectionSchema(fields, description="Embedding collection", enable_dynamic_field=True)

            # Try to create the collection with the defined schema
            try:
                Collection(name=self.collection_name, schema=schema)
                print(f"Collection '{self.collection_name}' successfully created with dynamic fields enabled.")
            except Exception as e:
                # If there is an error during collection creation, print the error and stop the process
                print(f"Error creating collection: {e}")
                return  # Exit the method if collection creation fails

            # Re-initialize LangChain's Milvus wrapper with the newly created collection
            try:
                self.vector_db = Milvus(
                    embedding_function=self.embedding_function,
                    connection_args={"uri": self.db_path},  # Provide connection details
                    collection_name=self.collection_name,  # Set the collection name
                )
                print(f"Milvus vector store initialized for collection '{self.collection_name}'.")
            except Exception as e:
                # If there is an error during Milvus initialization, print the error
                print(f"Error initializing Milvus vector store: {e}")
        else:
            # If the collection already exists, print a message and do nothing
            print(f"Collection '{self.collection_name}' already exists.")


    def collection_status(self):
        """
        Checks if the collection exists in the Milvus database.
        """
        # Create a connection to Milvus
        connections.connect(alias="default", uri=os.getenv("DB_PATH"))
        
        # Check if the collection has data
        collection = self.vector_db  # Assuming this is already initialized
        collection.load()  # Ensure the collection is loaded before querying
        
        num_entities = collection.num_entities  # Get number of stored vectors

        if num_entities == 0:
            return "Collection exists but is empty."
        else:
            return f"Collection exists with {num_entities} stored embeddings."
        

   