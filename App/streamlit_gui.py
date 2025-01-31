import streamlit as st
import os
import time
from langchain_ollama import OllamaLLM, OllamaEmbeddings
from langchain_community.document_loaders import DirectoryLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain.schema import Document

data_path = "./data"

# Function to load and apply the CSS file
def load_css(file_name):
    with open(file_name, "r") as f:
        css = f.read()
        st.markdown(f"<style>{css}</style>", unsafe_allow_html=True)

# Apply the external CSS
load_css("styles.css")

st.title("Rite Solutions Inc. Content Creator")
st.sidebar.header("Context Loader")
uploaded_files = st.sidebar.file_uploader("Upload Documents",accept_multiple_files=True, type=["pdf", "docx", "txt", "pptx"])

if st.sidebar.button("Process Documents"):
    if uploaded_files:
        os.makedirs(data_path, exist_ok=True)
        for file in uploaded_files:
            with open(os.path.join(data_path, file.name), "wb") as f:
                f.write(file.read())
        st.sidebar.success("Documents uploaded and stored!")

      
        st.sidebar.success("Database created successfully!")

st.header("Ask a Question")

question = st.chat_input("Say something")
if question:
    st.write(f"User has sent the following text: {question}")

# if st.button("Get Answer"):