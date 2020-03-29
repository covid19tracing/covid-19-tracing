#!/bin/bash

cd "$(dirname "$0")"
curl -X POST http://localhost:8080 -H "Content-Type: application/json" --data-binary "@data.json"
