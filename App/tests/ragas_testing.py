from langchain_community.document_loaders import DirectoryLoader
from langchain_ollama import OllamaEmbeddings, ChatOllama

from ragas.llms import LangchainLLMWrapper
from ragas.embeddings import LangchainEmbeddingsWrapper
from ragas.testset import TestsetGenerator
from ragas.evaluation import EvaluationDataset
import pandas as pd

data_path = "./data"
llama_url = "http://localhost:11434/"
llama_model = "llama3.1:latest"
llm = ChatOllama(model=llama_model, base_url=llama_url)
llama_embeddings = OllamaEmbeddings(model=llama_model, base_url=llama_url)


loader = DirectoryLoader(path=data_path)
docs = loader.load()

print("passed loading docs")
print("#" * 40)

gen_llm = LangchainLLMWrapper(llm)
gen_embeddings = LangchainEmbeddingsWrapper(llama_embeddings)

print("passed langcahin wrappers")
print("#" * 40)

generator = TestsetGenerator(llm=gen_llm, embedding_model=gen_embeddings)

print("passed testset gen")
print("#" * 40)

dataset = generator.generate_with_langchain_docs(docs, testset_size=3)

df = pd.DataFrame(dataset)

print(df)