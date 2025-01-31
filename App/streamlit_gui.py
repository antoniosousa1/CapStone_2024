import streamlit as st
import os
import time
from langchain_ollama import OllamaLLM, OllamaEmbeddings
from langchain_community.document_loaders import DirectoryLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain.schema import Document

data_path = "./data"

st.markdown(
    """
    <style>
        body {
            background-color: #f0f2f6;  /* Change to your preferred color */
        }
        [data-testid="stAppViewContainer"] {
            background-color: #f0f2f6;  /* Main background */
        }
        [data-testid="stHeader"] {
            background-color: #f0f2f6;  /* Header background */
        }
        [data-testid="stToolbar"] {
            background-color: #d1e0e0;  /* Toolbar background */
        }
        [data-testid="stSidebar"] {
            background-color: #98989d;  /* Sidebar background */
        }
        footer {
            background-color: #b0bec5;  /* Footer background */
            padding: 10px;
        }
        h1 {
            color: #000000 !important;  /* Change title color */
            text-align: center;  /* Optional: Center align */
            font-size: 36px;  /* Optional: Change font size */
        }
        h2 {
            color: #000000 !important;  /* Header (st.header) color */
            text-align: left;  /* Align text left */
            font-size: 30px;  /* Adjust font size */
            font-weight: bold;  /* Make it bold */
        }
        p, div[data-testid="stMarkdownContainer"] {
            color: #4a4a4a !important;  /* Body text color */
            font-size: 18px;  /* Adjust font size */
            line-height: 1.6;  /* Improve readability */
        }
        [data-testid="stSidebar"] button {
            background-color: #f0f2f6; 
            color: black;
            border-radius: 10px;
            padding: 10px 24px;
            border: none;
            font-size: 16px;
        }
        [data-testid="stSidebar"] button:hover {
            background-color: #d1e0e0;
            color: black;
        }
        [data-testid="stSidebar"] h1, 
        [data-testid="stSidebar"] h2, 
        [data-testid="stSidebar"] h3 {
            color: #000000;
        }
        [data-testid="stSidebar"] label {
            color: #000000;
            font-weight: bold;
            font-size: 16px;
        }

    </style>
    """,
    unsafe_allow_html=True
)

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