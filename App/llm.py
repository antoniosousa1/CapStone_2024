from langchain_ollama import OllamaLLM, OllamaEmbeddings
from langchain_community.document_loaders import DirectoryLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain.schema import Document
from langchain.vectorstores.base import VectorStoreRetriever
import os

# loads the data into usable docs
def load_docs(data_path: str) -> list[Document]:
    loader = DirectoryLoader(path=data_path)
    docs = loader.load()
    return docs

# splits docs into chunks
def split_text(docs: list[Document]) -> list[Document]:
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=250, chunk_overlap=100, add_start_index=True
    )
    splits = text_splitter.split_documents(docs)
    return splits

# creates vector database with llama embeddings
def create_vector_db(splits: list[Document], llama_embeddings: OllamaEmbeddings) -> Chroma:
    vector_db = Chroma.from_documents(documents=splits, embedding=llama_embeddings)
    return vector_db

# creates retriever
def create_retriever(vector_db: Chroma) -> VectorStoreRetriever:
    retriever = vector_db.as_retriever(search_type="similarity", search_kwargs={"k": 5})
    return retriever

# gets the user question
def get_user_question() -> str:
    print("Please enter a question: ")
    question = input()
    return question

# retrieves the chunks relevant to question
def retrieve_docs(retriever: VectorStoreRetriever, question: str) -> list[Document]:
    retrieved_docs = retriever.invoke(question)
    return retrieved_docs

# create a prompt
def create_prompt(retrieved_docs: list[Document], question: str) -> str:
    prompt = "You are an assistant for question-answering tasks. Use the following pieces of retrieved context to answer the question. If you don't know the answer, just say that you don't know. Use three sentences maximum and keep the answer concise.\n"
    
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
    ollama_server_url = os.getenv("OLLAMA_SERVER_URL")
    llama_model = "llama3.1"

    print(f"Using Ollama server at: {ollama_server_url}")

    llm = OllamaLLM(model=llama_model, base_url=ollama_server_url)
    llama_embeddings = OllamaEmbeddings(model=llama_model, base_url=ollama_server_url)

    docs = load_docs(data_path)
    print("load_docs: PASS")

    splits = split_text(docs)
    print("split_text: PASS")

    vector_db = create_vector_db(splits, llama_embeddings)
    print("create_vector_db: PASS")

    retriever = create_retriever(vector_db)
    print("create_retriever: PASS")

    question = get_user_question()
    print("get_user_question: PASS")

    retrieved_docs = retrieve_docs(retriever, question)
    print("retrieve_docs: PASS")

    prompt = create_prompt(retrieved_docs, question)
    print("create_prompt: PASS")

    answer = get_answer(llm, prompt)
    print("get_answer: PASS")

    print(answer)

main()