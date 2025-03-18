import streamlit as st
import random
import os
import time
import requests
from dotenv import load_dotenv

load_dotenv()

BACKEND_URL = os.getenv("BACKEND_URL")
CSS_PATH = os.getenv("CSS_PATH")

# Sets tab title and icon 
st.set_page_config(
    page_title="RiteGen",
    page_icon="https://rite-solutions.com/wpç-content/uploads/2023/08/cropped-single-rower_0097d7-1-192x192.png",
)

data_path = "../data/documents"
css_path = "./frontend/styles.css"

# Function to load and apply the CSS file
def load_css(file_name):
    with open(file_name, "r") as f:
        css = f.read()
        st.markdown(f"<style>{css}</style>", unsafe_allow_html=True)


# Apply the external CSS
load_css(CSS_PATH)


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

            with open(os.path.join(data_path, file.name), "wb") as f:
                f.write(file.read())
        st.sidebar.success("Documents uploaded and stored!")
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

# Initialize loading state
if "loading" not in st.session_state:
    st.session_state.loading = False

# Display chat messages from history on app rerun
for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])

# Accept user input (Disabled while loading)
prompt = st.chat_input("Message Rite Content Creator", disabled=st.session_state.loading)

if prompt:
    # Disable input and store the prompt
    st.session_state.loading = True
    st.session_state.messages.append({"role": "user", "content": prompt})
    
# Processing response
if st.session_state.loading:
    # Display user message
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

        # Reset loading state
        st.session_state.loading = False
        st.rerun()