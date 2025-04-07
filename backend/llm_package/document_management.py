"""
File: hashing.py
Authors: Antonio Sousa Jr(Team Lead), Matthew Greeson, Goncalo Felix, Antonio Morais, Dylan Ricci, Ryan Medeiros
Affiliation: University of Massachusetts Dartmouth
Course: CIS 498 & 499 (Senior Capstone Project)
Ownership: Rite-Solutions, Inc.
Client/Stakeholder: Brandon Carvhalo
Date: 2025-4-25

hashing.py description and purpose:
    - This code will generate a hash set that will give unique ids to each file name and its content, currently getting worked on

"""

# Importing necessary libraries for file handling, hashing, and LangChain components
import hashlib
from datetime import datetime
from zoneinfo import ZoneInfo
from langchain.schema import Document
from langchain_community.document_loaders import UnstructuredFileIOLoader
from werkzeug.datastructures import FileStorage  # Import FileStorage

from langchain.text_splitter import RecursiveCharacterTextSplitter

class DocumentManagement:
    
    #NOTE does nto prevent dublicate insertion yet just give uniqie id to same files contents
    def load_docs(self, files: list[FileStorage]) -> list[Document]: 

        docs = []

        for file in files:
            loader = UnstructuredFileIOLoader(file=file, mode="single")
            doc = loader.load()[0]

            # Create a unique doc_id for this file
            doc_id = self.get_file_hash(file)

            # Add metadata
            doc.metadata["doc_id"] = doc_id
            doc.metadata["filename"] = file.filename
            doc.metadata["filetype"] = file.content_type
            doc.metadata["upload_time"] = datetime.now(ZoneInfo("America/New_York")).strftime("%Y-%m-%d %H:%M:%S %Z%z")

            docs.append(doc)


        return docs  # Return list of documents with correct metadata
 

    def split_docs(self, docs: list[Document]) -> list[Document]:

        # Initialize the RecursiveCharacterTextSplitter with parameters for chunk size and overlap
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=512, chunk_overlap=64, add_start_index=True
        )

        splits = (text_splitter.split_documents(docs))

        return splits

    # Function to compute the SHA256 hash of a file
    def get_file_hash(self, file):
        file.seek(0)
        file_hash = hashlib.md5(file.read()).hexdigest()
        file.seek(0)
        return file_hash
