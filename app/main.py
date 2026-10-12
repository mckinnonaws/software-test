from fastapi import FastAPI

app = FastAPI(
    title="AnyCompany Demo API",
    description="Mock FastAPI server for the demo app.",
    version="0.1.0",
)


@app.get("/")
def read_root() -> dict[str, str]:
    return {"message": "Hello World"}


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}
