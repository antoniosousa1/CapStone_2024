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
import os, time
from LLMfeatures import vector_db

from langchain_ollama import OllamaLLM, OllamaEmbeddings
from langchain_community.document_loaders import DirectoryLoader, TextLoader, CSVLoader, UnstructuredPDFLoader, UnstructuredWordDocumentLoader, UnstructuredPowerPointLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain.schema import Document
from langchain_milvus import Milvus # type: ignore
from langchain.vectorstores.base import VectorStoreRetriever

# Timer to check for the runtime of our code (Used for testing purposes)
start = time.time()

# splits docs into chunks
def split_text(docs: list[Document]) -> list[Document]:

    #
    text_splitter = RecursiveCharacterTextSplitter(
        #
        chunk_size=600, chunk_overlap=200, add_start_index=True
    )
    #
    splits = text_splitter.split_documents(docs)

    #
    return splits

# creates retriever
def create_retriever(vector_store: Milvus) -> VectorStoreRetriever:

    #
    retriever = vector_store.as_retriever(search_type="similarity", search_kwargs={"k": 15})

    #
    return retriever

# Retrieves the chunks relevant to the question using a retriever
def retrieve_docs(retriever: VectorStoreRetriever, question: str) -> list[Document]:

    # Use the retriever to search the vector database directly with the raw question text
    search_results = retriever.invoke(question, k=15)

    # Uncomment this code to check the returned docs by the line of code above
    # Check if no results were returned

    '''
    if not search_results:
        print("No documents retrieved!")
    else:
        for doc in search_results:
            print(f"Retrieved Doc: {doc.page_content}")
            print()
    '''
    
    #
    return search_results

# Gets the user question
def get_user_question() -> str:

    #
    print("Please Enter A Question Below, Or One Of The Commands Listed: ")
    print("-"*80)

    #
    print("1.) Type 'EXIT' to exit the program!")
    print("2.) Type 'DELETE' to delete the database!")
    print("-"*80)
    
    #
    question = input()
    print("-"*80)

    #
    return question

# Create a prompt
def create_prompt(retrieved_docs: list[Document], question: str) -> str:

    #
    prompt = "You are an assistant for question-answering tasks. Use the following pieces of retrieved context to answer the question. Generate two to three sentences only.\n"
    
    #
    Question = "Question: " + question + "\n"

    #
    Context_str = "Context: \n\n"

    #
    for i in retrieved_docs:
        Context_str += i.page_content + "\n\n"

    #
    Answer = "Answer: "

    #
    final_prompt = prompt + Question + Context_str + Answer

    #
    return final_prompt

# Print the response from the Ollama LLM that was given the formatted prompt
def get_answer(llm: OllamaLLM, prompt: str) -> str:

    #
    answer = llm.invoke(prompt)

    #
    return answer

# Function that checks of the 
def save_answer_to_file(output_file: str, answer: str):

    # Split the answer into sentences based only on periods
    with open(output_file, "w") as file:

        # Split answer by periods for user readability 
        sentences = answer.strip().split(".")
        
        # Loop to write the sentences into the txt file
        for sentence in sentences:

            #
            cleaned_sentence = sentence.strip()  # Remove leading/trailing whitespace

            #
            if cleaned_sentence:  # Only write non-empty sentences

                #
                file.write(cleaned_sentence + ".\n")  # Add the period back


    #
    print(f"Your answer has been saved to {output_file}")
    print("-"*80)

# Function to get current files in the directory
def get_files_in_directory(data_path):

    #
    return set(os.listdir(data_path))

# Main function
def main():

    #
    data_path = "./data"
    #
    db_path = "./Milvus_Lite.db"
    #
    output_file = "User_Answer.txt"
    #
    ollama_server_url = os.getenv("OLLAMA_SERVER_URL")
    #
    llama_model = "llama3.1:70b"

    #
    print(f"Using Ollama server at: {ollama_server_url}")
    print("-" * 80)

    #
    llm = OllamaLLM(model=llama_model, base_url=ollama_server_url)
    #
    llama_embeddings = OllamaEmbeddings(model=llama_model, base_url=ollama_server_url)

    # Initialize file tracking
    initial_files = get_files_in_directory(data_path)

    # Start timer for elapsed time calculation
    start = time.time()

    #
    if os.path.exists(db_path):
        #
        print(f"The path {db_path} exists!")
        print("-" * 80)
    #
    else:
        # Load, split, and create the database if it doesn't exist
        print(f"The path {db_path} does not exist, creating Milvus Lite database now...")
        print("-"*80)

        #
        docs = vector_db.load_docs(data_path)
        print("load_docs: PASSED")

        #
        splits = split_text(docs)
        print("split_text: PASSED")

        print("-"*80)
        print("Generating Embeddings...")
        print("-"*80)

        #
        vector_db.create_milvus_db(splits, llama_embeddings, db_path)
        print("create_milvus_db: PASSED")
       

    # Load the existing database into the vector store
    vector_store = vector_db.load_milvus_db(llama_embeddings, db_path)
    print("load_db: PASSED")

    #
    retriever = create_retriever(vector_store)
    print("create_retriever: PASSED")

    # Calculate elapsed time
    end = time.time()
    elapsed_time = end - start
    print("-" * 80)
    print(f"Time taken: {elapsed_time:.2f} seconds")
    print("-" * 80)

    # While loop to ask the user multiple questions
    while True:
        
        #
        current_files = get_files_in_directory(data_path)

        #
        new_files = current_files - initial_files  # Detect any new files  by taking the current_files after the user asks a question and then subtract from the initial files

        # Check if a new file has been added to the directory
        if new_files:
            # Timer to check for the runtime of our code (Used for testing purposes)
            start2 = time.time()

            #
            print(f"New Files Detected: {new_files}")
            print("-" * 80)

            # Initialize a list for any new documents that get added after runtime 
            new_docs = vector_db.load_new_docs(new_files, data_path)
            print("-"*80)
            print("load_new_docs: PASSED")

            #
            new_splits = split_text(new_docs)
            print("new_split_text: PASSED")
            print("-"*80)
            print("Currently adding the embeddings into the database...")
            print("-"*80)

            # Adds any new split texts to the milvus lite database
            vector_db.add_to_milvus_db(new_splits, vector_store )
            print("add_to_milvus_db: PASSED")
            print("-"*80)

            # Update initial_files to include the new files
            initial_files = current_files  # Update the list to track the newly added files

            # Calculate elapsed time
            end2 = time.time()
            elapsed_time2 = end2 - start2
            print(f"Time taken: {elapsed_time2:.2f} seconds")
            print("-" * 80)
        #
        else:
            print("No new files have been added!")
            print("-" * 80)

        # Get user question for retrieval
        question = get_user_question()
        print("get_user_question: PASSED")

        #
        if question.upper() == "EXIT":
            print("-" * 80)
            print("Exiting Code!")
            print("-" * 80)

            #
            break

        #
        elif question.upper() == "DELETE":
            print("DO YOU WISH TO DELETE THE DATABASE(YES/NO)?")

            #
            response = input()

            #
            if response.upper() == "YES":
                #
                vector_db.delete_milvus_db(db_path)
                print("-" * 80)
                print("Database has been deleted, Exiting code!")
                #
                break

            #
            elif response.upper() == "NO":
                print("Database still exists :)")
                #
                continue

        # Perform retrieval and answering based on the question
        retrieved_docs = retrieve_docs(retriever, question)
        print("retrieve_docs: PASSED")

        #
        prompt = create_prompt(retrieved_docs, question)
        print("create_prompt: PASSED")

        #
        answer = get_answer(llm, prompt)
        print("get_answer: PASSED")

        print("-" * 80)

        # Save the answer to a file
        save_answer_to_file(output_file, answer)

# Runs the main function to execute other functions
main()