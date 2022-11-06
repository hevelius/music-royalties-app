#!/bin/sh
export FLASK_APP=./index.py
python3 -m flask --debug run -h 0.0.0.0 --port=8080