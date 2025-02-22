from deepeval.models import DeepEvalBaseLLM, DeepEvalBaseEmbeddingModel

from langchain_ollama import ChatOllama, OllamaEmbeddings
from langchain_community.document_loaders import DirectoryLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain.schema import Document
from langchain_milvus import Milvus # type: ignore
from langchain.vectorstores.base import VectorStoreRetriever

import os, time

##########################################################
class LlamaLLM(DeepEvalBaseLLM):
    def __init__(self):
        pass

    def get_model_name(self):
        return "llama3.1:latest"
    
    def load_model(self):
        return ChatOllama(
            model=self.get_model_name()
        )
    
    def generate(self, prompt: str) -> str:
        chat_model = self.load_model()
        return chat_model.invoke(prompt).content
    
    def invoke(self, prompt: str) -> str:  # Added method
        return self.generate(prompt)
        
    async def a_generate(self, prompt: str) -> str:
        return self.generate(prompt)
    
##########################################################
class LlamaLLMEmbeddings(DeepEvalBaseEmbeddingModel):
    def __init__(self):
        pass

    def get_model_name(self):
        return "llama3.1:latest"
    
    def load_model(self):
        return OllamaEmbeddings(
            model=self.get_model_name()
        )
    
    def embed_text(self, text: str) -> list[float]:
        embedding_model = self.load_model()
        return embedding_model.embed_query(text)
    
    def embed_query(self, text: str) -> list[float]:  # Alias for compatibility
        return self.embed_text(text)

    def embed_texts(self, texts: list[str]) -> list[list[float]]:
        embedding_model = self.load_model()
        return embedding_model.embed_documents(texts)
    
    def embed_documents(self, texts: list[str]) -> list[list[float]]: # Alias for compatibility
        return self.embed_texts(texts)

    async def a_embed_text(self, text: str) -> list[float]:
        embedding_model = self.load_model()
        return await embedding_model.aembed_query(text)

    async def a_embed_texts(self, texts: list[str]) -> list[list[float]]:
        embedding_model = self.load_model()
        return await embedding_model.aembed_documents(texts)
    

##########################################################
class RAG():

    def __init__(self):
        pass
    # Function that will check if the database exists and delete it, takes in the path of the locally created database
    def delete_milvus_db(self, db_path: str):

        # Checks if the milvus database already exists, if it does delete it. 
        if os.path.exists(db_path):
            os.remove(db_path)
            print("delete_milvus_db: PASSED")
            time.sleep(2)

    # Loads the data into usable docs
    def load_docs(self, data_path: str) -> list[Document]:
        loader = DirectoryLoader(path=data_path)
        docs = loader.load()
        return docs

    # splits docs into chunks
    def split_text(self, docs: list[Document]) -> list[Document]:
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=512, chunk_overlap=75, add_start_index=True
        )
        splits = text_splitter.split_documents(docs)
        return splits

    # creates vector database with llama embeddings
    def create_milvus_db(self, splits: list[Document], llama_embeddings: OllamaEmbeddings, db_path: str) -> Milvus:
    
        text_splits = [doc.page_content for doc in splits]

        vector_db = Milvus(
            embedding_function=llama_embeddings,
            connection_args={"uri": db_path},
            collection_name="DataCollection",
        )
    
        ids = [str(i) for i in range(len(text_splits))]
    
        vector_db.add_texts(texts=text_splits, ids=ids)

        return vector_db

    # Load the db and its contents 
    def load_milvus_db(self, llama_embeddings: OllamaEmbeddings, db_path: str) -> Milvus:
        

        vector_store_loaded = Milvus(
            llama_embeddings,
            connection_args={"uri": db_path},
            collection_name="DataCollection",
        )
        
        return vector_store_loaded

    # creates retriever
    def create_retriever(self, vector_store: Milvus) -> VectorStoreRetriever:
        retriever = vector_store.as_retriever(search_type="similarity", search_kwargs={"k": 3})
        return retriever

    # Retrieves the chunks relevant to the question using a retriever
    def retrieve_docs(self, retriever: VectorStoreRetriever, question: str) -> list[Document]:

        # Use the retriever to search the vector database directly with the raw question text
        search_results = retriever.invoke(question, kwargs=3)

        # Uncomment this code to check the returned docs by the line of code above
        # Check if no results were returned
        '''
        if not search_results:
            print("No documents retrieved!")
        else:
            for doc in search_results:
                print(f"Retrieved Doc: {doc.page_content}")
                print()
        '''

        return search_results

    # Gets the user question
    def get_user_question(self) -> str:
        print("Please enter a question: ")
        question = input()
        print("-"*40)

        return question

    # Create a prompt
    def create_prompt(self, retrieved_docs: list[Document], question: str) -> str:
        prompt = "You are an assistant for question-answering tasks. Use the following pieces of retrieved context to answer the question. Use five sentences maximum and keep the answer concise. If you don't know based on the given context, respond with I don't know.  \n"
        
        Question = "Question: " + question + "\n"

        Context_str = "Context: \n\n"

        for i in retrieved_docs:
            Context_str += i.page_content + "\n\n"

        Answer = "Answer: "

        final_prompt = prompt + Question + Context_str + Answer

        return final_prompt

    # Print the response from the Ollama LLM that was given the formatted prompt
    def get_answer(self, llm: ChatOllama, prompt: str) -> str:
        answer = llm.invoke(prompt)
        return answer

##########################################################