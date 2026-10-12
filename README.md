AnyCompany's monolith app

## Demo API (mock FastAPI server)

A minimal hello-world FastAPI server used to mock the demo app's backend.

### Setup

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements-dev.txt
```

### Run

```bash
uvicorn app.main:app --reload
```

The server starts on http://127.0.0.1:8000. Interactive docs are available at
http://127.0.0.1:8000/docs.

### Endpoints

| Method | Path      | Response                  |
| ------ | --------- | ------------------------- |
| GET    | `/`       | `{"message": "Hello World"}` |
| GET    | `/health` | `{"status": "ok"}`        |

### Test

```bash
pytest
```
