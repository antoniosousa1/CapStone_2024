from deepeval.synthesizer import Synthesizer
from deepeval.synthesizer.config import ContextConstructionConfig
from langchain_ollama import ChatOllama, OllamaEmbeddings
from langchain.vectorstores.base import VectorStoreRetriever

from deepeval.models import DeepEvalBaseLLM, DeepEvalBaseEmbeddingModel
from deepeval.dataset import EvaluationDataset
from deepeval.metrics import AnswerRelevancyMetric
from deepeval.test_case import LLMTestCase

##To Add##################################################

#implemnt pydantic libraray to enforece json output

#try larger sample data set

#fix inputs and maybe gives users chance to pick vaible inputs

#

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

#llama model and embeddings
llama_llm = LlamaLLM()
llama_embeddings = LlamaLLMEmbeddings()

#initalize dataset and deepeval metrics
dataset = EvaluationDataset()
ccc = ContextConstructionConfig(embedder=llama_embeddings, chunk_size=75, critic_model=llama_llm)
answer_relevancy_metric = AnswerRelevancyMetric(threshold=0.7, model=llama_llm)


#initliize sythesizer and generate goldens from docs and place them into dataset
llama_synthesizer = Synthesizer(model=llama_llm)
dataset.generate_goldens_from_docs(
    synthesizer=llama_synthesizer, 
    document_paths=["./data/dog.txt", "./data/cowboy.txt"], 
    context_construction_config=ccc
)

#creating test cases so that  metics can be applied to dataset
for golden in dataset.goldens:
    print("#" * 40)
    print("Golden: ")
    for x in golden:
        print(x)
    # Compute actual output
    actual_output = llama_llm.generate(golden.input)  

    #add test cases with the goldens data and the acual output to run 
    dataset.add_test_case(
        LLMTestCase(
            input=golden.input,
            actual_output=actual_output,
            expected_output=golden.expected_output,
            context=golden.context
        )
    )





#print metics data
print("#" * 40)
print("metric:")
print(dataset.evaluate([answer_relevancy_metric]))
