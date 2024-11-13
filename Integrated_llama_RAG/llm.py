from langchain_ollama import OllamaLLM, OllamaEmbeddings
from langchain_community.document_loaders import DirectoryLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain_community.vectorstores import Chroma
import os

#sets llama 3.1 as the llm a varable
llm = OllamaLLM(model="llama3.1:70b")

#loads data from markdown file
loader = DirectoryLoader(
    path="./data"
)

#assigns docs to the loaded documents
docs = loader.load()

#splits the text into 1000 char chunks with a 150 char overlap to not cut off important context, also text is split by an empty line aswell
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=250, chunk_overlap=100, add_start_index=True
)

all_splits = text_splitter.split_documents(docs)

#chooses which model of ollama embeddings to use
llamaEmbeddings = OllamaEmbeddings(
    model="llama3.1:70b"
)

#The path to store the vector (pwd for your own path)
vectorstore_path = "/x1/mgreeson/WorkFolder/CapStoneProject/CapStone_2024/Integrated_llama_RAG/Vector_Storage_Data" 

# If the vector data has been stored properly, load it and check if data actually exists in it 
if os.path.exists(vectorstore_path) and os.listdir(vectorstore_path):  
    # Entered the if statement, start loading vector database
    print("Loading the existing vector data...")
    
    # Try to load it, if not throw an error 
    try:
        # Load the vectorstore from the persisted directory
        vectorstore = Chroma(persist_directory=vectorstore_path, embedding_function=llamaEmbeddings)
        
        print("Vector data loaded successfully.")

    # Exception that throws an error when loading the database
    except Exception as e:
        print(f"Error loading vector data: {e}")
# else that runs if the vector data hasn't been created and stored 
else:
    # Print that tells user the data is being stored
    print("Creating and Storing vector database data...")

    # Creates vectore database with llama embeddings
    vectorstore = Chroma.from_documents(documents=all_splits, embedding=llamaEmbeddings, persist_directory=vectorstore_path)
    
    # Tells the user that the vector database data has been stored and persisted 
    print("Storage of vector data created and persisted.")

#retrives 10 documents that meet search parameters of similar
retriever = vectorstore.as_retriever(search_type="similarity", search_kwargs={"k": 10})

#Text doesn't display to the user till all the documents have been split and stored
#Asks the user to input a question and stores the users question into the question variable 
question = input("What is your question: ")

#prompt for serching avalible docuemnts
retrieved_docs = retriever.invoke(question)

#Outputs the chunks of text to the terminal that are split up
'''
for i in retrieved_docs:
    print(i.page_content)
    print("BREAK\n")
'''

#function to create a prompt from a predetermined prompt format and the context given from the retriver
def create_prompt():

    prompt = "You are an assistant for question-answering tasks. Use the following pieces of retrieved context to answer he question. If you don't know the answer, just say that you don't know. Use three sentences maximum and keep the answer concise.\n"
    
    Question = "Question: " + question + "\n"

    Context_str = "Context: \n\n"

    for i in retrieved_docs:
        Context_str += i.page_content + "\n\n"

    Answer = "Answer: "

    final_prompt = prompt + Question + Context_str + Answer

    return final_prompt

#print the respone from the ollama llm that was given the formated prompt
print("\n")
print("Answer: " + llm.invoke(create_prompt()))
print("\n")
