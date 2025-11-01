@echo off
echo Starting Ollama with CORS enabled...
set OLLAMA_ORIGINS=*
echo OLLAMA_ORIGINS=%OLLAMA_ORIGINS%
ollama serve

