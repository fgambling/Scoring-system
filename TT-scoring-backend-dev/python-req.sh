#!/bin/bash

# Step 1: Change directory to `python`
cd python

# Step 2: Create virtual environment and install packages
python -m venv ./venv
source ./venv/bin/activate
pip install lemminflect
pip install nltk

# Step 3: Run `req.py`
python req.py

# Optional: Deactivate virtual environment
deactivate