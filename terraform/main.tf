provider "aws" {
  region = var.region
}

# VPC
resource "aws_vpc" "main" {
  cidr_block = var.vpc_cidr
  tags = { Name = "marani-edc-vpc" }
}

# Private Subnets
resource "aws_subnet" "private1" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = var.subnet1_cidr
  availability_zone = "${var.region}a"
  tags = { Name = "marani-edc-subnet-1" }
}

resource "aws_subnet" "private2" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = var.subnet2_cidr
  availability_zone = "${var.region}b"
  tags = { Name = "marani-edc-subnet-2" }
}

# DB Subnet Group
resource "aws_db_subnet_group" "main" {
  name       = "marani-edc-db-subnet-group"
  subnet_ids = [aws_subnet.private1.id, aws_subnet.private2.id]
  tags = { Name = "marani-edc-db-subnet-group" }
}

# RDS PostgreSQL with pgaudit
resource "aws_db_parameter_group" "main" {
  name   = "marani-edc-postgres-pgaudit"
  family = "postgres13"
  parameter {
    name         = "pgaudit.log"
    value        = "all"
    apply_method = "pending-reboot"
  }
}

resource "aws_db_instance" "postgres" {
  identifier           = "marani-edc-db"
  engine              = "postgres"
  engine_version      = "13"
  instance_class      = "db.t3.micro"
  allocated_storage   = 20
  storage_encrypted   = true
  multi_az            = true
  db_subnet_group_name = aws_db_subnet_group.main.name
  parameter_group_name = aws_db_parameter_group.main.name
  username            = var.db_username
  password            = var.db_password
  skip_final_snapshot = true
  vpc_security_group_ids = [aws_security_group.rds_sg.id]
}

# RDS Security Group
resource "aws_security_group" "rds_sg" {
  name        = "marani-edc-rds-security-group"
  vpc_id      = aws_vpc.main.id
  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr]
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# S3 Bucket with Object Lock
resource "aws_s3_bucket" "logs" {
  bucket = var.s3_bucket_name
  tags = { Name = "marani-edc-logs" }
}

resource "aws_s3_bucket_versioning" "logs_versioning" {
  bucket = aws_s3_bucket.logs.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_object_lock_configuration" "logs_lock" {
  bucket              = aws_s3_bucket.logs.id
  object_lock_enabled = "Enabled"
  rule {
    default_retention {
      mode = "COMPLIANCE"
      days = 365
    }
  }
  depends_on = [aws_s3_bucket_versioning.logs_versioning]
}

resource "aws_s3_bucket_server_side_encryption_configuration" "logs_encryption" {
  bucket = aws_s3_bucket.logs.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Cognito User Pool
resource "aws_cognito_user_pool" "main" {
  name             = var.cognito_user_pool_name
  mfa_configuration = "OPTIONAL"
  sms_configuration {
    external_id    = "marani-edc-sms-role"
    sns_caller_arn = aws_iam_role.cognito_sms.arn
  }
  password_policy {
    minimum_length    = 8
    require_lowercase = true
    require_numbers   = true
    require_symbols   = true
    require_uppercase = true
  }
}

resource "aws_cognito_user_pool_client" "app" {
  name                = "marani-edc-app-client"
  user_pool_id        = aws_cognito_user_pool.main.id
  explicit_auth_flows = ["ALLOW_USER_PASSWORD_AUTH", "ALLOW_REFRESH_TOKEN_AUTH"]
}

resource "aws_iam_role" "cognito_sms" {
  name = "marani-edc-cognito-sms-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = { Service = "cognito-idp.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy" "cognito_sms_policy" {
  role = aws_iam_role.cognito_sms.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = "sns:Publish"
      Resource = "*"
    }]
  })
}

# IAM Role for Lambda
resource "aws_iam_role" "lambda_role" {
  name = "marani-edc-lambda-rds-access"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
    }]
  })
}

resource "aws_iam_policy" "lambda_policy" {
  name = "marani-edc-lambda-rds-policy"
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = "rds-db:connect"
        Resource = aws_db_instance.postgres.arn
      },
      {
        Effect   = "Allow"
        Action   = ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents"]
        Resource = "*"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_attach" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = aws_iam_policy.lambda_policy.arn
}

# CloudTrail
resource "aws_cloudtrail" "main" {
  name                          = "marani-edc-trail"
  s3_bucket_name                = aws_s3_bucket.logs.id
  include_global_service_events = true
  is_multi_region_trail         = true
  enable_logging                = true
}

# CloudWatch Logs for RDS Audit
resource "aws_cloudwatch_log_group" "rds_logs" {
  name = "/aws/rds/instance/${aws_db_instance.postgres.identifier}/audit"
}