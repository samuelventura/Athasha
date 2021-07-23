#!/bin/sh -x

FOLDER="$(dirname "$0")"
curl -Lo $FOLDER/babel.js https://unpkg.com/@babel/standalone/babel.min.js
