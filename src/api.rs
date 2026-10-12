use serde::Serialize;
use topcoat::{
    Result,
    router::{content::Json, route},
};

mod health;

#[derive(Serialize)]
struct Hello {
    message: &'static str,
}

#[route(GET)]
async fn hello() -> Result<Json<Hello>> {
    Ok(Json(Hello {
        message: "Hello, World!",
    }))
}
