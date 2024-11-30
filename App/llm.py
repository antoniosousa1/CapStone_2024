from langchain_ollama import OllamaLLM, OllamaEmbeddings
from langchain_community.document_loaders import DirectoryLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_milvus import Milvus # type: ignore
from langchain.schema import Document
from langchain.vectorstores.base import VectorStoreRetriever
import os, time, re

start = time.time()

def delete_milvus_db(db_path: str):
    # Checks if the milvus database already exists, if it does delete it. 
    if os.path.exists(db_path):
        os.remove(db_path)
        print("delete_milvus_db: PASSED")
        time.sleep(3)

# loads the data into usable docs
def load_docs(data_path: str) -> list[Document]:
    loader = DirectoryLoader(path=data_path)
    docs = loader.load()
    return docs

# splits docs into chunks
def split_text(docs: list[Document]) -> list[Document]:
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=750, chunk_overlap=90, add_start_index=True
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
    retriever = vector_store.as_retriever(search_type="similarity", search_kwargs={"k": 15})
    return retriever

# Retrieves the chunks relevant to the question using a retriever
def retrieve_docs(retriever: VectorStoreRetriever, question: str) -> list[Document]:
    # Use the retriever to search the vector database directly with the raw question text
    search_results = retriever.invoke(question, k=15)

    # Check if no results were returned
    if not search_results:
        print("No documents retrieved!")
    else:
        for doc in search_results:
            print(f"Retrieved Doc: {doc.page_content}")
            print()

    return search_results

# gets the user question
def get_user_question() -> str:
    print("Please enter a question: ")
    question = input()
    print("-"*40)

    return question

# create a prompt
def create_prompt(retrieved_docs: list[Document], question: str) -> str:
    prompt = "You are an assistant for question-answering tasks. Use the following pieces of retrieved context to answer the question. Use five sentences maximum and keep the answer concise. If you don't know based on the given context, say I don't know.  \n"
    
    Question = "Question: " + question + "\n"

    Context_str = "Context: \n\n"

    for i in retrieved_docs:
        Context_str += i.page_content + "\n\n"

    Answer = "Answer: "

    final_prompt = prompt + Question + Context_str + Answer

    return final_prompt

# print the response from the Ollama LLM that was given the formatted prompt
def get_answer(llm: OllamaLLM, prompt: str) -> str:
    answer = llm.invoke(prompt)
    return answer

def main():

    data_path = "./data"

    # Sets the location where the db will be created and stored (Inside the App directory)
    db_path = "./milvus_lite.db"

    # Save the answer to a text file
    output_file = "Answer.txt"
    ollama_server_url = os.getenv("OLLAMA_SERVER_URL")
    llama_model = "llama3.1:70b"

    print(f"Using Ollama server at: {ollama_server_url}")
    print("-"*40)

    llm = OllamaLLM(model=llama_model, base_url=ollama_server_url)
    llama_embeddings = OllamaEmbeddings(model=llama_model, base_url=ollama_server_url)

    docs = load_docs(data_path)
    print("load_docs: PASSED")

    splits = split_text(docs)
    print("split_text: PASSED")
    
    # Check if the path exists
    if os.path.exists(db_path):
        # If it doesn't exist, print an error message
        print(f"The path {db_path} exists.  ")
        #delete_milvus_db(db_path)
    else:
        print(f"The path {db_path} does not exists, creating now...")
        create_milvus_db(splits, llama_embeddings, db_path)
        print("create_milvus_db: PASSED")

    vector_store = load_milvus_db(llama_embeddings, db_path)
    print("load_db: PASSED")

    retriever = create_retriever(vector_store)
    print("create_retriever: PASSED")

    # Get the time it takes to split the text and generate the embeddings into the mivlus db and then load it so the user can ask a question
    end = time.time()  # End timer
    elapsed_time = end - start  # Calculate elapsed time
    
    print("-"*40)
    print(f"Time taken: {elapsed_time:.2f} seconds")
    print("-"*40)

    while True: 
        question = get_user_question()
        print("get_user_question: PASSED")

        if question.lower() == "exit":
            print("Exiting Code!")
            break 

        retrieved_docs = retrieve_docs(retriever, question)
        print("retrieve_docs: PASSED")

        prompt = create_prompt(retrieved_docs, question)
        print("create_prompt: PASSED")

        answer = get_answer(llm, prompt)
        print("get_answer: PASSED")

        print("-"*40)

        if os.path.exists(output_file):
            os.remove(output_file)
            print("Deleted Answer.txt: PASSED")
            print("-"*40)

        with open(output_file, "w") as file:
            # Split the answer into sentences and write each sentence to a new line
            sentences = re.split(r'(?<=[.!?])\s+', answer)  # Split on sentence boundaries
            for sentence in sentences:
                file.write(sentence.strip() + "\n")  # Strip leading/trailing spaces and add newline

        print(f"Your answer has been saved to {output_file}.")


# Runs the main function to run other functions
main()