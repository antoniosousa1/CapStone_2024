def get_file_extension(file_path: str) -> str:

    return file_path.rsplit('.', 1)[-1].lower() #gets file extension