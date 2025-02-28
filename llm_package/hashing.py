'''
File: hashing.py
Authors: Antonio Sousa Jr(Team Lead), Matthew Greeson, Goncalo Felix, Antonio Morais, Dylan Ricci, Ryan Medeiros
Affiliation: University of Massachusetts Dartmouth
Course: CIS 498 & 499 (Senior Capstone Project)
Ownership: Rite-Solutions, Inc. 
Client/Stakeholder: Brandon Carvhalo  
Date: 2025-4-25
        
hashing.py description and purpose: 
    - This code will generate a hash set that will give unique ids to each file name and its content, currently getting worked on

'''

# Importing necessary libraries for file handling, hashing, and LangChain components
import os
import hashlib

class Hashing():

    # Function to compute the SHA256 hash of a file
    def compute_file_hash_value(file_path, data_path):
        """
        This function computes the SHA256 hash of a file.
        Takes the file path and data folder path as input, returns the file hash if successful, otherwise None.
        """
        full_file_path = os.path.join(data_path, file_path)  # Join paths to form the full file path

        # Check if the file exists before attempting to read it
        if not os.path.exists(full_file_path):
            print(f"File not found: {file_path}")
            return None  # Return None if file does not exist
        
        try:
            hasher = hashlib.sha256()  # Initialize SHA256 hash function
            with open(full_file_path, "rb") as f:  # Open the file in binary mode
                while chunk := f.read(65536):  # Read the file in 64KB chunks
                    hasher.update(chunk)  # Update hash with each chunk

            return hasher.hexdigest()  # Return the hash as a hexadecimal string
        
        except Exception as e:
            print(f"Error reading file {full_file_path}: {e}")
            return None  # Return None if an error occurs during reading

    # Function to create an empty hash map (hash set) for storing file hashes
    def create_hashset():
        """
        Creates and returns an empty hash set (dictionary) to store file hashes.
        """
        file_hash_set = {}  # Initialize an empty dictionary
        return file_hash_set  # Return the empty hash map


    # Function to compare hash values of files and detect duplicates
    def compare_hash_values(hash_set, document_path, hash_values):
        """
        Compares the hash values of files in the hash set and identifies duplicates.
        Prompts user to delete any duplicate files found.
        """
        hash_map = {}  # Dictionary to map hash values to file names

        # Iterate through the hash set to group files by their hash values
        for file_path, file_hash in hash_set.items():
            if file_hash in hash_map:
                hash_map[file_hash].append(file_path)  # Add file to existing hash entry
            else:
                hash_map[file_hash] = [file_path]  # Create a new entry for the hash

        # Print out and handle duplicates found in the hash map
        for hash_value, files in hash_map.items():
            if len(files) > 1:  # Only consider if multiple files share the same hash
                
                # Prompt the user to delete duplicates
                while True:
                    print(f"\nDuplicate hash values found: {hash_value}")
                    for file in files:
                        print(f" - {file}")
                    print("\n" + "-" * 100)
                    file_name = input("\nWhich duplicate file do you want to delete? (Type the exact filename)\n" + "Enter file name here: ")

                    if file_name in files:  # Ensure input is valid
                        full_file_path = os.path.join(document_path, file_name)

                        if os.path.exists(full_file_path):  # Check if file exists
                            os.remove(full_file_path)  # Delete the file
                            print("\n" + "-" * 100)  # Separator for readability
                            print(f"\nThe duplicate file '{file_name}' was deleted!\n")

                            # Remove the hash entry for the deleted file from the hash results
                            remove_hash_entry(hash_values, file_name)

                            # Remove the file from the list of duplicates
                            files.remove(file_name)

                            # Stop checking this hash if only one file remains for it
                            if len(files) == 1:
                                break
                            
                            print("-" * 100)
                        else:
                            print(f"Error: The file '{file_name}' does not exist in the given directory.")
                    else:
                        print("\n" + "-" * 100)
                        print("\nInvalid file name. Please enter one of the listed duplicate files.\n")


    # Function to remove the hash entry of a deleted file from the hash results file
    def remove_hash_entry(hash_values, file_name):
        """
        This function removes the hash entry for a deleted file from the hash values file.
        """
        if not os.path.exists(hash_values):  # Check if the hash values file exists
            print("Error: Hash values file does not exist.")
            return

        with open(hash_values, "r") as f:
            lines = f.readlines()  # Read all lines from the file

        # Write back all lines except for the deleted file's entry
        with open(hash_values, "w") as f:
            skip = False  # Flag to skip lines related to the deleted file
            for line in lines:
                if line.strip().startswith(f"File: {file_name}"):  # Start skipping from the matching file entry
                    skip = True
                    continue
                if skip and line.strip().startswith("Hash: "):  # Skip the hash entry
                    continue
                if skip and line.strip() == "-" * 100:  # Skip the separator line
                    skip = False
                    continue
                f.write(line)  # Write all other lines back to the file

        print("-" * 100)
        print(f"\nThe hash entry for '{file_name}' was removed from {hash_values}.\n")
        print("-"*100)