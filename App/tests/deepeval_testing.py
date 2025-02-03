from deepeval.synthesizer import Synthesizer
from deepeval.synthesizer.config import ContextConstructionConfig

"""
deepeval set-local-model --model-name=llama3.1:latest \
    --base-url="http://localhost:11434/v1/" \
    --api-key="ollama"

deepeval unset-local-model


deepeval set-local-embeddings --model-name=llama3.1:latest \
    --base-url="http://localhost:11434/v1/" \
    --api-key="ollama"

deepeval unset-local-embeddings
"""


synthesizer = Synthesizer()

#requires minium of 3 chunks so you must adjust chunk size accordingly
synthesizer.generate_goldens_from_docs(document_paths=["./data/dog.txt"], context_construction_config=ContextConstructionConfig(chunk_size=50))


print(synthesizer.synthetic_goldens)