export const deploymentConfig = {
  development: {
    apiUrl: 'http://localhost:3000/api',
    appUrl: 'http://localhost:3000'
  },
  staging: {
    apiUrl: 'https://staging.your-app.com/api',
    appUrl: 'https://staging.your-app.com'
  },
  production: {
    apiUrl: 'https://your-app.com/api',
    appUrl: 'https://your-app.com'
  }
};

export type Environment = keyof typeof deploymentConfig;

export const currentEnvironment = (process.env.NEXT_PUBLIC_ENVIRONMENT || 'development') as Environment;

export const config = deploymentConfig[currentEnvironment]; 