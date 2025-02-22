from deepeval.test_case import LLMTestCase
from deepeval.metrics import AnswerRelevancyMetric
from deepeval.dataset import EvaluationDataset

from .mod import RAG
from langchain_ollama import ChatOllama, OllamaEmbeddings

import os

rag = RAG()
llama_llm = ChatOllama(model="llama3.1:latest")
llama_embeddings = OllamaEmbeddings(model="llama3.1:latest")

data_path = "../data"
# Sets the location where the db will be created and stored (Inside the App directory)
db_path = "../mil_db/Milvus_Lite.db"

docs = rag.load_docs(data_path)
print("load_docs: PASSED")

splits = rag.split_text(docs)
print("split_text: PASSED")

# Checks if the path exists for the database
if os.path.exists(db_path):
    # If the path exists print out the name of the path and tell the user
    print("-"*40)
    print(f"The path {db_path} exists! ")
    print("-"*40)
    # Call the function to delete the database and its contents
    rag.delete_milvus_db(db_path)

print("-"*40)
# Tell the user that the database doesn't exists and that it is getting created
print(f"The path {db_path} does not exists, creating database now...")

print("-"*40)

# Function that gets called to create the database and its schema
rag.create_milvus_db(splits, llama_embeddings, db_path)

# Tell the user that the function has passed and works 
print("create_milvus_db: PASSED")

# Calls the function to load the exists database and store it into vector_store variable 
vector_store = rag.load_milvus_db(llama_embeddings, db_path)

# Tell the user that the function has passed
print("load_db: PASSED")


retriever = rag.create_retriever(vector_store)
print("create_retriever: PASSED")

print("-"*40)

# While loop to ask the user multiple questions
    
question = rag.get_user_question()
print("get_user_question: PASSED")

    # If that checks if the user types exit to exit the code

retrieved_docs = rag.retrieve_docs(retriever, question)
print("retrieve_docs: PASSED")

prompt = rag.create_prompt(retrieved_docs, question)
print("create_prompt: PASSED")

answer = rag.get_answer(llama_llm, prompt)
print("get_answer: PASSED")



print("-"*40)


#creating test cases so that  metics can be applied to dataset

#print metics data

retrieved_contexts = [doc.page_content for doc in retrieved_docs]

answer_relevancy_metric = AnswerRelevancyMetric(model=llama_llm)
test_case = LLMTestCase(
  input=question,
  actual_output=answer.content,
  retrieval_context=retrieved_contexts
)



dataset = EvaluationDataset(test_cases=[test_case])

dataset.evaluate([answer_relevancy_metric])