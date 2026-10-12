AnyCompany's monolith app

## Demo app

A minimal [Topcoat](https://github.com/tokio-rs/topcoat) (tokio.rs) server used as a
mock API for local development.

```sh
cargo run
```

Then open <http://127.0.0.1:3000>. Override the bind address with `HOST` and `PORT`.

### Endpoints

| Method | Path          | Response                              |
| ------ | ------------- | ------------------------------------- |
| GET    | `/`           | `Hello, World!` HTML page             |
| GET    | `/health`     | `{"status":"ok"}`                     |
| GET    | `/api`        | `{"message":"Hello, World!"}`         |
| GET    | `/api/health` | `{"status":"ok"}`                     |
