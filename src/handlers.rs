use axum::{
    extract::{Path, State},
    http::StatusCode,
    Json,
};
use crate::{db, models::*};
use crate::router::AppState;

pub async fn health() -> Json<Health> {
    Json(Health { status: "ok" })
}

pub async fn create_username(
    State(state): State<AppState>,
    Json(payload): Json<CreateUsername>,
) -> (StatusCode, Json<serde_json::Value>) {
    if let Err(e) = Username::validate(&payload.username) {
        return (
            StatusCode::BAD_REQUEST,
            Json(serde_json::json!({ "error": e })),
        );
    }
    match db::create(&state.pool, &payload.username).await {
        Ok(u) => (
            StatusCode::CREATED,
            Json(serde_json::to_value(u).unwrap_or_else(|_| serde_json::json!({}))),
        ),
        Err(e) => {
            if is_unique_violation(&e) {
                (
                    StatusCode::CONFLICT,
                    Json(serde_json::json!({ "error": "username already exists" })),
                )
            } else {
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(serde_json::json!({ "error": "internal error" })),
                )
            }
        }
    }
}

pub async fn get_username(
    State(state): State<AppState>,
    Path(username): Path<String>,
) -> (StatusCode, Json<serde_json::Value>) {
    match db::get(&state.pool, &username).await {
        Ok(Some(u)) => (
            StatusCode::OK,
            Json(serde_json::to_value(u).unwrap_or_else(|_| serde_json::json!({}))),
        ),
        Ok(None) => (
            StatusCode::NOT_FOUND,
            Json(serde_json::json!({ "error": "username not found" })),
        ),
        Err(_) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(serde_json::json!({ "error": "internal error" })),
        ),
    }
}

fn is_unique_violation(e: &sqlx::Error) -> bool {
    if let sqlx::Error::Database(db) = e {
        return db.code().as_deref() == Some("23505");
    }
    false
}
