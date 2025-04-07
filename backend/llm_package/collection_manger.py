from langchain_milvus import Milvus
from langchain_ollama import OllamaEmbeddings
from langchain.schema import Document

from dotenv import load_dotenv
import os

# Get ENV variables
load_dotenv()
USER_ID = os.getenv("USER_ID")
MILVUS_SERVER_URL = os.getenv("MILVUS_SERVER_URL")

# Inialize variables
embeddings = OllamaEmbeddings(model="llama3.1:70b")
collection_name = f"user_{USER_ID}_collection"


def get_milvus_connection():

    return Milvus(
        collection_name=collection_name,
        embedding_function=embeddings,
        connection_args={"uri": MILVUS_SERVER_URL},
        auto_id=True
    )

# Adds docs to collection
# NOTE: Schema for collection is defined automatticaly from first docuemnts metadata
def add_docs_to_collection(splits: list[Document]) -> None:

    collection = get_milvus_connection()

    # Extract page content and metadata from documents
    text_splits = [doc.page_content for doc in splits]
    metadatas = [doc.metadata for doc in splits]

    # Debug statement
    if not text_splits:
        print("\nWarning: No valid content found in the documencts!\n")
        collection.client.close()
        return

    # Add the new texts (documents) to the Milvus database
    collection.add_texts(
        texts=text_splits,
        metadatas=metadatas
    )

    collection.client.close()

# Removes docs from collection passed on a list of doc names to remove
def remove_docs_from_collection(docs_to_remove: list[str]) -> None:

    collection = get_milvus_connection()

    collection.client.delete(
        collection_name=collection_name,
        filter=f"source in {docs_to_remove}"
    )

    collection.client.close()

# Creates a list of the document names in the collection
def list_entries_in_collection() -> list:

    collection = get_milvus_connection()

    # Queries collection to get source doc names, page_numbers, and PKs
    data = collection.client.query(
        collection_name=collection_name,
        output_fields=["doc_id", "filename", "filetype", "upload_time"],
        filter="",
        limit = "1000"
    )

    # Use only with unqie DOC_ID to show documents
    unique_entries = {}
    for entry in data:
        doc_id = entry["doc_id"]
        if doc_id not in unique_entries:
            unique_entries[doc_id] = entry

    # Convert the dictionary values back into a list
    unique_data = list(unique_entries.values())

    collection.client.close()

    return unique_data

# Drops the collection
def drop_collection() -> None:

    collection = get_milvus_connection()

    collection.client.drop_collection(
        collection_name=collection_name
    )
    print("collection dropped")

    collection.client.close()