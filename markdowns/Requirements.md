## Required Installations to run this code:

    langchain==0.3.3
    langchain-chroma==0.1.4
    langchain-community==0.3.2
    langchain-core==0.3.12
    langchain-ollama==0.2.0
    langchain-text-splitters==0.3.0
    langchain-milvus==0.1.7
    pymilvus==2.5.6
    unstructured==0.16.2
    unstructured[pdf, docx, pptx]==0.16.2
    ragas==0.2.13
    streamlit==1.41.1
    watchdog==6.0.0
    Flask==3.1.0
    python-dotenv==1.0.1

It is important to note what installations are required for security purposes

LangChain:
    LLM framework we used to help build our RAG pipeline

Ollama:
    LLM manager

Milvus:
    Database we used to store documents

unstructured:
    Document type storage

ragas:
    RAG evaluation tool

Streamlit:
    Front end development tool

watchdog:
    Observer tool to aid in database creation

Flask:
    Front-End development tool

ENV:
    Allow for the creation of different users



