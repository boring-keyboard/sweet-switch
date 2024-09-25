#!/bin/bash

sed -i '' 's/"version": ".*"/"version": "'$1'"/g' manifest.json

zip -r releases/sweet-switch-$1.zip . -x ".*" -x "__MACOSX" -x "release.sh" -x "server/*" -x "videos/*" -x "*node_modules/*" -x "releases/*" -x package.json -x package-lock.json -x "*.DS_Store" 
