from llm_package.rag import Rag
from llm_package.hashing import Hashing
from llm_package.vector_db import VectorDatabase
from llm_package.text_splitter import TextSplitter
from llm_package.watchdog_observer import Watchdog
from langchain_ollama import OllamaEmbeddings, OllamaLLM


import os, time, threading

rag = Rag()
hashing = Hashing()
vector_db = VectorDatabase()
text_splitter = TextSplitter()


# Define paths for documents, database, and result files
directory_to_watch = "./data/documents"  # Replace with the directory you want to monitor
document_path = "./data/documents"
db_path = "./data/database/Milvus_Lite.db"
output_file = "./results/LLM1_response_debugging.txt"
output_file_2 = "./results/User_Answer.txt"
previousAnswer = ""
previousQuestion = ""
hash_values = "./results/hash_values.txt"


# Create or clear the hash values file
with open(hash_values, "w") as f:
    pass

# Get the Ollama server URL and model name
ollama_server_url = os.getenv("OLLAMA_SERVER_URL")
llama_model = "llama3.1:70b"
deepseek_model = "deepseek-r1:70b"

# Print the Ollama server URL being used
print(f"\nUsing Ollama server at: {ollama_server_url}\n")
print("-" * 100)

# Initialize the Ollama LLM and DeepSeek LLM and embeddings
llm2 = OllamaLLM(model=llama_model, base_url=ollama_server_url)
llama_embeddings2 = OllamaEmbeddings(model=llama_model, base_url=ollama_server_url)
llm1 = OllamaLLM(model=deepseek_model, base_url=ollama_server_url)
llama_embeddings = OllamaEmbeddings(model=deepseek_model, base_url=ollama_server_url)

# Create a hash set to store file hashes
hash_set = hashing.create_hashset()
# Get initial files in the directory
initial_files = rag.get_files_in_directory(document_path)
# Convert initial files to a set for easy comparison
new_files = set(initial_files)

# If there are existing files, generate hash values for them
if new_files:
    print("\nGenerating hash values for existing files!\n")
    print("-"*100)
    with open(hash_values, 'w') as f:
        for file_path in new_files:
            file_hash = hashing.compute_file_hash_value(file_path, document_path)
            if file_hash and file_path not in hash_set:
                hash_set[file_path] = file_hash
                f.write(f"File: {file_path}\nHash: {file_hash}\n")
                f.write("-" * 100 + "\n")
    hashing.compare_hash_values(hash_set, document_path, hash_values)
else:
    print("\nNo new documents to generate hash values for!\n")
    print("-" * 100)

# Check if the database exists
if os.path.exists(db_path):
    print(f"\nThe path {db_path} exists!\n")
    # Check if any new files exist
else:
    print(f"\nThe path {db_path} does not exist, creating Milvus Lite database now!!\n")
    print("-" * 100)
    start = time.time()
    # Load documents and create the vector store if the database does not exist
    docs = vector_db.load_docs(document_path)
    splits = text_splitter.split_text(docs)
    # Start a timer to track the execution time

    print("\nGenerating embeddings, this may take a while!\n")
    print("-" * 100)
    vector_db.create_milvus_db(splits, llama_embeddings, db_path)
    # Track the elapsed time for the setup
    end = time.time()
    elapsed_time = end - start
    print(f"\nTime taken to generate embeddings: {elapsed_time:.2f} seconds\n")

print("-" * 100)

# Load the vector store and initialize the retriever
vector_store = vector_db.load_milvus_db(llama_embeddings, db_path)
retriever = rag.create_retriever(vector_store)

# Create an Event object for synchronization
     # Create an Event object for synchronization
file_added_event = threading.Event()

# Start the watchdog in a separate thread to monitor file changes
watchdog_thread = threading.Thread(target=rag.run_watchdog, args=(directory_to_watch, file_added_event, new_files, document_path, hash_set, hash_values, vector_store))
watchdog_thread.daemon = True  # Ensure the thread stops when the main program exits
watchdog_thread.start()


# Enter a loop to allow the user to ask questions
while True:

    # Get a question from the user
    question = rag.get_user_question()
    if previousAnswer == None:
        previousAnswer = "No previous answer, please ignore this prompt"
    
    if previousQuestion == None:
        previousQuestion = "No previous question, please ignore this prompt"

    if question.upper() == "EXIT":
        # Exit the program if the user types 'EXIT'
        print("\nExiting Code!\n")
        print("-"*100)
        break
    elif question.upper() == "DELETE":
        # Prompt the user to confirm deletion of the database
        print("\nDO YOU WISH TO DELETE THE DATABASE? (This process is irreversible!)\n")
        print("-"*100)
        response = input(f"YES or NO? ").strip().upper()
        if response == "YES":
            # Delete the database if confirmed
            vector_db.delete_milvus_db(db_path)
            print("-"*100)
            print("\nDatabase has been deleted, exiting code!\n")
            print("-"*100)
            break
        elif response == "NO":
            print("\nDatabase still exists! :)")
            continue
    elif question.upper() == "CLEAR":
        # Clear the document directory if the user types 'CLEAR'
        print("\nClearing the document directory!\n")
        print("-"*100)
        rag.clear_directory(document_path)
        print("\nNo documents are in the document directory!\n")
        print("-"*100)
        continue
    elif question.upper() == "INFO":
        # Provide info if requested by the user
        print("\nNo info yet sorry!\n")
        print("-"*100)
        continue
    elif question.upper() == "DELETEDATA":
        vector_db.milvus_delete_entry(llama_embeddings, db_path)
        continue

    # Retrieve documents and generate the answer
    retrieved_docs = rag.retrieve_docs(retriever, question)

    # DeepSeek model prompt and answer generation
    prompt = rag.create_prompt(retrieved_docs, question, previousAnswer, previousQuestion)
    answer = rag.get_answer(llm1, prompt)

    # Save the answer to a file (DeepSeek's response) 
    rag.save_answer_to_file(output_file, answer)
    print(f"\nDeepSeek's response has been saved to {output_file}\n")
    print("-"*100)

    # Llama Model prompt and answer generation
    prompt2 = rag.create_prompt2(retrieved_docs, answer, question, previousAnswer, previousQuestion)
    answer2 = rag.get_answer(llm2, prompt2)

    # Store the answer for future reference
    previousAnswer = answer2
    previousQuestion = question
    
    # Final answer
    rag.save_answer_to_file(output_file_2, answer2)

    # Confirm the final answer has been saved
    print(f"\nFinal answer has been saved to {output_file_2}\n")
    print("-"*100)
    print(rag.eval(question=question, retrived_docs=retrieved_docs, answer=answer, llm=llm2, llm_embeddings=llama_embeddings))