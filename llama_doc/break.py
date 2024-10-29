while True:
    user_input = input("Type 'exit' to quit: ")
    if user_input.lower() == '/bye':
        print("Exiting the loop.")
        break
    else:
        print(f"You entered: {user_input}")
