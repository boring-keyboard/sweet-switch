#!/bin/bash

# 修改manifest.json中的版本号
sed -i '' 's/"version": ".*"/"version": "'$1'"/g' manifest.json

# 压缩成zip并已bot-{版本号}命名
zip -r releases/sweet-switch-$1.zip . -x ".*" -x "__MACOSX" -x "release.sh" -x "server/*" -x "*node_modules/*" -x "releases/*" -x package.json -x package-lock.json -x "*.DS_Store" 
