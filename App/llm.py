'''
File: llm.py
Authors: Antonio Sousa Jr(Team Lead), Matthew Greeson, Goncalo Felix, Antonio Morais, Dylan Ricci, Ryan Medeiros
Affiliation: University of Massachusetts Dartmouth
Course: CIS 498 & 499 (Senior Capstone Project)
Ownership: Rite-Solutions, Inc. 
Client/Stakeholder: Brandon Carvhalo  
Date: 2025-4-25
Project Description: This code utilizes Ollama as our LLM and a Retrieval-Augmented Generation (RAG) approach to take documents from a specifc directory, load them and then
             split the documents into texts and store it into a local database using Milvus Lite. Once stored the user then asks a questions which retrieves the most
             relevant documents and the LLM generates a response as best as it can.  

'''

# Import the threading module to handle multi-threading
import threading
# Import os and time modules for file handling and timing
import os, time
# Import hashing functionality from llm_features module
from llm_features import hashing
# Import vector database functionality from llm_features module
from llm_features import vector_db
# Import the Observer class from watchdog for file system monitoring
from watchdog.observers import Observer # type: ignore
# Import FileSystemEventHandler class from watchdog for handling file system events
from watchdog.events import FileSystemEventHandler # type: ignore
# Import necessary classes for using the Ollama language model and embeddings
from langchain_ollama import OllamaLLM, OllamaEmbeddings
# Import document loader classes from langchain_community for various document formats
from langchain_community.document_loaders import DirectoryLoader, TextLoader, CSVLoader, UnstructuredPDFLoader, UnstructuredWordDocumentLoader, UnstructuredPowerPointLoader
# Import text splitter to split documents into smaller chunks
from langchain_text_splitters import RecursiveCharacterTextSplitter
# Import Document schema class from langchain
from langchain.schema import Document
# Import Milvus from langchain_milvus for managing vector databases
from langchain_milvus import Milvus # type: ignore
# Import VectorStoreRetriever from langchain.vectorstores to query the vector store
from langchain.vectorstores.base import VectorStoreRetriever

# Start a timer to track the total execution time of the code
start = time.time()
lock = threading.Lock()

# Function to split documents into smaller chunks
def split_text(docs: list[Document]) -> list[Document]:
    # Initialize the RecursiveCharacterTextSplitter with parameters for chunk size and overlap
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=600, chunk_overlap=200, add_start_index=True
    )
    # Split the documents into chunks
    splits = text_splitter.split_documents(docs)
    return splits

# Function to create a retriever from a vector store
def create_retriever(vector_store: Milvus) -> VectorStoreRetriever:
    # Create and return the retriever for querying the vector store
    retriever = vector_store.as_retriever(search_type="similarity", search_kwargs={"k": 15})
    return retriever

# Function to retrieve relevant documents using the retriever
def retrieve_docs(retriever: VectorStoreRetriever, question: str) -> list[Document]:
    # Retrieve and return the top 15 documents relevant to the user's question
    search_results = retriever.invoke(question, k=15)
    return search_results

# Function to check if any new files have been added to the directory
def check_dir():
    # Return nothing for now, it's a placeholder function
    return 

# Function to prompt the user for a question
def get_user_question() -> str:
    # Print options for the user to interact with the program
    print("\nPlease Enter A Question Below, Or One Of The Commands Listed: \n")
    print("-"*100)
    print("1.) Type 'EXIT' to exit the program!")
    print("2.) Type 'DELETE' to delete the database!")
    print("3.) Type 'CLEAR' to clear the document directory!")
    print("4.) Type 'INFO' to get information regarding the program!")
    print("\n"+ "-"*100)
    # Get the user's input and return it
    question = input(f"What would you like to ask? \n")
    print("\n"+"-"*100)
    return question

# Create a prompt
def create_prompt(retrieved_docs: list[Document], question: str, prevAnswer: str, prevQuestion) -> str:
    prompt = "You are an assistant for question-answering tasks. Use the following pieces of retrieved context to answer the question. Use five sentences maximum and keep the answer concise. Use the previous question and answer if requested by the user.  \n"
    
    Question = "Question: " + question + "\n"

    Context_str = "Context: \n\n"

    prevQuestion = "Previous Question asked of you: " + prevQuestion + "\n"
    prevAnswer = "Previous Answer you provided the user: " + prevAnswer + "\n"


    for i in retrieved_docs:
        Context_str += i.page_content + "\n\n"

    #Comment out when done
    #print("***THIS IS THE CONTEXT***")
    #print(Context_str)
    #print("***THIS IS THE CONTEXT***")

    Answer = "Answer: "

    final_prompt = prompt + Question + Context_str + prevQuestion + prevAnswer + Answer

    return final_prompt

# Create a prompt
def create_prompt2(retrieved_docs: list[Document], llm1_context: str, question: str, prevAnswer: str, prevQuestion: str) -> str:
    prompt = "You are an assistant for question-answering tasks. Use the following pieces of retrieved context to answer the question. Use five sentences maximum and keep the answer concise. Use the previous question and answer if requested by the user. \n"    
    Question = "Question: " + question + "\n"

    Context_str = "Context: \n\n"


    for i in retrieved_docs:
        Context_str += i.page_content + "\n\n"

    #Comment out when done
    #print("***THIS IS THE CONTEXT***")
    #print(Context_str)
    #print("***THIS IS THE CONTEXT***")

    llm1_context = "This is an answer generated by another LLM, try to use this to make a better and more insightful response: " + llm1_context + "\n"
   
    #Comment out when done
    #print("***THIS IS THE 1st LLM***")
    #print(llma1_context)
    #print("***THIS IS THE 1st LLM***")
    prevQuestion = "If needed, this is the previous question asked of you: " + prevQuestion + "\n"
    prevAnswer = "If needed, this is the previous answer you provided the user: " + prevAnswer + "\n"
    
    #Comment out when done
    #print("***")
    #print("Previous question" + prevQuestion)
    #print("previous answer" + prevAnswer)
    #print("***")
    

    Answer = "Answer: "

    final_prompt = prompt + Question + Context_str + llm1_context + prevQuestion + prevAnswer + Answer

    #Comment out when done
    #print("***THIS IS THE 1st LLM***")
    #print("What the Final LLM should see \n" + final_prompt)
    #print("***THIS IS THE 1st LLM***")

    return final_prompt

# Function to query the LLM with the created prompt and return the answer
def get_answer(llm: OllamaLLM, prompt: str) -> str:
    # Get the answer from the LLM
    answer = llm.invoke(prompt)
    return answer

# Function to save the generated answer to a file
def save_answer_to_file(output_file2: str, answer: str):
    # Open the file for writing
    with open(output_file2, "w") as file:
        # Split the answer into sentences and clean each one before writing
        sentences = answer.strip().split(".")
        for sentence in sentences:
            cleaned_sentence = sentence.strip()
            if cleaned_sentence:
                file.write(cleaned_sentence + ".\n")


# Function to get the current files in the specified directory
def get_files_in_directory(document_path: set) -> set:
    # Return a set of files in the given directory
    return set(os.listdir(document_path))

# Function to clear all files in the specified directory
def clear_directory(directory_path):
    # Iterate over all files in the directory and remove them
    for filename in os.listdir(directory_path):
        file_path = os.path.join(directory_path, filename)
        if os.path.isfile(file_path):
            os.remove(file_path)

# Function to start the file observer to detect new files in the directory
def start_observer(document_path, new_files, hash_set, vector_store, hash_values):
    # Create a file system event handler
    event_handler = FileSystemEventHandler()
    # Assign the on_created function to handle new file creation events
    event_handler.on_created = lambda event: on_created(event, new_files, document_path, hash_set, vector_store, hash_values)
    # Initialize the observer to watch the directory for changes
    observer = Observer()
    # Schedule the event handler to monitor the directory
    observer.schedule(event_handler, document_path, recursive=False)
    observer.start()
    try:
        observer.join()
    except KeyboardInterrupt:
        # Stop the observer if interrupted
        observer.stop()
        observer.join()

# Function to start the observer in a separate thread to monitor file creation
def start_observer_thread(document_path, new_files, hash_set, vector_store, hash_values):
    # Start the observer in a new thread
    observer_thread = threading.Thread(target=start_observer, args=(document_path, new_files, hash_set, vector_store, hash_values), daemon=True)
    observer_thread.start()

# Function to handle the creation of new files in the directory
def on_created(event, new_files, document_path, hash_set, vector_store, hash_values):
    # Check if the event is not a directory creation
    if not event.is_directory:
        with lock:
            # Get the file name from the event
            filename = os.path.basename(event.src_path)
            # Proceed only if this file is new
            if filename not in new_files:
                new_timer = time.time()
                print("\n" + "-" * 100)
                print(f"\nNew file detected: {filename}\n")
                print("-" * 100)
                new_files.add(filename)
                # Compute the file hash and compare it
                file_hash = hashing.compute_file_hash_value(filename, document_path)
                if file_hash and filename not in hash_set:
                    hash_set[filename] = file_hash
                    with open(hash_values, 'a') as f:
                        f.write(f"File: {filename}\nHash: {file_hash}\n")
                        f.write("-" * 100 + "\n")
                    hashing.compare_hash_values(hash_set)
                    # Load the new document and split it into chunks
                    new_docs = vector_db.load_new_docs([filename], document_path)
                    new_splits = split_text(new_docs)
                    print("-" * 100)
                    print("\nGenerating new embeddings, this may take a while!\n")
                    print("-" * 100)
                    # Add the new embeddings to the vector store
                    vector_db.add_to_milvus_db(new_splits, vector_store)
                    new_end = time.time()
                    elapsed_time = new_end - new_timer
                    print(f"\nTime taken: {elapsed_time:.2f} seconds\n")
                    print("-" * 80)
                    print("\nPlease Enter A Question Below, Or One Of The Commands Listed: \n")
                    print("-"*100)
                    print("1.) Type 'EXIT' to exit the program!")
                    print("2.) Type 'DELETE' to delete the database!")
                    print("3.) Type 'CLEAR' to clear the document directory!")
                    print("4.) Type 'INFO' to get information regarding the program!")
                    print("\n"+ "-"*100)
                    print("What would you like to ask?")

# Main function to run the program
def main():  
    # Start a timer to track the execution time
    start = time.time()

    
    # Define paths for documents, database, and result files
    document_path = "./documents"
    db_path = "./database/Milvus_Lite.db"
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
    print(f"\nUsing Ollama server at: {ollama_server_url}")
    print("-" * 100)

    # Initialize the Ollama LLM and DeepSeek LLM and embeddings

    llm2 = OllamaLLM(model=llama_model, base_url=ollama_server_url)
    llama_embeddings2 = OllamaEmbeddings(model=llama_model, base_url=ollama_server_url)

    #**** Testing ****
    llm1 = OllamaLLM(model=deepseek_model, base_url=ollama_server_url)
    llama_embeddings = OllamaEmbeddings(model=deepseek_model, base_url=ollama_server_url)

    # Create a hash set to store file hashes
    hash_set = hashing.create_hashset()
    # Get initial files in the directory
    initial_files = get_files_in_directory(document_path)
    # Convert initial files to a set for easy comparison
    new_files = set(initial_files)

    # If there are existing files, generate hash values for them
    if new_files:
        print("\nGenerating hash values for existing files!\n")
        print("-" * 100)
        with open(hash_values, 'w') as f:
            for file_path in new_files:
                file_hash = hashing.compute_file_hash_value(file_path, document_path)
                if file_hash and file_path not in hash_set:
                    hash_set[file_path] = file_hash
                    f.write(f"File: {file_path}\nHash: {file_hash}\n")
                    f.write("-" * 100 + "\n")
        hashing.compare_hash_values(hash_set)
    else:
        print("\nNo new documents to generate hash values for!\n")
        print("-" * 100)

    # Check if the database exists
    if os.path.exists(db_path):
        print(f"\nThe path {db_path} exists!\n")
        print("-" * 100)
    else:
        print(f"\nThe path {db_path} does not exist, creating Milvus Lite database now!!\n")
        print("-" * 100)
        # Load documents and create the vector store if the database does not exist
        docs = vector_db.load_docs(document_path)
        splits = split_text(docs)
        print("\nGenerating embeddings, this may take a while!\n")
        print("-" * 100)
        vector_db.create_milvus_db(splits, llama_embeddings, db_path)

    # Track the elapsed time for the setup
    end = time.time()
    elapsed_time = end - start
    print(f"\nTime taken: {elapsed_time:.2f} seconds\n")
    print("-" * 100)

    # Load the vector store and initialize the retriever
    vector_store = vector_db.load_milvus_db(llama_embeddings, db_path)
    retriever = create_retriever(vector_store)

    # Start the file observer thread
    start_observer_thread(document_path, new_files, hash_set, vector_store, hash_values)

    # Enter a loop to allow the user to ask questions
    while True:
        # Get a question from the user
        question = get_user_question()
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
            clear_directory(document_path)
            print("\nNo documents are in the document directory!\n")
            print("-"*100)
            continue
        elif question.upper() == "INFO":
            # Provide info if requested by the user
            print("\nNo info yet sorry!\n")
            print("-"*100)
            continue

        # Retrieve documents and generate the answer
        retrieved_docs = retrieve_docs(retriever, question)

        # DeepSeek model prompt and answer generation
        prompt = create_prompt(retrieved_docs, question, previousAnswer, previousQuestion)
        answer = get_answer(llm1, prompt)

        # Save the answer to a file (DeepSeeks response) 
        save_answer_to_file(output_file, answer)
        # Print a message confirming that the answer has been saved
        print(f"\nDeepSeeks response has been saved to {output_file}\n")
        print("-"*100)
        # LlaMa Model prompt and answer generation
        prompt2 = create_prompt2(retrieved_docs,answer,question,previousAnswer, previousQuestion)
        answer2 = get_answer(llm2, prompt2)

        # store answer to save
        previousAnswer = answer2
        previousQuestion = question
        
        # Final answer
        save_answer_to_file(output_file_2, answer2)

         # Print a message confirming that the answer has been saved
        print(f"\nFinal answer has been saved to {output_file_2}\n")
        print("-"*100)

       

# Run the main function to start the program
main()