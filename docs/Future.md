## Things to consider in the Future


Develop an LLM to run in this program:
- For this project we used pretrained open source models. For the future it could be beneficial to see what developing an LLM specifically for a RAG pipeline could do to the answer quality and response time.

Ollama:
- Our system currently uses Ollama as the main hosting site for all of the used and tested LLMs. In the future it could be beneficial to attempt to see if alternatives, like HuggingFace, could be implemented as easily as Ollama does.

Evaluation Tool Improvements:
- For this program we attempted to get an evaluation tool working for this program but it took too much run time and the quality of the evaluators were not at a level we wanted so the idea was scrapped. Taking a look at this again in the future would be useful.

Chat Memory:
- Our project lacks the feel of a true "chatbot" like Chat-GPT. We tried to implement some memory features into the LLM but ran into a challenge where if multiple people access the program at the same time the memories of previous questions could overlap. To combat this issue having a way to store previous questions asked per user locally would be a potential solution. 

Similar Files:
- We were able to detect if the same file was uploaded to the database more than once, but if there is a slight variation to the document it will still be let in as its own new file. A future goal for this type of project would be to allow for only the LATEST version of a document to be added. This could be useful if a new version of a document gets added, like a 2nd draft. 

