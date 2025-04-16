"""
Authors: Antonio Sousa Jr(Team Lead), Matthew Greeson, Goncalo Felix, Antonio Morais, Dylan Ricci, Ryan Medeiros
Affiliation: University of Massachusetts Dartmouth
Course: CIS 498 & 499 (Senior Capstone Project)
Ownership: Rite-Solutions, Inc.
Client/Stakeholder: Brandon Carvalho
"""

from langchain_milvus import Milvus
from langchain_ollama import OllamaEmbeddings

from llm_package import document_management
from werkzeug.datastructures import FileStorage

from dotenv import load_dotenv
import os


# Get ENV variables
load_dotenv()
USER_ID = os.getenv("USER_ID")
MILVUS_SERVER_URL = os.getenv("MILVUS_SERVER_URL")
OLLAMA_SERVER_URL = os.getenv("OLLAMA_SERVER_URL")


# Inialize embeddings model you want collections to use
embeddings = OllamaEmbeddings(model="llama3.1:70b", base_url=OLLAMA_SERVER_URL)
# Inialize collection name based on USER_ID env variable
collection_name = f"collection_{USER_ID}"


# NOTE: Schema for collection is defined automatically from first docuemnts metadata
# NOTE: Collection.client.close() only closes connection on client side it will still show on server
# NOTE: See Milvusdb.md in docs directory for more details


def get_milvus_connection() -> Milvus:
    # Creates the connection to the Milvus server

    try:
        # Return Milvus Langchain object
        return Milvus(
            collection_name=collection_name,
            embedding_function=embeddings,
            connection_args={"uri": MILVUS_SERVER_URL},
            auto_id=True
        )

    except Exception as e:
        print(f"[get_milvus_connection] Failed to connect to Milvus: {e}")
        raise


def add_docs_to_collection(files: list[FileStorage]) -> dict:
    existing_entries = list_docs_in_collection()
    existing_doc_ids = {entry["doc_id"]: entry["filename"] for entry in existing_entries}

    new_files, skipped = filter_duplicate_files(files, existing_doc_ids)

    if not new_files:
        return {
            "uploaded": [],
            "skipped": skipped
        }

    # Load, split, and embed new documents
    loaded_docs = document_management.load_docs(new_files)
    splits = document_management.split_docs(loaded_docs)

    collection = get_milvus_connection()

    try:
        text_splits = [doc.page_content for doc in splits]
        metadatas = [doc.metadata for doc in splits]

        collection.add_texts(texts=text_splits, metadatas=metadatas)

    except Exception as e:
        print(f"[add_docs_to_collection] Failed to add docs: {e}")
        return {"error": f"Failed to add documents: {e}"}

    finally:
        collection.client.close()

    return {
        "uploaded": [file.filename for file in new_files],
        "skipped": skipped
    }


def filter_duplicate_files(files, existing_doc_ids):
    """
    Filters out duplicates both from existing collection entries
    and within the current upload batch.
    
    Returns:
        - new_files: List of files that should be uploaded
        - skipped: Dict of skipped file reasons
    """
    new_files = []
    skipped = {}
    seen_hashes = set()

    for file in files:
        file_hash = document_management.get_file_hash(file)

        if file_hash in existing_doc_ids:
            skipped[file.filename] = existing_doc_ids[file_hash]
            print(f"skipped (in collection): {file.filename} → {existing_doc_ids[file_hash]}")
        elif file_hash in seen_hashes:
            skipped[file.filename] = "duplicate of another file in this upload"
            print(f"skipped (duplicate in batch): {file.filename}")
        else:
            seen_hashes.add(file_hash)
            new_files.append(file)
            print(f"added: {file.filename}")

    return new_files, skipped


def remove_docs_from_collection(docs_to_remove: list[str]) -> None:
    # Removes docs from collection passed on a list of doc ids (hashes) to remove
    collection = get_milvus_connection()

    try:
        # Deletes entries based a doc id (hash)
        collection.client.delete(
            collection_name=collection_name,
            filter=f"doc_id in {docs_to_remove}"
        )

    except Exception as e:
        print(f"[remove_docs_from_collection] Failed to remove docs: {e}")

    finally:
        collection.client.close()


def list_docs_in_collection() -> list:
    # Creates a list of the document names in the collection
    collection = get_milvus_connection()

    try:
        # If the collection hasnt been created yet
        if not collection.client.has_collection(collection_name):
            # Return empty list
            return []

        # Queries collection to get doc ids, filenames, filetypes, and upload times
        # This will work for 1000 chunks increase limit parameter if there are more chunks
        data = collection.client.query(
            collection_name=collection_name,
            output_fields=["doc_id", "filename", "filetype", "upload_time"],
            filter="",
            limit="1000"
        )

        # Get only unique doc ids to send to frontend
        # We are identifing documents by the meta data (doc_id) of the chunks in the db
        unique_entries = {}
        for entry in data:
            doc_id = entry["doc_id"]
            if doc_id not in unique_entries:
                unique_entries[doc_id] = entry

        # Convert the dictionary values back into a list
        unique_data = list(unique_entries.values())

        # Return list of unique documents
        return unique_data

    except Exception as e:
        print(f"[list_docs_in_collection] Failed to list docs: {e}")
        # Return empty list
        return []

    finally:
        collection.client.close()


def drop_collection() -> None:
    # Drops the collection
    collection = get_milvus_connection()

    try:
        collection.client.drop_collection(
            collection_name=collection_name
        )

    except Exception as e:
        print(f"[drop_collection] Failed to drop collection: {e}")

    finally:
        collection.client.close()
