from langchain_ollama import OllamaLLM, OllamaEmbeddings
from langchain_community.document_loaders import DirectoryLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_milvus import Milvus # type: ignore
import os, time, re

# Start the timer for when the code begins
start = time.time()

# Sets the location where the db will be created and stored (Inside the App directory)
db_path = "./DataEmbeddings.db" 

# Function that is used to check if the path to the milvus DB already exists, if so it deletes it so a new DB with new embeddings can be created
def delete_milvus_db():

    # Checks if the milvus database already exists, if it does delete it. Uses os import to check the file path 
    if os.path.exists(db_path):
        # removes the file 
        os.remove(db_path)
        # tells the user the file has been deleted successfully 
        print("delete_milvus_db: PASSED")
        # Have the program wait 2 seconds to ensure that the file gets deleted and that the user can visually see it getting deleted from the directory
        time.sleep(2)

# Loads the data into usable docs
def load_docs(data_path):
    loader = DirectoryLoader(path=data_path)
    docs = loader.load()
    return docs

# Splits docs into chunks
def split_text(docs):
    text_splitter = RecursiveCharacterTextSplitter(
        # Change chunk size and overlap for different results, smaller chunks take longer but allow for more concise answers. 
        chunk_size=350, chunk_overlap=90, add_start_index=True
    )
    splits = text_splitter.split_documents(docs)
    return splits

# Creates vector database with llama embeddings
def create_milvus_db(splits, llama_embeddings):

    # Extracting text content from document splits
    text_splits = [doc.page_content for doc in splits]

    # Initializing Milvus vector database
    vector_db = Milvus(
        embedding_function=llama_embeddings,  # The Embedding function
        connection_args={"uri": db_path},     # The DB connection URI
        collection_name="DataCollection",     # The Collection name
    )

    # Creating unique IDs for each text split
    ids = [str(i) for i in range(len(text_splits))]

    # Adding texts and IDs to the vector database
    vector_db.add_texts(texts=text_splits, ids=ids)

    # Returning the vector database
    return vector_db

# Function to load the Milvus database and its embeddings
def load_milvus_db(llama_embeddings):
     
     # Initialize and connect to the Milvus database, specifying the embeddings function
     vector_store_loaded = Milvus(
        llama_embeddings,                          # The Embedding function to use
        connection_args={"uri": db_path},          # The Database connection URI
        collection_name="DataCollection",          # The Collection name to load
    )
     
     # Return the loaded Milvus vector store
     return vector_store_loaded

'''
# Useless code atm but might be needed later

# Creates the retriever
def create_retriever(vector_store):
    retriever = vector_store.as_retriever(search_type="similarity", search_kwargs={"k": 10})
    return retriever

'''

# Function that gets the user question 
def get_user_question():
    # Asks the user to enter a question
    print("Please enter a question: ")
    # Stores the question that user typed into the question variable 
    question = input()
    # dashed lines to seperate the text for readability purposes 
    print("-"*40)

    # Returns the question variable 
    return question

# Function to retrieve relevant document chunks based on the user's question
def retrieve_docs(vector_store, llama_embeddings, question):
    # Generate an embedding for the input question using the embedding function
    question_embedding = llama_embeddings.embed_query(question)

    # Search the vector database using the generated question embedding
    # 'k=10' specifies that the top 10 most relevant documents will be retrieved
    search_results = vector_store.similarity_search_by_vector(question_embedding, k=10)

    '''
    # Uncomment this block of code if you want to see what chunks are used to help answer the question from the user

    # Check if no documents were retrieved and print a message if true
    if not search_results:
        print("No documents retrieved!")
    else:
        # Print the content of each retrieved document
        for doc in search_results:
            print(f"Retrieved Doc: {doc.page_content}")
            print()
    '''

    # Return the list of retrieved documents
    return search_results

# Create a prompt for our LLM
def create_prompt(retrieved_docs, question):
    prompt = "You are an assistant for question-answering tasks. Use the following pieces of retrieved context to answer the question. Use five sentences maximum and keep the answer concise. If you don't know based on the given context, use background knowledge to answer. Also don't mix the content and background knowledge together. \n"
    
    Question = "Question: " + question + "\n"

    Context_str = "Context: \n\n"

    for i in retrieved_docs:
        Context_str += i.page_content + "\n\n"

    Answer = "Answer: "

    final_prompt = prompt + Question + Context_str + Answer

    return final_prompt

# Print the response from the Ollama LLM that was given the formatted prompt
def get_answer(llm, prompt):
    answer = llm.invoke(prompt)
    return answer

# Main function to run the python file and call specific function
def main():

    data_path = "./data"
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

    # Calls function to check if the database already exists and deletes it if it exists 
    delete_milvus_db()
    
    # Calls the function to create the database after it has either been deleted or doesn't exist at all 
    create_milvus_db(splits, llama_embeddings)
    print("create_milvus_db: PASSED")

    vector_store = load_milvus_db(llama_embeddings)
    print("load_db: PASSED")

    # retriever = create_retriever(vector_store)
    # print("create_retriever: PASSED")

    # Get the time it takes to split the text and generate the embeddings into the mivlus db and then load it so the user can ask a question
    end = time.time()  # End timer
    elapsed_time = end - start  # Calculate elapsed time
    
    print("-"*40)
    # Prints to the terminal the time it takes from when the program start to when all the data documents are generated into embeddings and stored in the DB
    print(f"Time taken: {elapsed_time:.2f} seconds")
    print("-"*40)

    # While loop that continuously will ask the user a question
    while True: 
        question = get_user_question()
        print("get_user_question: PASSED")

        # Check if the user types exit, if they do terminate the program. 
        if question.lower() == "exit":
            print("-"*40)
            print("Exiting Code!")
            break 

        retrieved_docs = retrieve_docs(vector_store, llama_embeddings, question)
        print("retrieve_docs: PASSED")

        prompt = create_prompt(retrieved_docs, question)
        print("create_prompt: PASSED")

        answer = get_answer(llm, prompt)
        print("get_answer: PASSED")

        print("-"*40)

        # Check if the path exists for the Answer.txt file, if it does delete the file so the new answer can be generated to it
        if os.path.exists(output_file):
            os.remove(output_file)
            print("Deleted Answer.txt: PASSED")
            print("-"*40)

        # Write the contents to the output_file
        with open(output_file, "w") as file:

            # Split the answer into sentences and write each sentence to a new line
            sentences = re.split(r'(?<=[.!?])\s+', answer)  # Split on sentence boundaries
            # Loops through the generated sentences and makes a new line, allows for easy readability in the generated answer from the llm
            for sentence in sentences:
                file.write(sentence.strip() + "\n")  # Strip leading/trailing spaces and add newline

        print(f"Your answer has been saved to {output_file}.")


# Runs the main function to run other functions
main()