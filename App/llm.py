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

# Import necessary libraries for multi-threading, file handling, and LangChain functionality
import os, time, threading
import llm_package.watchdog_observer as watchdog_observer
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler 
from llm_package import hashing, vector_db, text_splitter  # Import hashing and vector database functions from the llm_features module
from langchain_ollama import OllamaLLM, OllamaEmbeddings  # For using the Ollama language model
from langchain_community.document_loaders import (
    DirectoryLoader, TextLoader, CSVLoader, 
    UnstructuredPDFLoader, UnstructuredWordDocumentLoader, UnstructuredPowerPointLoader
)  # For loading documents of different formats
from langchain_text_splitters import RecursiveCharacterTextSplitter  # For splitting documents into chunks
from langchain.schema import Document  # Document schema class
from langchain_milvus import Milvus # For managing vector databases
from langchain.vectorstores.base import VectorStoreRetriever  # For querying vector stores
from ragas import EvaluationDataset, evaluate, SingleTurnSample
from ragas.metrics import LLMContextPrecisionWithoutReference, Faithfulness, ResponseRelevancy
from ragas.llms import LangchainLLMWrapper
from ragas.embeddings import LangchainEmbeddingsWrapper

# Start a timer to track total execution time of the code
start = time.time()

# Function to create a retriever for querying the vector store
def create_retriever(vector_store: Milvus) -> VectorStoreRetriever:
    retriever = vector_store.as_retriever(search_type="similarity", search_kwargs={"k": 3})
    return retriever

# Function to retrieve relevant documents based on a user's query
def retrieve_docs(retriever: VectorStoreRetriever, question: str) -> list[Document]:
    search_results = retriever.invoke(question, k=15)  # Retrieve top 15 relevant documents
    return search_results


# Function to prompt the user for a question
def get_user_question() -> str:
    print("\nPlease Enter A Question Below, Or One Of The Commands Listed: \n")
    print("-"*100)
    print("1.) Type 'EXIT' to exit the program!")
    print("2.) Type 'DELETE' to delete the database!")
    print("3.) Type 'CLEAR' to clear the document directory!")
    print("4.) Type 'INFO' to get information regarding the program!")
    print("5.) Type 'DELETEDATA' to delete vector embeddings!")
    print("\n"+ "-"*100)
    question = input(f"What would you like to ask? \n")  # Prompt for user input
    print("\n"+"-"*100)
    return question

# Function to create a detailed prompt with context for the LLM
def create_prompt(retrieved_docs: list[Document], question: str, prevAnswer: str, prevQuestion: str) -> str:
    prompt = "You are an assistant for question-answering tasks. Use the following pieces of retrieved context to answer the question. Use five sentences maximum and keep the answer concise. Use the previous question and answer if requested by the user.  \n"
    
    # Format the question, context, and previous interactions
    Question = "Question: " + question + "\n"
    Context_str = "Context: \n\n"
    prevQuestion = "Previous Question asked of you: " + prevQuestion + "\n"
    prevAnswer = "Previous Answer you provided the user: " + prevAnswer + "\n"

    # Add the context from the retrieved documents to the prompt
    for i in retrieved_docs:
        Context_str += i.page_content + "\n\n"

    Answer = "Answer: "
    final_prompt = prompt + Question + Context_str + prevQuestion + prevAnswer + Answer

    return final_prompt

# Alternative prompt creation function with an additional LLM context
def create_prompt2(retrieved_docs: list[Document], llm1_context: str, question: str, prevAnswer: str, prevQuestion: str) -> str:
    prompt = "You are an assistant for question-answering tasks. Use the following pieces of retrieved context to answer the question. Use five sentences maximum and keep the answer concise. Use the previous question and answer if requested by the user. \n"    
    Question = "Question: " + question + "\n"
    Context_str = "Context: \n\n"

    # Add the context from the retrieved documents to the prompt
    for i in retrieved_docs:
        Context_str += i.page_content + "\n\n"

    # Add the additional LLM context
    llm1_context = "This is an answer generated by another LLM, try to use this to make a better and more insightful response: " + llm1_context + "\n"
   
    prevQuestion = "If needed, this is the previous question asked of you: " + prevQuestion + "\n"
    prevAnswer = "If needed, this is the previous answer you provided the user: " + prevAnswer + "\n"
    
    Answer = "Answer: "
    final_prompt = prompt + Question + Context_str + llm1_context + prevQuestion + prevAnswer + Answer

    return final_prompt

# Function to query the LLM with the generated prompt and return the answer
def get_answer(llm: OllamaLLM, prompt: str) -> str:
    answer = llm.invoke(prompt)  # Get the answer from the LLM
    return answer

# Function to save the generated answer to a file
def save_answer_to_file(output_file2: str, answer: str):
    """
    Saves the answer to a file, splitting it into sentences and cleaning each one before writing.
    """
    with open(output_file2, "w") as file:
        sentences = answer.strip().split(".")  # Split answer into sentences
        for sentence in sentences:
            cleaned_sentence = sentence.strip()
            if cleaned_sentence:  # Ensure the sentence is not empty
                file.write(cleaned_sentence + ".\n")  # Write each sentence to the file

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

    print("\nGenerating new embeddings, this may take a while!\n")
    print("-" * 100)

# Function to set up and run Watchdog
# Watchdog function to run in a background thread
def run_watchdog(path, file_added_event, new_files, document_path, hash_set, hash_values, vector_store):
    event_handler = watchdog_observer.MyHandler(file_added_event, new_files, document_path, hash_set, hash_values, vector_store)
    observer = Observer()
    observer.schedule(event_handler, path, recursive=True)
    observer.start()
    
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
        print("\nWatchdog stopped.")
    observer.join()

def eval(question: str, retrived_docs: list[Document], answer: str, llm: OllamaLLM, llm_embeddings: OllamaEmbeddings) -> EvaluationDataset:

    evaluator_llm = LangchainLLMWrapper(llm)
    gen_embeddings = LangchainEmbeddingsWrapper(llm_embeddings)

    sample = SingleTurnSample(
        user_input=question,
        response=answer,
        retrieved_contexts=[doc.page_content for doc in retrived_docs]
    )

    dataset = EvaluationDataset(samples=[sample])

    #Context Precision is a metric that measures the proportion of relevant chunks in the retrieved_contexts
    #The Faithfulness metric measures how factually consistent a response is with the retrieved context
    #The ResponseRelevancy metric measures how relevant a response is to the user input

    result = evaluate(dataset=dataset,
                      metrics=[LLMContextPrecisionWithoutReference(), Faithfulness(), ResponseRelevancy()],
                      llm=evaluator_llm,
                      embeddings=gen_embeddings
                      )
    
    return result


# Main function to run the program
def main():  

    # Define paths for documents, database, and result files
    directory_to_watch = "documents"  # Replace with the directory you want to monitor
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
    initial_files = get_files_in_directory(document_path)
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
    retriever = create_retriever(vector_store)

     # Create an Event object for synchronization
    file_added_event = threading.Event()

    # Start the watchdog in a separate thread to monitor file changes
    watchdog_thread = threading.Thread(target=run_watchdog, args=(directory_to_watch, file_added_event, new_files, document_path, hash_set, hash_values, vector_store))
    watchdog_thread.daemon = True  # Ensure the thread stops when the main program exits
    watchdog_thread.start()

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
        elif question.upper() == "DELETEDATA":
            vector_db.milvus_delete_entry(llama_embeddings, db_path)
            continue

        # Retrieve documents and generate the answer
        retrieved_docs = retrieve_docs(retriever, question)

        # DeepSeek model prompt and answer generation
        prompt = create_prompt(retrieved_docs, question, previousAnswer, previousQuestion)
        answer = get_answer(llm1, prompt)

        # Save the answer to a file (DeepSeek's response) 
        save_answer_to_file(output_file, answer)
        print(f"\nDeepSeek's response has been saved to {output_file}\n")
        print("-"*100)

        # Llama Model prompt and answer generation
        prompt2 = create_prompt2(retrieved_docs, answer, question, previousAnswer, previousQuestion)
        answer2 = get_answer(llm2, prompt2)

        # Store the answer for future reference
        previousAnswer = answer2
        previousQuestion = question
        
        # Final answer
        save_answer_to_file(output_file_2, answer2)

        # Confirm the final answer has been saved
        print(f"\nFinal answer has been saved to {output_file_2}\n")
        print("-"*100)
        print(eval(question=question, retrived_docs=retrieved_docs, answer=answer, llm=llm2, llm_embeddings=llama_embeddings))

# Run the main function to start the program
main()