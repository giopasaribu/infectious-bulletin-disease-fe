# Infectious Disease Bulletin Frontend

This is the frontend service for the Infectious Disease Bulletin application, built using React. It provides a user interface to visualize infectious disease data on a Gantt chart, with filtering options by disease name and year. The frontend communicates with the backend service to fetch disease data.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Project Setup](#project-setup)
- [Environment Variables](#environment-variables)
- [Running Locally](#running-locally)
- [Building and Deploying with CI/CD](#building-and-deploying-with-cicd)
- [Accessing the Application](#accessing-the-application)
- [Technologies Used](#technologies-used)
- [License](#license)

## Prerequisites
- Node.js 16+
- NPM or Yarn

## Project Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/infectious-disease-bulletin-frontend.git
   cd infectious-disease-bulletin-frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
   or, if you use yarn:
   ```bash
   yarn install
   ```

## Environment Variables
Create a `.env` file in the root directory of your project to manage environment variables.

### Example `.env` file
```env
REACT_APP_API_URL=http://your-backend-url
```
Replace `http://your-backend-url` with the URL of your backend's Application.

## Running Locally
To start the application in development mode:
```bash
npm start
```
or, if you use yarn:
```bash
yarn start
```
The application will start at `http://localhost:3000`.

## Building and Deploying with CI/CD

This project uses GitHub Actions for the CI/CD pipeline and is deployed to AWS S3.

### GitHub Actions Workflow (`deploy.yml`)

An example GitHub Actions workflow for deploying to S3 is as follows:

```yaml
name: Build and Deploy React App

on:
  push:
    branches:
      - main  # Change this if you're using a different branch

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install dependencies
        run: npm install

      - name: Build the React app
        env:
          REACT_APP_API_URL: ${{ secrets.REACT_APP_API_URL }}  # API URL from GitHub secrets
        run: npm run build

      - name: Deploy to S3
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          AWS_REGION: "ap-southeast-1"
          S3_BUCKET_NAME: "your-s3-bucket-name"
        run: |
          npm install -g aws-cli
          aws s3 sync build/ s3://$S3_BUCKET_NAME --delete
```

### Setting up Environment Variables in GitHub Secrets
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `REACT_APP_API_URL`
- `AWS_REGION`
- `S3_BUCKET_NAME`

These secrets should be configured in your GitHub repository settings.

## Accessing the Application
After deployment, the frontend can be accessed via the S3 bucket URL or a custom domain if you set up AWS CloudFront.

### Steps to Access:
1. Go to your S3 bucket in the AWS console.
2. Under the **Properties** tab, locate the **Static website hosting** section.
3. Use the **Bucket website endpoint** URL to access your application.

## Technologies Used
- **React 16**: Frontend library
- **React-Bootstrap**: Styling and layout
- **Highcharts Gantt**: Gantt chart visualization
- **Axios**: HTTP client for API communication
- **AWS S3**: Static site hosting
- **GitHub Actions**: CI/CD pipeline

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
