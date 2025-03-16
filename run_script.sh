#!/bin/bash

#fix this later
echo "Starting backend..."
python3 api/routes.py &

echo "Starting frontend..."
streamlit run frontend/streamlit_gui.py

wait