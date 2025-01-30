from langchain_community.document_loaders import DirectoryLoader
from langchain_ollama import OllamaEmbeddings, ChatOllama

from ragas.llms import LangchainLLMWrapper
from ragas.embeddings import LangchainEmbeddingsWrapper
from ragas.testset import TestsetGenerator

import pandas as pd

data_path = "./data"
llama_model = "llama3.1:latest"
llm = ChatOllama(model=llama_model)
llama_embeddings = OllamaEmbeddings(model=llama_model)


loader = DirectoryLoader(path=data_path)
docs = loader.load()

gen_llm = LangchainLLMWrapper(llm)
gen_embeddings = LangchainEmbeddingsWrapper(llama_embeddings)

generator = TestsetGenerator(llm=gen_llm, embedding_model=gen_embeddings)
dataset = generator.generate_with_langchain_docs(docs, testset_size=3)

df = pd.DataFrame(dataset)

print(df)