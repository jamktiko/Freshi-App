# Freshi - Household Grocery Management

## Description

The application creates an easy way for the user to track the best-before dates of their own pantry groceries easily with a single app. The user can enter the best-before dates of their food items into the application, and the application will notify them of the approaching date. The purpose of the application is to reduce potential food waste and it is convenient with long-dated items, such as rice or canned goods. The application is intended for ordinary consumers who want to reduce food waste.

## Tech Stack

- **Frontend:** Ionic 8, Angular 20, Capacitor (Cross-platform mobile)
- **Backend:** Node.js 24, Express, Jest (Automated Testing)
- **Infrastructure (AWS):** Elastic Beanstalk, API Gateway (HTTP API v2), DynamoDB, S3, CloudFront
- **Identity & Security:** Amazon Cognito, AWS Secrets Manager
- **AI Integration:** Amazon Bedrock (Nova-2-Lite) via Edge OCR (`@capacitor-community/image-to-text`)
- **CI/CD:** GitHub Actions (Automated testing and Beanstalk deployment)

## Getting Started

### Prerequisites

- Node.js (v24 recommended)
- Angular CLI & Ionic CLI
- AWS CLI (Configured for `eu-central-1`)

### Local Development

**1. Backend:**

```bash
cd backend
npm install
npm test            # Run mocked unit tests
npm start           # Starts the backend express server on port 3000
```

**2. Frontend:**

```bash
cd frontend
npm install
npm start           # Serves the Angular frontend on localhost:4200
```

### AWS Infrastructure Deployment

The environment is entirely built using Infrastructure-as-Code (CloudFormation). To spin up or update the cloud environment:

```bash
cd aws
./deploy.sh
```

## Authors

- **Sanni Pöykiö** - UI/UX
- **Samuli Ilomäki** - AWS/CI/CD
- **Konsta Poikolainen** - Backend
- **Jarkko Remes** - Frontend

## Version History

- **1.0.** - Cloud Infrastructure, AI OCR pipeline, and CI/CD integration

## License

This project is licensed under the CC BY-SA 4.0 License - see the [license.md](license.md) file for details.
