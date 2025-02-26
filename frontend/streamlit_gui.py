
import streamlit as st
import random
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

uploaded_files = st.sidebar.file_uploader("",accept_multiple_files=True, type=["pdf", "docx", "txt", "pptx"])

if st.sidebar.button("Process Documents"):
    if uploaded_files:
        os.makedirs(data_path, exist_ok=True)
        for file in uploaded_files:
            with open(os.path.join(data_path, file.name), "wb") as f:
                f.write(file.read())
        st.sidebar.success("Documents uploaded and stored!")

      
        st.sidebar.success("Database created successfully!")


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
        st.markdown(prompt)

    # Display assistant response in chat message container
    with st.chat_message("assistant"):
        response = st.write_stream(response_generator())
    # Add assistant response to chat history
    st.session_state.messages.append({"role": "assistant", "content": response})

  
