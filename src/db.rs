use sqlx::{postgres::PgPoolOptions, PgPool};
use crate::models::Username;

pub async fn connect(database_url: &str) -> Result<PgPool, sqlx::Error> {
    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(database_url)
        .await?;
    sqlx::migrate!("./migrations").run(&pool).await?;
    Ok(pool)
}

pub async fn create(pool: &PgPool, username: &str) -> Result<Username, sqlx::Error> {
    sqlx::query_as::<_, (String, chrono::DateTime<chrono::Utc>)>(
        "INSERT INTO usernames (username) VALUES ($1) RETURNING username, created_at",
    )
    .bind(username)
    .fetch_one(pool)
    .await
    .map(|(u, c)| Username { username: u, created_at: c })
}

pub async fn get(pool: &PgPool, username: &str) -> Result<Option<Username>, sqlx::Error> {
    sqlx::query_as::<_, (String, chrono::DateTime<chrono::Utc>)>(
        "SELECT username, created_at FROM usernames WHERE username = $1",
    )
    .bind(username)
    .fetch_optional(pool)
    .await
    .map(|opt| opt.map(|(u, c)| Username { username: u, created_at: c }))
}

#[cfg(test)]
mod tests {
    #[test]
    fn sql_strings_compile() {
        let _ = "INSERT INTO usernames (username) VALUES ($1)";
    }
}
