import os
from langchain_ollama import OllamaLLM, OllamaEmbeddings
from langchain_community.document_loaders import PyMuPDFLoader  # PDF loader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma

# Set up the LLM
llm = OllamaLLM(model="llama3.1")

# Set the absolute path to your PDF file
pdf_path = os.path.abspath("C:/Users/GFelix/Downloads/BeeMovie.pdf")  # Adjust this path as needed
print(f"Loading PDF from: {pdf_path}")  # Debugging print to verify path

# Load PDF file
try:
    loader = PyMuPDFLoader(pdf_path)
except ValueError as e:
    print(f"Error loading PDF: {e}")
    exit(1)

# Load documents
docs = loader.load()

# Split the text into chunks
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000, chunk_overlap=150, add_start_index=True
)
all_splits = text_splitter.split_documents(docs)

# Set up embeddings
llamaEmbeddings = OllamaEmbeddings(model="llama3.1")

# Create a vector store with the embeddings
vectorstore = Chroma.from_documents(documents=all_splits, embedding=llamaEmbeddings)

# Set up retriever
retriever = vectorstore.as_retriever(search_type="similarity", search_kwargs={"k": 10})

# Loop for user interaction
while True:
    user_input = input("User: ")

    if user_input.lower() == "/bye":
        print("AI: Bye, have a great day :)")
        break

    # Retrieve relevant documents based on user input
    retrieved_docs = retriever.invoke(user_input)

    # Function to create a prompt from retrieved context
    def create_prompt():
        prompt = (
            "You are an assistant for question-answering tasks. "
            "Use the following pieces of retrieved context to answer the question. "
            "If you don't know the answer, just say that you don't know. "
            "Use three sentences maximum and keep the answer concise.\n"
        )
        
        Question = f"Question: {user_input}\n\n"
        Context_str = "Context: this is a movie called Bee Movie \n\n"

        for i in retrieved_docs:
            Context_str += f"- {i.page_content.strip()}\n\n"  # Bullet points for better readability

        Answer = "Answer: "

        final_prompt = prompt + Question + Context_str + Answer

        return final_prompt

    # Get the AI's response and format it
    ai_response = llm.invoke(create_prompt())
    
    # Print the response in a structured format
    print("\n--- Response ---")
    print(f"Question: {user_input}")
    print(f"Answer: {ai_response.strip()}")
    print("-----------------\n")
