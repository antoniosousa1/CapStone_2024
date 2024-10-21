from langchain_ollama import OllamaLLM, OllamaEmbeddings
from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma

#sets llama 3.1 as the llm a varable
llm = OllamaLLM(model="llama3.1")

#loads data from markdown file
loader = TextLoader(
    "./data/beeMovie.txt"
)

#assigns docs to the loaded documents
#document a class 
"""
document = Document(
    page_content="Hello, world!",
    metadata={"source": "https://example.com"}
)
"""
#load() -> list[Document]
docs = loader.load()

#splits the text into 1000 char chunks with a 150 char overlap to not cut off important context, also text is split by an empty line aswell
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000, chunk_overlap=150, add_start_index=True
)
all_splits = text_splitter.split_documents(docs)

#chooses which model of ollama embeddings to use
llamaEmbeddings = OllamaEmbeddings(
    model="llama3.1"
)
#creates vectore database with llama embeddings
vectorstore = Chroma.from_documents(documents=all_splits, embedding=llamaEmbeddings)

#retrives 10 documents that meet search parameters of similar
retriever = vectorstore.as_retriever(search_type="similarity", search_kwargs={"k": 10})

#prompt for serching avalible docuemnts
retrieved_docs = retriever.invoke("what happens to the flowers in the movie")

#function to create a prompt from a predetermined prompt format and the context given from the retriver
def create_prompt():

    prompt = "You are an assistant for question-answering tasks. Use the following pieces of retrieved context to answer he question. If you don't know the answer, just say that you don't know. Use three sentences maximum and keep the answer concise.\n"
    
    Question = "what happens to the flowers in the movie\n"

    Context_str = "Context: \n\n"

    for i in retrieved_docs:
        Context_str += i.page_content + "\n\n"

    Answer = "Answer: "

    final_prompt = prompt + Question + Context_str + Answer

    return final_prompt

#print the respone from the ollama llm that was given the formated prompt
print(llm.invoke(create_prompt()))