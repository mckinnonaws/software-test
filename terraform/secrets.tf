resource "random_password" "db" {
  length  = 32
  special = false
}

resource "random_password" "app_secret_key" {
  length  = 48
  special = false
}

resource "aws_secretsmanager_secret" "database_url" {
  name = "${local.project_prefix}/database-url"
}

resource "aws_secretsmanager_secret" "app_secret" {
  name = "${local.project_prefix}/app-secret-key"
}

resource "aws_secretsmanager_secret_version" "app_secret" {
  secret_id     = aws_secretsmanager_secret.app_secret.id
  secret_string = local.secret_key_value
}

resource "aws_secretsmanager_secret_version" "database_url" {
  secret_id = aws_secretsmanager_secret.database_url.id
  secret_string = "postgresql+psycopg2://${var.database_username}:${random_password.db.result}@${aws_db_instance.main.address}:5432/${var.database_name}"
  depends_on    = [aws_db_instance.main]
}
