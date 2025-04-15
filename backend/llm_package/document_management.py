"""
Authors: Antonio Sousa Jr(Team Lead), Matthew Greeson, Goncalo Felix, Antonio Morais, Dylan Ricci, Ryan Medeiros
Affiliation: University of Massachusetts Dartmouth
Course: CIS 498 & 499 (Senior Capstone Project)
Ownership: Rite-Solutions, Inc.
Client/Stakeholder: Brandon Carvhalo
"""

from langchain.schema import Document
from langchain_community.document_loaders import UnstructuredFileIOLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter

from werkzeug.datastructures import FileStorage

from datetime import datetime
from zoneinfo import ZoneInfo
import hashlib


def load_docs(files: list[FileStorage]) -> list[Document]:
    # Loads files sent from frontend into langchain Doucment objects

    try:
        docs = []

        # Loop through the files sent and load them into langchain Document objects
        for file in files:

            loader = UnstructuredFileIOLoader(file=file, mode="single")
            doc = loader.load()[0]

            # Create a unique doc_id (hash) for this file
            doc_id = get_file_hash(file)

            # Add metadata to document object
            doc.metadata["doc_id"] = doc_id
            doc.metadata["filename"] = file.filename
            doc.metadata["filetype"] = file.content_type
            doc.metadata["upload_time"] = datetime.now(
                ZoneInfo("America/New_York")).strftime("%Y-%m-%d %H:%M:%S %Z%z")

            docs.append(doc)

    except Exception as e:
        print(f"[load_docs] Failed to load docs: {e}")
        raise

    # Return list of documents with correct metadata
    return docs


def split_docs(docs: list[Document]) -> list[Document]:
    try:
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=512, chunk_overlap=64, add_start_index=True
        )

        all_splits = []
        for doc in docs:
            splits = text_splitter.split_documents([doc])
            for split in splits:
                for key in ["doc_id", "filename", "filetype", "upload_time"]:
                    if key in doc.metadata:
                        split.metadata[key] = doc.metadata[key]
            all_splits.extend(splits)

        return all_splits

    except Exception as e:
        print(f"[split_docs] Failed to split docs: {e}")
        raise


def get_file_hash(file: FileStorage) -> str:
    # Function to compute the SHA256 hash of a file

    try:
        file.seek(0)
        file_hash = hashlib.md5(file.read()).hexdigest()
        file.seek(0)

        # Return document hash
        return file_hash

    except Exception as e:
        print(f"[get_file_hash] Failed to hash file: {e}")
        raise
