'''
File: gile_naming_utils.py
Authors: Antonio Sousa Jr(Team Lead), Matthew Greeson, Goncalo Felix, Antonio Morais, Dylan Ricci, Ryan Medeiros
Affiliation: University of Massachusetts Dartmouth
Course: CIS 498 & 499 (Senior Capstone Project)
Ownership: Rite-Solutions, Inc. 
Client/Stakeholder: Brandon Carvhalo  
Date: 2025-4-25
        
file_naming_utils.py description and purpose: 
    - This code will generate a hash set that will give unique ids to each file name and its content, currently getting worked on

'''

# BEGINNING OF CODE !!!
import os, time, json
import hashlib


from langchain_ollama import OllamaLLM, OllamaEmbeddings
from langchain_community.document_loaders import DirectoryLoader, TextLoader, CSVLoader, UnstructuredPDFLoader, UnstructuredWordDocumentLoader, UnstructuredPowerPointLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain.schema import Document
from langchain_milvus import Milvus # type: ignore
from langchain.vectorstores.base import VectorStoreRetriever


# Function that takes a single file and the entire data folder and generates an new hash value for each file
def compute_file_hash_value(file_path, data_path):
    
    # Correct way to join paths and open the file in binary mode
    full_file_path = os.path.join(data_path, file_path)

    # Check if the file exists before trying to open it
    if not os.path.exists(full_file_path):
        print(f"File not found: {file_path}")
        return None  # Return None or handle accordingly
    
    try:
        hasher = hashlib.sha256()
        with open(full_file_path, "rb") as f:  # Open in binary mode
            while chunk := f.read(4096):  # Read in 4KB chunks
                hasher.update(chunk)

        return hasher.hexdigest()  # Return hash as a hex string
    
    except Exception as e:
        print(f"Error reading file {full_file_path}: {e}")
        return None

# Basic function that creates the hash map, called in main llm.py 
def create_hashset():

    file_hash_set = {}

    return file_hash_set


def compare_hash_values(hash_set):

    hash_map = {}  # Dictionary to map hash values to file names

    # Iterate through hash_set (which contains file-path-to-hash mappings)
    for file_path, file_hash in hash_set.items():
        if file_hash in hash_map:
            hash_map[file_hash].append(file_path)  # Add file to existing hash entry
        else:
            hash_map[file_hash] = [file_path]  # Create new entry

    # Print duplicates
    for hash_value, files in hash_map.items():
        if len(files) > 1:  # Only print if multiple files share the same hash
            print(f"Duplicate hash found: {hash_value}")
            for file in files:
                print(f" - {file}")
            
            print("\n"+"-" * 80)  # Separator for readability


# Add any new hash values to the txt file 
def new_compute_hash_values(new_files, hash_results, document_path, hash_set):
    # Open the file to save the hashes in append mode
    with open(hash_results, 'a') as f:  # Open a text file for appending hash values
        # Process each file
        for file_path in new_files:
            file_hash = compute_file_hash_value(file_path, document_path)  # Compute hash
                
            if file_hash:  # Only process if the hash was successfully computed
                # Store the file path and corresponding hash in the dictionary
                hash_set[file_path] = file_hash
                    
                # Write the file path and hash value to the file
                f.write(f"File: {file_path}\nHash: {file_hash}\n")
                f.write("-" * 80 + "\n")  # Add separator for readability
               