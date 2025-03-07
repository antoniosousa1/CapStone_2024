from watchdog.events import FileSystemEventHandler # type: ignore
from llm_package.hashing import Hashing
from llm_package.vector_db import VectorDatabase 
from llm_package.text_splitter import TextSplitter
import time, os

vector_db = VectorDatabase()
text_splitter = TextSplitter()
hashing = Hashing()

# Define the watchdog handler class
class Watchdog(FileSystemEventHandler):
    
    def __init__(self, file_added_event, new_files, document_path, hash_set, hash_values, vector_store):
        self.file_added_event = file_added_event  # Event to signal new file addition
        self.new_files = new_files
        self.document_path = document_path
        self.hash_set = hash_set
        self.hash_values = hash_values
        self.vector_store = vector_store
        self.vector_db = vector_db

    def on_modified(self, event):
        if event.is_directory:
            return  # Ignore directory modifications
        print(f"File modified: {event.src_path}")
        
    def on_created(self, event):
        if event.is_directory:
            return  # Ignore directory creations
        # Get the file name from the event
        filename = os.path.basename(event.src_path)

        # Proceed only if this file is new
        if filename not in self.new_files:
            new_timer = time.time()
            print("\n" + "-" * 100)
            print(f"\nNew file detected: {filename}\n")
            print("-" * 100)

            self.new_files.add(filename)
            
            # Compute the file hash and compare it
            file_hash = hashing.compute_file_hash_value(filename, self.document_path)
            if file_hash and filename not in self.hash_set:
                self.hash_set[filename] = file_hash
                with open(self.hash_values, 'a') as f:
                    f.write(f"File: {filename}\nHash: {file_hash}\n")
                    f.write("-" * 100 + "\n")
                hashing.compare_hash_values(self.hash_set, self.document_path, self.hash_values)

                # Load the new document and split it into chunks
                new_docs = vector_db.load_new_docs([filename], self.document_path)
                new_splits = text_splitter.split_text(new_docs)
                print("-" * 100)
                print("\nGenerating new embeddings, this may take a while!\n")
                print("-" * 100)

                # Add the new embeddings to the vector store
                vector_db.add_to_milvus_db(new_splits, self.vector_store)
                new_end = time.time()
                elapsed_time = new_end - new_timer
                vector_db.update_list(self.vector_store)
                print(f"\nTime taken to generate embeddings: {elapsed_time:.2f} seconds\n")
                print("-" * 80)
                print("\nPlease Enter A Question Below, Or One Of The Commands Listed: \n")
                print("-"*100)
                print("1.) Type 'EXIT' to exit the program!")
                print("2.) Type 'DELETE' to delete the database!")
                print("3.) Type 'CLEAR' to clear the document directory!")
                print("4.) Type 'INFO' to get information regarding the program!")
                print("5.) Type 'DELETEDATA' to delete vector embeddings!")
                print("\n"+ "-"*100)
                print("What would you like to ask?")

                self.file_added_event.set()  # Reset the event flag after file is processed
