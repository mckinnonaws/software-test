output "vpc_id" {
  value = aws_vpc.main.id
}

output "alb_dns_name" {
  value = aws_lb.main.dns_name
}

output "ecr_repository_url" {
  value = aws_ecr_repository.app.repository_url
}

output "ecs_cluster_name" {
  value = aws_ecs_cluster.main.name
}

output "ecs_service_name" {
  value = aws_ecs_service.app.name
}

output "rds_endpoint" {
  value = aws_db_instance.main.address
}

output "cloudwatch_log_group" {
  value = aws_cloudwatch_log_group.app.name
}

output "database_secret_arn" {
  value = aws_secretsmanager_secret.database_url.arn
}
