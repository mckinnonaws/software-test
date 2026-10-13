resource "aws_cloudwatch_log_group" "app" {
  name              = "/ecs/${local.project_prefix}"
  retention_in_days = 30
}
