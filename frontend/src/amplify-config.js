import { Amplify } from 'aws-amplify';

Amplify.configure({
  aws_project_region: 'us-east-1',
  aws_cognito_identity_pool_id: 'us-east-1:87b36cf9-0a31-4afd-aaba-eeebcba4160a',
  aws_cognito_region: 'us-east-1',
  aws_user_pools_id: 'us-east-1_rwJycGjs2',
  aws_user_pools_web_client_id: '62u907c3n3gb10h0pnqtasvdgi',
  oauth: {},
  aws_cognito_username_attributes: [],
  aws_cognito_social_providers: [],
  aws_cognito_signup_attributes: ['EMAIL'],
  aws_cognito_mfa_configuration: 'OFF',
  aws_cognito_mfa_types: ['SMS'],
  aws_cognito_password_protection_settings: {
    passwordPolicyMinLength: 8,
    passwordPolicyCharacters: [],
  },
  aws_cognito_verification_mechanisms: ['EMAIL'],
  API: {
    endpoints: [
      {
        name: 'submissionApi',
        endpoint: 'https://qfsy464koj.execute-api.us-east-1.amazonaws.com/dev',
        region: 'us-east-1',
      },
      {
        name: 'formsApi',
        endpoint: 'https://zqdgsyvv07.execute-api.us-east-1.amazonaws.com/dev',
        region: 'us-east-1',
      },
    ],
  },
});

export default Amplify;