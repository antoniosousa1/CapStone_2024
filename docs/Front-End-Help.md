## Front-End:


# How to Run:

1 Terminal Method:

    Open a terminal and cd into the program
    It should look something like:
    .../CapStone_2024
    run these 2 commands one after another:

    `chmod +x run_script.sh`
    
    `./run_script.sh`

OR

2 Terminal Method:

    Open 2 terminals and cd into the program
    It should look something like:
    .../CapStone_2024

    Terminal 1:
        Run this command in T1:

        streamlit run frontend/streamlit_gui.py


    Terminal 2:
        Run this command in T2:

        python3 /backend/api_routes.py

    Make sure both are running at the same time and click into your local host. (Shown in Terminal 1)






# Chat Page:

    How to Use:
    - Type into the text box provided
    - LLMs will process the user input and provide an output based on what context it finds in the provided documents in the "Documents Page"


    How to Write a Prompt:
    1. When the program is running, click the "chat" tab on the left hand side.
    2. Click on the bar at the bottom that says "type to chat"
    3. Enter a question about documents in the databse
    4. Make sure to check the "database" tab to make sure a document you are referencing exists

    How to write a better response:
    1. Provide as much detail as possible, the more info you provide an LLM, the more context it will search for.
    2. Be specific when requesting a certain output format. EX: "In 3 sentences..."



# Documents Page:

    Accepted File Types:
    - .PDF
    - .DOC
    - .DOCX
    - .PPTX
    - .TXT

    File Upload:
    - Click on "Upload File" Button and the user's File Explorer will open
    - Select file(s) from the user's folder
        - File Type must be consistent with "Accepted File Types"
    - Click on "Process Files" when ready to add files to the database
    - The file processing might take some time to run

    Delete All Files:
    - Click on "Purge Database" Button
    - A popup window will appear
    - Select "Yes"
    - All files and data in the databse will be erased
        - This process is irreversable

    File Search:
    - Click on the "Search Bar"
    - Type in any desired file in the databse

    







