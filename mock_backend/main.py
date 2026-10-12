"""Mock FastAPI backend used for demos.

Run locally with:
    uvicorn mock_backend.main:app --reload
"""

from fastapi import FastAPI

app = FastAPI(
    title="AnyCompany Mock Backend",
    description="A basic mock backend used for demos.",
    version="0.1.0",
)


@app.get("/")
def read_root() -> dict[str, str]:
    return {"message": "Hello, World!"}


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}
