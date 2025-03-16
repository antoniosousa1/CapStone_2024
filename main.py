from flask import Flask
from api.routes import api  # Import the routes blueprint

def create_app():
    # Create the Flask app
    app = Flask(__name__)

    # Register the API blueprint with the app
    app.register_blueprint(api, url_prefix='/api')  # '/api' is the route prefix

    # Optionally, configure the app (e.g., for development, debugging)
    app.config['DEBUG'] = True

    return app

# Run the application
if __name__ == '__main__':
    app = create_app()
    app.run(host="0.0.0.0", port=5001)
