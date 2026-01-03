# CI/CD Workflows

This directory contains GitHub Actions workflows for continuous integration and deployment.

## Workflows

### 1. CI (`ci.yml`)
Runs on every push and pull request to `main` and `develop` branches.

**Jobs:**
- **Lint & Type Check**: Runs ESLint and TypeScript type checking
- **Build**: Builds the Next.js application to ensure it compiles correctly

### 2. CD (`cd.yml`)
Runs on pushes to `main` branch (production) and `develop` branch (staging).

**Jobs:**
- **Deploy to Production**: Deploys to production environment when code is pushed to `main`
- **Deploy to Staging**: Deploys to staging environment when code is pushed to `develop`

### 3. Test (`test.yml`)
Runs tests (currently just build test, add your test commands when ready).

## Setup Instructions

### 1. GitHub Secrets

Add the following secrets to your GitHub repository (Settings → Secrets and variables → Actions):

**Required for Production:**
- `VERCEL_TOKEN`: Your Vercel authentication token
- `VERCEL_ORG_ID`: Your Vercel organization ID
- `VERCEL_PROJECT_ID`: Your Vercel project ID
- `NEXT_PUBLIC_API_URL`: Production API URL
- `NEXT_PUBLIC_SOCKET_URL`: Production WebSocket URL

**Required for Staging:**
- `NEXT_PUBLIC_API_URL_STAGING`: Staging API URL
- `NEXT_PUBLIC_SOCKET_URL_STAGING`: Staging WebSocket URL

### 2. Vercel Setup (Recommended)

1. Install Vercel CLI: `npm i -g vercel`
2. Login: `vercel login`
3. Link your project: `vercel link`
4. Get your tokens:
   - `VERCEL_TOKEN`: Get from https://vercel.com/account/tokens
   - `VERCEL_ORG_ID`: Found in `.vercel/project.json` after linking
   - `VERCEL_PROJECT_ID`: Found in `.vercel/project.json` after linking

### 3. Alternative Deployment Options

If you're not using Vercel, you can:

1. **Use a different deployment platform**: Update the deployment step in `cd.yml`
2. **Deploy to your own server**: Uncomment the SSH deployment section in `cd.yml` and add:
   - `SERVER_HOST`: Your server hostname/IP
   - `SERVER_USER`: SSH username
   - `SERVER_SSH_KEY`: SSH private key

### 4. Environment Variables

Make sure to set all required environment variables in:
- GitHub Secrets (for CI/CD)
- Vercel Dashboard (for deployments)
- Your deployment platform

## Workflow Triggers

- **CI**: Runs on every push/PR to `main` or `develop`
- **CD Production**: Runs on push to `main` branch
- **CD Staging**: Runs on push to `develop` branch
- **Manual**: You can also trigger CD manually from GitHub Actions tab

## Adding Tests

When you add tests, update `test.yml` and `package.json`:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:e2e": "playwright test"
  }
}
```

Then uncomment the test steps in `test.yml`.

