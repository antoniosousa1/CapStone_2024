import streamlit as st
import os
import time
from langchain_ollama import OllamaLLM, OllamaEmbeddings
from langchain_community.document_loaders import DirectoryLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain.schema import Document

data_path = "./data"


st.title("Rite Solutions Inc. Content Creator")
st.sidebar.header("Upload Documents")
uploaded_files = st.sidebar.file_uploader("Upload your documents", accept_multiple_files=True, type=["pdf", "docx", "txt", "pptx"])

if st.sidebar.button("Process Documents"):
    if uploaded_files:
        os.makedirs(data_path, exist_ok=True)
        for file in uploaded_files:
            with open(os.path.join(data_path, file.name), "wb") as f:
                f.write(file.read())
        st.sidebar.success("Documents uploaded and stored!")

      
        st.sidebar.success("Database created successfully!")

st.header("Ask a Question")
("Enter your question:")

question = st.chat_input("Say something")
if question:
    st.write(f"User has sent the following text: {question}")

# if st.button("Get Answer"):