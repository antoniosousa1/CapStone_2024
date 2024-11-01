import warnings
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import CharacterTextSplitter
from langchain.chains import RetrievalQA
from langchain_ollama import OllamaLLM
from langchain.schema import Document
from langchain.vectorstores.base import VectorStore
from typing import List
import os

# Suppress specific warnings
warnings.filterwarnings("ignore", category=DeprecationWarning)
warnings.filterwarnings("ignore", message="urllib3")

# Load the PDF and create the document loader
def load_documents(pdf_path: str) -> List[Document]:
    loader = PyPDFLoader(pdf_path)
    return loader.load()

# Split text into smaller chunks
def split_documents(documents: List[Document]) -> List[Document]:
    text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
    return text_splitter.split_documents(documents)

# Embed the text into vectors
def create_vector_store(documents: List[Document]) -> VectorStore:
    model_name = "sentence-transformers/all-MiniLM-L6-v2"
    embedding_model = HuggingFaceEmbeddings(model_name=model_name)
    return FAISS.from_documents(documents, embedding_model)

# Set up the RAG pipeline
def setup_rag_pipeline(vector_store: VectorStore) -> RetrievalQA:
    llm = OllamaLLM(model="llama3.1")
    retriever = vector_store.as_retriever()
    return RetrievalQA.from_chain_type(llm=llm, retriever=retriever, chain_type="stuff")

# Main execution
if __name__ == "__main__":
    pdf_path = "C:/Users/GFelix/Downloads/CIS 442 HW 1.pdf"  # Replace with your PDF path
    query = "What is this about?"  # Write your question here

    # Check if the file exists
    if not os.path.isfile(pdf_path):
        print("Error: The specified PDF file does not exist.")
    else:
        documents = load_documents(pdf_path)
        split_docs = split_documents(documents)
        vector_store = create_vector_store(split_docs)
        rag = setup_rag_pipeline(vector_store)
        response = rag.invoke(query)

        print("Response:", response)
