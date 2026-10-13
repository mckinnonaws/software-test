variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "environment" {
  type    = string
  default = "dev"
}

variable "project_name" {
  type    = string
  default = "anycompany-monolith"
}

variable "vpc_cidr" {
  type    = string
  default = "10.0.0.0/16"
}

variable "container_port" {
  type    = number
  default = 8000
}

variable "task_cpu" {
  type    = number
  default = 512
}

variable "task_memory" {
  type    = number
  default = 1024
}

variable "desired_count" {
  type    = number
  default = 1
}

variable "image_tag" {
  type    = string
  default = "latest"
}

variable "database_name" {
  type    = string
  default = "monolith"
}

variable "database_username" {
  type    = string
  default = "monolith"
}

variable "database_instance_class" {
  type    = string
  default = "db.t3.micro"
}

variable "database_allocated_storage" {
  type    = number
  default = 20
}

variable "database_engine_version" {
  type    = string
  default = "15.7"
}

variable "admin_email" {
  type    = string
  default = "admin@example.com"
}

variable "admin_password" {
  type      = string
  default   = "admin"
  sensitive = true
}

variable "app_secret_key" {
  type      = string
  default   = ""
  sensitive = true
}

variable "certificate_arn" {
  type    = string
  default = ""
}

variable "deletion_protection" {
  type    = bool
  default = false
}

variable "skip_final_snapshot" {
  type    = bool
  default = true
}
