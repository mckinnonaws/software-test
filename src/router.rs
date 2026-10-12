use axum::{
    routing::{get, post},
    Router,
};
use sqlx::PgPool;
use tower_http::trace::TraceLayer;

#[derive(Clone)]
pub struct AppState {
    pub pool: PgPool,
}

pub fn build_router(pool: PgPool) -> Router {
    let state = AppState { pool };
    Router::new()
        .route("/health", get(crate::handlers::health))
        .route("/usernames", post(crate::handlers::create_username))
        .route("/usernames/:username", get(crate::handlers::get_username))
        .layer(TraceLayer::new_for_http())
        .with_state(state)
}
