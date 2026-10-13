locals {
  project_prefix = "${var.project_name}-${var.environment}"
  db_identifier  = "${local.project_prefix}-postgres"
  secret_key_value = var.app_secret_key != "" ? var.app_secret_key : random_password.app_secret_key.result
}
