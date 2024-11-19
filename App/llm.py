from langchain_ollama import OllamaLLM, OllamaEmbeddings
from langchain_community.document_loaders import DirectoryLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
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
    
    Question = "Question: " + question + "\n"

    Context_str = "Context: \n\n"

    for i in retrieved_docs:
        Context_str += i.page_content + "\n\n"

    Answer = "Answer: "

    final_prompt = prompt + Question + Context_str + Answer

    return final_prompt

#print the respone from the ollama llm that was given the formated prompt
print(llm.invoke(create_prompt()))