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

# Importing necessary libraries for file handling, hashing, and LangChain components
import os, time, json
import hashlib

# Importing specific classes and functions from LangChain and related modules
from langchain_ollama import OllamaLLM, OllamaEmbeddings
from langchain_community.document_loaders import DirectoryLoader, TextLoader, CSVLoader, UnstructuredPDFLoader, UnstructuredWordDocumentLoader, UnstructuredPowerPointLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain.schema import Document
from langchain_milvus import Milvus # type: ignore
from langchain.vectorstores.base import VectorStoreRetriever


# Function that takes a single file and the entire data folder and generates a new hash value for each file
def compute_file_hash_value(file_path, data_path):
    
    # Correct way to join paths and open the file in binary mode
    full_file_path = os.path.join(data_path, file_path)

    # Check if the file exists before trying to open it
    if not os.path.exists(full_file_path):
        print(f"File not found: {file_path}")
        return None  # Return None or handle accordingly
    
    try:
        hasher = hashlib.sha256()  # Initialize SHA256 hash function
        with open(full_file_path, "rb") as f:  # Open the file in binary mode
            while chunk := f.read(65536):  # Read the file in 64KB chunks
                hasher.update(chunk)  # Update hash with each chunk

        return hasher.hexdigest()  # Return the hash as a hex string
    
    except Exception as e:
        print(f"Error reading file {full_file_path}: {e}")
        return None

# Basic function that creates an empty hash map to store file hashes, called in main llm.py 
def create_hashset():

    file_hash_set = {}  # Initialize an empty dictionary to store hash values
    return file_hash_set  # Return the empty hash map


# Function to compare hash values from files to detect duplicates
def compare_hash_values(hash_set):

    hash_map = {}  # Dictionary to map hash values to file names

    # Iterate through hash_set (which contains file-path-to-hash mappings)
    for file_path, file_hash in hash_set.items():
        if file_hash in hash_map:
            hash_map[file_hash].append(file_path)  # Add file to existing hash entry
        else:
            hash_map[file_hash] = [file_path]  # Create a new entry for the hash

    # Print out any duplicates found in the hash map
    for hash_value, files in hash_map.items():
        if len(files) > 1:  # Only print if multiple files share the same hash
            print(f"\nDuplicate hash values found: {hash_value}")
            for file in files:
                print(f" - {file}")
            
            print("\n"+"-" * 100)  # Separator for readability


# Function to compute and store new hash values for newly added files
def new_compute_hash_values(new_files, hash_results, document_path, hash_set):
    # Open the file to save the hashes in append mode
    with open(hash_results, 'a') as f:  # Open a text file for appending hash values
        # Process each new file and compute its hash
        for file_path in new_files:
            file_hash = compute_file_hash_value(file_path, document_path)  # Compute hash of the file
                
            if file_hash:  # Only process if the hash was successfully computed
                # Store the file path and corresponding hash in the dictionary
                hash_set[file_path] = file_hash
                    
                # Write the file path and hash value to the file
                f.write(f"File: {file_path}\nHash: {file_hash}\n")
                f.write("-" * 100 + "\n")  # Add separator for readability