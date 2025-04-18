variable "region" {
  description = "AWS region to deploy resources"
  default     = "us-east-1"
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  default     = "10.0.0.0/16"
}

variable "subnet1_cidr" {
  description = "CIDR block for private subnet 1"
  default     = "10.0.1.0/24"
}

variable "subnet2_cidr" {
  description = "CIDR block for private subnet 2"
  default     = "10.0.2.0/24"
}

variable "db_username" {
  description = "Username for RDS database"
  default     = "admin"
}

variable "db_password" {
  description = "Password for RDS database"
  default     = "SecurePassword123!" # Replace with a secure password in production
}

variable "s3_bucket_name" {
  description = "Name of the S3 bucket for logs"
  default     = "marani-edc-logs-bucket"
}

variable "cognito_user_pool_name" {
  description = "Name of the Cognito User Pool"
  default     = "marani-edc-user-pool"
}