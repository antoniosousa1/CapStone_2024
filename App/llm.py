'''
File: llm.py
Authors: Antonio Sousa Jr(Team Lead), Matthew Greeson, Goncalo Felix, Antonio Morais, Dylan Ricci, Ryan Medeiros
Affiliation: University of Massachusetts Dartmouth
Course: CIS 498 & 499 (Senior Capstone Project)
Ownership: Rite-Solutions, Inc. 
Client/Stakeholder: Brandon Carvhalo  
Date: 2024-12-01
Description: This code utilizes Ollama as our LLM and a Retrieval-Augmented Generation (RAG) approach to take documents from a specifc directory, load them and then
             split the documents into texts and store it into a local database using Milvus Lite. Once stored the user then asks a questions which retrieves the most
             relevant documents and the LLM generates a response as best as it can.  

'''

from langchain_ollama import OllamaLLM, OllamaEmbeddings
from langchain_community.document_loaders import DirectoryLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain.schema import Document
from langchain_milvus import Milvus # type: ignore
from langchain.vectorstores.base import VectorStoreRetriever

from ragas import EvaluationDataset, evaluate, SingleTurnSample
from ragas.metrics import LLMContextPrecisionWithoutReference, Faithfulness, ResponseRelevancy
from ragas.llms import LangchainLLMWrapper
from ragas.embeddings import LangchainEmbeddingsWrapper

import os, time

# Timer to check for the runtime of our code (Used for testing purposes)
start = time.time()

# Function that will check if the database exists and delete it, takes in the path of the locally created database
def delete_milvus_db(db_path: str):

    # Checks if the milvus database already exists, if it does delete it. 
    if os.path.exists(db_path):
        os.remove(db_path)
        print("delete_milvus_db: PASSED")
        time.sleep(2)

# Loads the data into usable docs
def load_docs(data_path: str) -> list[Document]:
    loader = DirectoryLoader(path=data_path)
    docs = loader.load()
    return docs

# splits docs into chunks
def split_text(docs: list[Document]) -> list[Document]:
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=512, chunk_overlap=90, add_start_index=True
    )
    splits = text_splitter.split_documents(docs)
    return splits

# creates vector database with llama embeddings
def create_milvus_db(splits: list[Document], llama_embeddings: OllamaEmbeddings, db_path: str) -> Milvus:
   
    text_splits = [doc.page_content for doc in splits]

    vector_db = Milvus(
        embedding_function=llama_embeddings,
        connection_args={"uri": db_path},
        collection_name="DataCollection",
    )
   
    ids = [str(i) for i in range(len(text_splits))]
   
    vector_db.add_texts(texts=text_splits, ids=ids)

    return vector_db

# Load the db and its contents 
def load_milvus_db(llama_embeddings: OllamaEmbeddings, db_path: str) -> Milvus:
     

     vector_store_loaded = Milvus(
        llama_embeddings,
        connection_args={"uri": db_path},
        collection_name="DataCollection",
    )
     
     return vector_store_loaded

# creates retriever
def create_retriever(vector_store: Milvus) -> VectorStoreRetriever:
    retriever = vector_store.as_retriever(search_type="similarity", search_kwargs={"k": 3})
    return retriever

# Retrieves the chunks relevant to the question using a retriever
def retrieve_docs(retriever: VectorStoreRetriever, question: str) -> list[Document]:

    # Use the retriever to search the vector database directly with the raw question text
    search_results = retriever.invoke(question)

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

    return search_results

# Gets the user question
def get_user_question() -> str:
    print("Please enter a question: ")
    question = input()
    print("-"*40)

    return question

# Create a prompt
def create_prompt(retrieved_docs: list[Document], question: str) -> str:
    prompt = "You are an assistant for question-answering tasks. Use the following pieces of retrieved context to answer the question. Use five sentences maximum and keep the answer concise. If you don't know based on the given context, respond with I don't know.  \n"
    
    Question = "Question: " + question + "\n"

    Context_str = "Context: \n\n"

    for i in retrieved_docs:
        Context_str += i.page_content + "\n\n"

    Answer = "Answer: "

    final_prompt = prompt + Question + Context_str + Answer

    return final_prompt

# Print the response from the Ollama LLM that was given the formatted prompt
def get_answer(llm: OllamaLLM, prompt: str) -> str:
    answer = llm.invoke(prompt)
    return answer

# Function that checks of the 
def save_answer_to_file(output_file: str, answer: str):

    # Split the answer into sentences based only on periods
    with open(output_file, "w") as file:

        # Split answer by periods for user readability 
        sentences = answer.strip().split(".")
        
        # Loop to write the sentences into the txt file
        for sentence in sentences:
            cleaned_sentence = sentence.strip()  # Remove leading/trailing whitespace
            if cleaned_sentence:  # Only write non-empty sentences
                file.write(cleaned_sentence + ".\n")  # Add the period back

    print(f"Your answer has been saved to {output_file}")

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

# Main function
def main():

    data_path = "./data"

    # Sets the location where the db will be created and stored (Inside the App directory)
    db_path = "./mil_db/Milvus_Lite.db"

    # Save the answer to a text file
    output_file = "User_Answer.txt"
    ollama_server_url = os.getenv("OLLAMA_SERVER_URL")
    llama_model = "llama3.1:latest"

    print(f"Using Ollama server at: {ollama_server_url}")
    print("-"*40)

    llm = OllamaLLM(model=llama_model, base_url=ollama_server_url)
    llama_embeddings = OllamaEmbeddings(model=llama_model, base_url=ollama_server_url)

    docs = load_docs(data_path)
    print("load_docs: PASSED")

    splits = split_text(docs)
    print("split_text: PASSED")
    
    # Checks if the path exists for the database
    if os.path.exists(db_path):
        # If the path exists print out the name of the path and tell the user
        print("-"*40)
        print(f"The path {db_path} exists! ")
        print("-"*40)
        # Call the function to delete the database and its contents
        delete_milvus_db(db_path)

    print("-"*40)
    # Tell the user that the database doesn't exists and that it is getting created
    print(f"The path {db_path} does not exists, creating database now...")

    print("-"*40)

    # Function that gets called to create the database and its schema
    create_milvus_db(splits, llama_embeddings, db_path)

    # Tell the user that the function has passed and works 
    print("create_milvus_db: PASSED")

    # Calls the function to load the exists database and store it into vector_store variable 
    vector_store = load_milvus_db(llama_embeddings, db_path)

    # Tell the user that the function has passed
    print("load_db: PASSED")


    retriever = create_retriever(vector_store)
    print("create_retriever: PASSED")

    # Get the time it takes to split the text and generate the embeddings into the mivlus db and then load it so the user can ask a question
    end = time.time()  # End timer
    elapsed_time = end - start  # Calculate elapsed time
    
    print("-"*40)
    print(f"Time taken: {elapsed_time:.2f} seconds")
    print("-"*40)

    # While loop to ask the user multiple questions
    while True: 
        
        question = get_user_question()
        print("get_user_question: PASSED")

        # If that checks if the user types exit to exit the code 
        if question.lower() == "exit":
            print("Exiting Code!")
            print("-"*40)
            break 

        retrieved_docs = retrieve_docs(retriever, question)
        print("retrieve_docs: PASSED")

        prompt = create_prompt(retrieved_docs, question)
        print("create_prompt: PASSED")

        answer = get_answer(llm, prompt)
        print(answer)
        print("get_answer: PASSED")
        print(eval(question=question, retrived_docs=retrieved_docs, answer=answer, llm=llm, llm_embeddings=llama_embeddings))

        print("-"*40)
        
# Runs the main function to run other functions
main()