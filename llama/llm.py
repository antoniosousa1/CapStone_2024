from langchain_ollama import OllamaLLM, OllamaEmbeddings
from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma


#sets llama 3.1 as the llm a varable
llm = OllamaLLM(model="llama3.1")

#testing print statement showing model is working with llama
    #response = llm.invoke("This is a test say Hi")

    #print(response)

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
docs = loader.load()
#load() -> list[Document]
    #print(docs[0].page_content[:100])

#splits the text into 500 char chunks with a 150 char overlap to not cut off important context, also text is split by an empty line aswell
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=500, chunk_overlap=150, add_start_index=True
)
all_splits = text_splitter.split_documents(docs)

#allsplits is a list of documents
    #print(len(all_splits))

#stores documents into vector database


llamaEmbeddings = OllamaEmbeddings(
    model="llama3.1"
)
#creates vectore database with llama embeddings
vectorstore = Chroma.from_documents(documents=all_splits, embedding=llamaEmbeddings)

#retrives 5 documents that meet search parameters of similar
retriever = vectorstore.as_retriever(search_type="similarity", search_kwargs={"k": 3})

#prompt for serching avalible docuemnts
retrieved_docs = retriever.invoke("what happens to adam's stinger")

#prints the retrieved docuemnts 
print(retrieved_docs)



#keep working on this another time