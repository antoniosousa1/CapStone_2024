from langchain_ollama import OllamaLLM, OllamaEmbeddings
from langchain_community.document_loaders import DirectoryLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
<<<<<<< HEAD
from langchain_milvus import Milvus # type: ignore
import os, time, re

start = time.time()

# Sets the location where the db will be created and stored (Inside the App directory)
db_path = "./DataEmbeddings.db"

def delete_milvus_db():
    # Checks if the milvus database already exists, if it does delete it. 
    if os.path.exists(db_path):
        os.remove(db_path)
        print("delete_milvus_db: PASSED")
        time.sleep(3)

# loads the data into usable docs
def load_docs(data_path):
    loader = DirectoryLoader(path=data_path)
    docs = loader.load()
    return docs

# splits docs into chunks
def split_text(docs):
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=350, chunk_overlap=90, add_start_index=True
    )
    splits = text_splitter.split_documents(docs)
    return splits

# creates vector database with llama embeddings
def create_milvus_db(splits, llama_embeddings):
   
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
def load_milvus_db(llama_embeddings):
     
     vector_store_loaded = Milvus(
        llama_embeddings,
        connection_args={"uri": db_path},
        collection_name="DataCollection",
    )
     
     return vector_store_loaded

# creates retriever
def create_retriever(vector_store):
    retriever = vector_store.as_retriever(search_type="similarity", search_kwargs={"k": 10})
    return retriever

# gets the user question
def get_user_question():
    print("Please enter a question: ")
    question = input()
    print("-"*40)

    return question

# retrieves the chunks relevant to question
def retrieve_docs(vector_store, llama_embeddings, question):
    # Generate embedding for the question
    question_embedding = llama_embeddings.embed_query(question)

    # Use the embedding to search the vector database
    search_results = vector_store.similarity_search_by_vector(question_embedding, k=10)

    if not search_results:
        print("No documents retrieved!")
    else:
        for doc in search_results:
            print(f"Retrieved Doc: {doc.page_content}")
            print()

    return search_results

# create a prompt
def create_prompt(retrieved_docs, question):
    prompt = "You are an assistant for question-answering tasks. Use the following pieces of retrieved context to answer the question. Use five sentences maximum and keep the answer concise. If you don't know based on the given context, use background knowledge to answer. Also don't mix the content and background knowledge together. \n"
=======
from langchain_chroma import Chroma

import os


# Access the Ollama server URL
ollama_server_url = os.getenv("OLLAMA_SERVER_URL")
print(f"Using Ollama server at: {ollama_server_url}")

#sets llama 3.1 as the llm a varable
llm = OllamaLLM(model="llama3.1", base_url=ollama_server_url)

#loads data from markdown file
loader = DirectoryLoader(
    path="./data"
)

#assigns docs to the loaded documents
docs = loader.load()

print("passed loader")
#splits the text into 1000 char chunks with a 150 char overlap to not cut off important context, also text is split by an empty line aswell
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=250, chunk_overlap=100, add_start_index=True
)
all_splits = text_splitter.split_documents(docs)

print("passed text splitter")
#chooses which model of ollama embeddings to use
llamaEmbeddings = OllamaEmbeddings(
    model="llama3.1", base_url=ollama_server_url
)

#creates vectore database with llama embeddings
vectorstore = Chroma.from_documents(documents=all_splits, embedding=llamaEmbeddings)

print("paased vectore store and embeddings")

#retrives 10 documents that meet search parameters of similar
retriever = vectorstore.as_retriever(search_type="similarity", search_kwargs={"k": 5})

print("please enter question: ")
question = input()

#prompt for serching avalible docuemnts
retrieved_docs = retriever.invoke(question)

print("retrived docs")
#function to create a prompt from a predetermined prompt format and the context given from the retriver
def create_prompt():

    prompt = "You are an assistant for question-answering tasks. Use the following pieces of retrieved context to answer he question. If you don't know the answer, just say that you don't know. Use three sentences maximum and keep the answer concise.\n"
>>>>>>> parent of fa9e248 (Feature mvp cleanup (#10))
    
    Question = "Question: " + question + "\n"

    Context_str = "Context: \n\n"

    for i in retrieved_docs:
        Context_str += i.page_content + "\n\n"

    Answer = "Answer: "

    final_prompt = prompt + Question + Context_str + Answer

    return final_prompt

<<<<<<< HEAD
# print the response from the Ollama LLM that was given the formatted prompt
def get_answer(llm, prompt):
    answer = llm.invoke(prompt)
    return answer

def main():

    data_path = "./data"
    # Save the answer to a text file
    output_file = "Answer.txt"
    ollama_server_url = os.getenv("OLLAMA_SERVER_URL")
    llama_model = "llama3.1"

    print(f"Using Ollama server at: {ollama_server_url}")
    print("-"*40)

    llm = OllamaLLM(model=llama_model, base_url=ollama_server_url)
    llama_embeddings = OllamaEmbeddings(model=llama_model, base_url=ollama_server_url)

    docs = load_docs(data_path)
    print("load_docs: PASSED")

    splits = split_text(docs)
    print("split_text: PASSED")

    delete_milvus_db()
    
    create_milvus_db(splits, llama_embeddings)
    print("create_milvus_db: PASSED")

    vector_store = load_milvus_db(llama_embeddings)
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

        retrieved_docs = retrieve_docs(vector_store, llama_embeddings, question)
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
=======
#print the respone from the ollama llm that was given the formated prompt
print(llm.invoke(create_prompt()))
>>>>>>> parent of fa9e248 (Feature mvp cleanup (#10))
