import streamlit as st
import pandas as pd
import random
import os
import time
import requests
from langchain_ollama import OllamaLLM, OllamaEmbeddings
from langchain_community.document_loaders import DirectoryLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain.schema import Document
from dotenv import load_dotenv

load_dotenv()

BACKEND_URL = os.getenv("BACKEND_URL")
CSS_PATH = os.getenv("CSS_PATH")

# Sets tab title and icon 
st.set_page_config(
    page_title="RiteGen",
    page_icon="https://rite-solutions.com/wpç-content/uploads/2023/08/cropped-single-rower_0097d7-1-192x192.png",
)

# Function to load and apply the CSS file
def load_css(file_name):
    with open(file_name, "r") as f:
        css = f.read()
        st.markdown(f"<style>{css}</style>", unsafe_allow_html=True)


# Apply the external CSS
load_css(CSS_PATH)


# Response emulator
def response_generator():
    response = random.choice(
        [
            "Hello there! How can I assist you today?",
            "Hi! Is there anything I can help you with?",
            "Do you need help?",
        ]
    )
    for word in response.split():
        yield word + " "
        time.sleep(0.05)


# Title
st.title("Rite Solutions Inc. Content Creator")

# Side bar
st.sidebar.header("Upload Documents")

uploaded_files = st.sidebar.file_uploader(
    "files", accept_multiple_files=True, type=["pdf", "docx", "txt", "pptx"]
)

if st.sidebar.button("Process Documents"):
    if uploaded_files:
        for file in uploaded_files:
            response = requests.post(f"{BACKEND_URL}/add", files={"file": file})
            if response.status_code == 200:
                st.sidebar.success(f"Uploaded: {file.name}")
            else:
                st.sidebar.error(
                    f"Failed to upload: {file.name} ({response.status_code})"
                )

        st.sidebar.success("Database created successfully!")

view_files = st.sidebar.button("View Files")
if view_files:
    response = requests.get(f"{BACKEND_URL}/list-files")
    if response.status_code == 200:
        files = response.json()
        if isinstance(files, dict):
            files = files.get("files", [])
        if files:
            st.write("### List of Uploaded Files:")
            for file in files:
                st.write(f"- {file}")
        else:
            st.write("No files uploaded.")
    else:
        st.error("Failed to retrieve files.")

if st.sidebar.button("Help?", use_container_width=False):
    st.sidebar.markdown("This is a help button.")

# Initialize chat history
if "messages" not in st.session_state:
    st.session_state.messages = []

# Display chat messages from history on app rerun
for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])

# Accept user input
if prompt := st.chat_input("Message Rite Content Creator"):
    # Add user message to chat history
    st.session_state.messages.append({"role": "user", "content": prompt})
    # Display user message in chat message container
    with st.chat_message("user"):
        st.markdown(st.session_state.messages[-1]["content"])

    # Show a loading spinner instead of a progress bar
    with st.chat_message("assistant"):
        
        try:
            with st.spinner("Thinking..."):
                response = requests.post(
                    f"{BACKEND_URL}/query", json={"query": prompt}
                )
                if response.status_code == 200:
                    llm_response = response.json()["llm_response"]
                else:
                    st.error(f"Error: {response.json().get('error', 'Unknown error')}")
                    llm_response = "An error occurred."

            # Display assistant's response progressively
            response_container = st.empty()
            full_response = ""
            words = llm_response.split()
            for word in words:
                full_response += word + " "
                response_container.markdown(full_response)
                time.sleep(0.05)

            st.session_state.messages.append({"role": "assistant", "content": full_response})
        except Exception as e:
            st.error(f"An unexpected error occurred: {e}")

        

    col1, col2, col3 = st.columns(3)
    #place metrics in the "Value sections"
    with col1:
        st.metric(label="Context", value=0.9999)
                    
    with col2:
        st.metric(label="Faithfulness", value=1.000)
                    
    with col3:
        st.metric(label="Relevancey", value=.5690)


        


        







    

    


    


