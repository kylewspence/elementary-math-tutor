# Long Division Tutor - Deployment Guide

This document provides instructions for deploying the Long Division Tutor application to various environments.

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

## Environment Configuration

The application uses environment variables for configuration. Before deploying, you should set up the appropriate environment variables.

1. Copy `env.example` to `.env` for local development or use environment variables in your deployment platform.

```bash
cp env.example .env
```

2. Adjust the variables as needed:

| Variable | Description | Default |
|----------|-------------|---------|
| VITE_API_BASE_URL | Base URL for the math problems API | https://www.bloshup.com:8181 |
| VITE_DEVICE_ID | Device ID for API authentication | 680810a0737ab55963f6223b |
| VITE_USE_API_PROBLEMS | Whether to use API for problems (if false, all problems are generated locally) | true |
| VITE_ALLOW_LEVEL_SKIPPING | Whether to allow users to skip to any level | true |
| VITE_ENABLE_LOGS | Whether to enable debug logs in production | false |

## Local Deployment

For local testing before production deployment:

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Preview the production build
npm run preview
```

## Vercel Deployment (Recommended)

The easiest way to deploy this application is using Vercel:

1. Make sure you have the Vercel CLI installed:
```bash
npm install -g vercel
```

2. Deploy to Vercel:
```bash
vercel --prod
```

3. If this is your first deployment, you'll be prompted to configure your project. Follow the instructions to link to your Vercel account.

4. Environment variables can be set in the Vercel dashboard under Project Settings > Environment Variables.

## Manual Deployment

For manual deployment to a standard web server:

1. Build the application:
```bash
npm run build
```

2. The build output will be in the `dist/` directory. 

3. Upload the contents of the `dist/` directory to your web server's public directory.

4. Configure your web server (Apache, Nginx, etc.) to serve the application, making sure to redirect all requests to `index.html` for client-side routing.

### Example Nginx Configuration

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## Security Considerations

1. **API Endpoint**: The current API uses HTTPS which is secure, but consider setting up proper CORS if needed.

2. **Environment Variables**: Ensure your environment variables are properly protected, especially in production.

3. **Device ID**: The device ID is currently hardcoded for development. For production, consider implementing a more secure authentication method.

## Monitoring & Maintenance

- Monitor the application logs for any errors or unusual activity.
- Keep dependencies updated regularly with `npm audit` and `npm update`.
- Test thoroughly after any updates or changes to dependencies.

## Troubleshooting

If you encounter issues during deployment:

1. Check that all environment variables are correctly set.
2. Verify that the API endpoint is accessible from your deployment environment.
3. Check browser console logs for any JavaScript errors.
4. Ensure your web server is correctly configured to serve single-page applications.

For further assistance, please open an issue on the GitHub repository. 