# Marani EDC
An Electronic Data Capture system compliant with 21 CFR Part 11.

## Setup
1. **Frontend**:
   - `cd frontend`
   - `npm install`
   - Configure Amplify: `amplify init`
   - Deploy: `amplify push`
2. **Terraform**:
   - `cd terraform`
   - `terraform init`
   - `terraform apply`

## Compliance Features
- S3: Versioning and Object Lock for immutable records.
- CloudTrail: Audit logging for all API actions.
- Cognito: Secure authentication with role-based access.