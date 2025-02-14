from deepeval.synthesizer import Synthesizer
from deepeval.synthesizer.config import ContextConstructionConfig
from langchain_ollama import ChatOllama, OllamaEmbeddings

from deepeval.models import DeepEvalBaseLLM, DeepEvalBaseEmbeddingModel

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

    def embed_texts(self, texts: list[str]) -> list[list[float]]:
        embedding_model = self.load_model()
        return embedding_model.embed_documents(texts)

    async def a_embed_text(self, text: str) -> list[float]:
        embedding_model = self.load_model()
        return await embedding_model.aembed_query(text)

    async def a_embed_texts(self, texts: list[str]) -> list[list[float]]:
        embedding_model = self.load_model()
        return await embedding_model.aembed_documents(texts)

##########################################################


llama_llm = LlamaLLM()
llama_embeddings = LlamaLLMEmbeddings()

synthesizer = Synthesizer(model=llama_llm)
synthesizer.generate_goldens_from_docs(document_paths=["./data/dog.txt"], context_construction_config=ContextConstructionConfig(embedder=llama_embeddings, chunk_size=50, critic_model=llama_llm))
for i in range(len(synthesizer.synthetic_goldens)):
    print("#" * 40)
    print(f"Golden: {i}")
    for x in synthesizer.synthetic_goldens[i]:
        print(x)
    print("#" * 40)