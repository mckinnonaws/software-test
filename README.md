AnyCompany's monolith app

## Mock FastAPI backend

A basic mock FastAPI backend used for demos lives in `mock_backend/`.

### Run locally

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r mock_backend/requirements.txt
uvicorn mock_backend.main:app --reload
```

Then open http://127.0.0.1:8000/ for the hello world response, or
http://127.0.0.1:8000/docs for the interactive API docs.

### Tests

```bash
pip install pytest httpx
pytest mock_backend
```
