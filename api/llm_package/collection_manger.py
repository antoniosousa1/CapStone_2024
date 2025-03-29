from langchain_milvus import Milvus
from langchain_ollama import OllamaEmbeddings
from langchain.schema import Document

from api.llm_package.document_management import DocumentManagement

from collections import namedtuple
from dotenv import load_dotenv
import os

# Get ENV variables
load_dotenv()
USER_ID = os.getenv("USER_ID")
MILVUS_SERVER_URL = os.getenv("MILVUS_SERVER_URL")

# Inialize variables
collection_name = f"user_{USER_ID}_collection"
embeddings = OllamaEmbeddings(model="llama3.1:latest")
doc_manager = DocumentManagement()

# Gets or creates the collection
def get_or_create_collection() -> Milvus:

    # Only creates collection after insertion of embeddings
    collection = Milvus(
        collection_name=collection_name,
        embedding_function=embeddings,
        connection_args={"uri": MILVUS_SERVER_URL},
        auto_id=True
    )
    print('collection made')

    return collection

# Adds docs to collection
# NOTE: Schema for collection is defined automatticaly from first docuemnts metadata
def add_docs_to_collection(collection: Milvus, splits: list[Document]) -> None:

    # Extract page content and metadata from documents
    text_splits = [doc.page_content for doc in splits]
    metadatas = [doc.metadata for doc in splits]

    # Debug statement
    if not text_splits:
        print("\nWarning: No valid content found in the documencts!\n")
        return

    # Add the new texts (documents) to the Milvus database
    collection.add_texts(
        texts=text_splits,
        metadatas=metadatas
    )

# Removes docs from collection passed on a list of doc names to remove
def remove_docs_from_collection(collection: Milvus, collection_name: str, docs_to_remove: list[str]) -> None:

    collection.client.delete(
        collection_name=collection_name,
        filter=f"source in {docs_to_remove}"
    )

# Creates a list of the document names in the collection
def view_docs_in_collection(collection: Milvus, collection_name: str) -> list:

    # Queries collection to get source doc names, page_numbers, and PKs
    data = collection.client.query(
        collection_name=collection_name,
        output_fields=["source", "page_number", "pk"],
        filter="",
        limit = "1000"
    )

    # Set of document names from the query data
    doc_set = set()
    for x in data:
        doc_set.add(x["source"])

    # Parses back to a list for future use
    docs = list(doc_set)

    return docs

# Drops the collection
def drop_collection(collection: Milvus, collection_name: str) -> None:

    collection.client.drop_collection(
        collection_name=collection_name
    )
    print("collection dropped")

############################################################


# Define a mock Document class to simulate document splits
DocumentSplit = namedtuple('DocumentSplit', ['page_content', 'metadata'])

# Create some mock document splits
mock_splits = [
    DocumentSplit(page_content="This is the first page of the document.", metadata={
                  "source": "doc1", "page_number": 1}),
    DocumentSplit(page_content="This is the second page of the document.", metadata={
                  "source": "doc1", "page_number": 2}),
    DocumentSplit(page_content="Content from a different document.",
                  metadata={"source": "doc2", "page_number": 1}),
]

##############################################################

collection = get_or_create_collection()

#print(f"Documents before delete {view_docs_in_collection(collection=collection, collection_name=collection_name)}")
#remove_docs_from_collection(collection=collection, collection_name=collection_name, docs_to_remove=view_docs_in_collection(collection=collection, collection_name=collection_name))
#print(f"Documents after delete {view_docs_in_collection(collection=collection, collection_name=collection_name)}")
#add_docs_to_collection(collection=collection, splits=mock_splits)
#drop_collection(collection=collection, collection_name=collection_name)

collection.client.close()