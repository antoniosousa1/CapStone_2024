from deepeval.synthesizer import Synthesizer
from typing import List
from deepeval.synthesizer.config import ContextConstructionConfig
from deepeval.models.base_model import DeepEvalBaseLLM
from deepeval.models import DeepEvalBaseEmbeddingModel
from langchain_ollama import ChatOllama, OllamaEmbeddings

"""
deepeval set-local-model --model-name=<model_name> \
    --base-url="http://localhost:11434/v1/" \
    --api-key="ollama"

deepeval unset-local-model


deepeval set-local-embeddings --model-name=<embedding_model_name> \
    --base-url="http://localhost:11434/v1/" \
    --api-key="ollama"

deepeval unset-local-embeddings
"""

class LlamaLLM(DeepEvalBaseLLM):

    def __init__(self, model):
        self.model = model

    def load_model(self):
        return self.model
    
    def generate(self, prompt: str) -> str:
        chat_model = self.load_model()
        return chat_model.invoke(prompt).content
    
    async def a_generate(self, prompt: str) -> str:
        chat_model = self.load_model()
        res = await chat_model.ainvoke(prompt)
        return res.content
    
    def get_model_name(self):
        return "Custom LLama Model"
    

class LlamaEmbedder(DeepEvalBaseEmbeddingModel):
    
    def __init__(self):
        pass

    def load_model(self):
        return OllamaEmbeddings(
            model="llama3.1:latest",
            base_url="http://localhost:11434/"
        )
    
    def embed_text(self, text: str) -> List[float]:
        embedding_model = self.load_model()
        return embedding_model.embed_query(text)

    def embed_texts(self, texts: List[str]) -> List[List[float]]:
        embedding_model = self.load_model()
        return embedding_model.embed_documents(texts)

    async def a_embed_text(self, text: str) -> List[float]:
        embedding_model = self.load_model()
        return await embedding_model.aembed_query(text)

    async def a_embed_texts(self, texts: List[str]) -> List[List[float]]:
        embedding_model = self.load_model()
        return await embedding_model.aembed_documents(texts)

    def get_model_name(self):
        "Custom LLama Embedding Model"
    

custom_model_llama = ChatOllama(
    model="llama3.1:latest",
    base_url="http://localhost:11434/",
    api_key="ollama"
)


llama_model = LlamaLLM(custom_model_llama)

llama_embedding = LlamaEmbedder()

answer = llama_model.generate("how are you")

print(answer)

synthesizer = Synthesizer(model=llama_model)

synthesizer.generate_goldens_from_docs(document_paths=["./data/dog.txt"], context_construction_config=ContextConstructionConfig(chunk_size=100, embedder=llama_embedding))

print(synthesizer.synthetic_goldens)