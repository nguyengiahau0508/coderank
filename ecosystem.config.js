module.exports = {
  apps: [
    {
      name: 'coderank-client',
      cwd: './coderank-client',
      script: 'npm',
      args: 'run pm2:start',
      env_development: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'coderank-api',
      cwd: './coderank-api',
      script: 'npm',
      args: 'run pm2:start',
      env_development: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'coderank-agent',
      cwd: './coderank-agent',
      script: 'npm',
      args: 'run pm2:start',
      env_development: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
};
