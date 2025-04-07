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
collection_name = f"collection_{USER_ID}"


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
def get_doc_names_in_collection() -> list:

    collection = get_milvus_connection()

    # Queries collection to get source doc names, page_numbers, and PKs
    data = collection.client.query(
        collection_name=collection_name,
        output_fields=["filename", "pk"],
        filter="",
        limit = "1000"
    )

    # Set of document names from the query data
    doc_set = set()
    for x in data:
        doc_set.add(x["filename"])

    # Parses back to a list for future use
    docs = list(doc_set)

    collection.client.close()

    return docs

# Drops the collection
def drop_collection() -> None:

    collection = get_milvus_connection()

    collection.client.drop_collection(
        collection_name=collection_name
    )
    print("collection dropped")

    collection.client.close()