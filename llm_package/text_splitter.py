from langchain_text_splitters import RecursiveCharacterTextSplitter  # For splitting documents into chunks
from langchain.schema import Document  # Document schema class

# Function to split documents into smaller chunks for processing
class TextSplitter():
    
    def split_text(self, docs: list[Document]) -> list[Document]:

        # Initialize the RecursiveCharacterTextSplitter with parameters for chunk size and overlap
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=600, chunk_overlap=200, add_start_index=True
        )

        for doc in docs:
            doc.metadata["filename"] = doc.metadata.get("source", "unknown")  # Add filename metadata for easy deletion later
            
        # Split the documents into chunks and return the result
        splits = text_splitter.split_documents(docs)
        
        return splits