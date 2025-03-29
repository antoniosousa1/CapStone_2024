# add docs to collection
# remove docs

from pymilvus import Collection, connections, MilvusClient
from dotenv import load_dotenv
from langchain_milvus import Milvus
from langchain_ollama import OllamaEmbeddings
from api.llm_package.document_management import DocumentManagement

import os
from uuid import uuid4

load_dotenv()

USER_ID = os.getenv("USER_ID")
MILVUS_SERVER_URL = os.getenv("MILVUS_SERVER_URL")
MILVUS_HOST = os.getenv("MILVUS_HOST")
MILVUS_PORT = os.getenv("MILVUS_PORT")

collection_name = f"user_{USER_ID}_collection"
embeddings = OllamaEmbeddings(model="llama3.1:latest")
doc_manager = DocumentManagement()

client = MilvusClient(
    uri="http://localhost:19530",
    token="root:Milvus"
)


def create_connection():
    # Create a connection to the Milvus server
    connections.connect(
        alias="default", 
        uri=MILVUS_SERVER_URL,
        user=USER_ID
    )
    print("Connection to Milvus established.")


def get_or_create_collection():

    # Creates collection if one does not exist
    # If one does exist initlizes collection
    # only creates after insertion of embeddings
    collection = Milvus(
        collection_name=collection_name,
        embedding_function=embeddings,
        connection_args={"uri": MILVUS_SERVER_URL},
        auto_id=True
    )
    print('collection made')
    return collection

# schema is defined automatticaly from first docuemnts metadata
def add_docs_to_collection(collection: Milvus, splits):
        """
        Updates the Milvus database by adding new document splits.
        """
        # Extract page content and metadata from documents
        text_splits = [doc.page_content for doc in splits]
        metadatas = [doc.metadata for doc in splits]

        if not text_splits:
            print("\nWarning: No valid content found in the documencts!\n")
            return

        # Add the new texts (documents) to the Milvus database
        collection.add_texts(
            texts=text_splits,
            metadatas=metadatas
        )
    

def remove_docs_from_collection(client: MilvusClient, docs_to_remove: list[str]):

    client.delete(
            collection_name=collection_name,
            filter=f"source in {docs_to_remove}"
                )

def view_docs_in_collection(collection_name: str):

    # creates collection object from collection name
    collection = Collection(collection_name)

    # queries collection to get source doc names, page_numbers, and PKs
    data = collection.query(
          expr="",
          output_fields=["source", "page_number", "pk"],
          limit="1000"
     )
    
    # set of document names
    doc_set = set()
    for x in data:
        print(x)
        doc_set.add(x["source"])

    docs = list(doc_set)
    
    return docs

def drop_collection(collection_name: str):
    collection = Collection(collection_name)
    collection.drop()
    print("collection dropped")


from collections import namedtuple

# Define a mock Document class to simulate document splits
DocumentSplit = namedtuple('DocumentSplit', ['page_content', 'metadata'])

# Create some mock document splits
mock_splits = [
    DocumentSplit(page_content="This is the first page of the document.", metadata={"source": "doc1", "page_number": 1}),
    DocumentSplit(page_content="This is the second page of the document.", metadata={"source": "doc1", "page_number": 2}),
    DocumentSplit(page_content="Content from a different document.", metadata={"source": "doc2", "page_number": 1}),
]

create_connection()
#Test adding the mock splits to the collection
col = get_or_create_collection()
add_docs_to_collection(col, mock_splits)

docs = view_docs_in_collection(collection_name=collection_name)
print(f"view docs before deleetion: {docs}")

remove_docs_from_collection(client=client, docs_to_remove=docs)

print(f"View docs after dleeteation {view_docs_in_collection(collection_name=collection_name)}")
connections.disconnect("default")