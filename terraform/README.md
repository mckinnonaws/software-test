# AnyCompany Monolith Terraform

Deploys the containerized FastAPI monolith to AWS using ECS Fargate, an application load balancer, and RDS PostgreSQL.

## Prerequisites

- Terraform 1.5+
- AWS credentials with permission to create VPC, ECS, RDS, ECR, Secrets Manager, IAM, and CloudWatch resources
- Docker

## Usage

1. Copy `terraform.tfvars.example` to `terraform.tfvars` and edit values.
2. Initialize and apply:

```bash
terraform init
terraform plan
terraform apply
```

3. Build and push the application image to the ECR repository output:

```bash
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
REGION=${AWS_REGION:-us-east-1}
ECR_URL=$(terraform output -raw ecr_repository_url)
aws ecr get-login-password --region "$REGION" | docker login --username AWS --password-stdin "$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com"
docker build -t "$ECR_URL:latest" .
docker push "$ECR_URL:latest"
```

4. Force a new ECS deployment after the first image push:

```bash
aws ecs update-service --cluster "$(terraform output -raw ecs_cluster_name)" --service "$(terraform output -raw ecs_service_name)" --force-new-deployment
```

The service health check uses `/health`. Database migrations are handled by the application startup table creation; for schema changes run Alembic separately before deployment.

## Remote state

The default backend is local. For shared environments, configure an S3 backend with DynamoDB locking in `versions.tf` before `terraform init`.
