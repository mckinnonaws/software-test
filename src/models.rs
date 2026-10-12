use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Username {
    pub username: String,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateUsername {
    pub username: String,
}

#[derive(Debug, Serialize)]
pub struct Health {
    pub status: &'static str,
}


impl Username {
    pub fn validate(username: &str) -> Result<(), String> {
        if username.is_empty() {
            return Err("username must not be empty".to_string());
        }
        if username.len() > 64 {
            return Err("username must be at most 64 characters".to_string());
        }
        if !username
            .chars()
            .all(|c| c.is_ascii_alphanumeric() || matches!(c, '_' | '.' | '-'))
        {
            return Err("username contains invalid characters".to_string());
        }
        Ok(())
    }
}
