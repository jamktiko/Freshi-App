# Project Plan & Documentation: Kodin Ruokatarvikkeiden Ylläpitosovellus

## 1. Project Overview

This project is an Android-based mobile application designed to manage a household's grocery inventory ("Kodin ruokatarvikkeiden ylläpitosovellus"). Users can track their food items, scan barcodes, and take pictures of products. The application relies on a robust, highly available (99.5% uptime target), and low-latency (< 2s) backend infrastructure hosted on Amazon Web Services (AWS).

## 2. What We Have Done So Far

We have successfully transformed the raw architectural requirements into a production-ready, infrastructure-as-code (IaC) setup using AWS CloudFormation, while significantly optimizing for both cost and performance.

### A. Visual Architecture

- Created **`architecture3.excalidraw`**, a visually compelling architecture diagram detailing the user flow from the Android APK through the Edge, Compute, and Data layers of the AWS ecosystem.

### B. Infrastructure as Code (CloudFormation)

We created a modular, 3-part CloudFormation stack located in the `aws/` directory. This modularity prevents accidental deletion of stateful data when updating compute resources.

1.  **`aws/01-security-identity.yaml`**
    - **AWS Cognito:** Configured User Pools and App Clients to handle secure user registration, login, and JWT token management.
2.  **`aws/02-data-storage.yaml` (Name: FoodAppDataStack)**
    - **Amazon DynamoDB:** A Serverless NoSQL table (`FoodItems`) configured for "Pay Per Request". Also includes a dedicated `UserDevices` table for tracking mobile push notification tokens.
    - **Amazon S3:** Secure bucket for storing food images uploaded by the Android app.
    - **Amazon CloudFront:** A CDN securely connected to S3 via Origin Access Control (OAC) to cache and deliver images blazingly fast to the mobile app.
3.  **`aws/03-compute-backend.yaml`**
    - **Amazon API Gateway (HTTP API):** Acts as a secure HTTPS frontend that transparently proxies all Android app requests to the internal Elastic Beanstalk instance.
    - **AWS Elastic Beanstalk (Node.js 24):** The API backend handling requests. Configured as `SingleInstance` to drastically reduce costs while relying on API Gateway for secure ingress.
    - **IAM Roles (Instance Profile):** Strict, principle-of-least-privilege permissions attached exactly to the EC2 instance role (`aws-elasticbeanstalk-ec2-role`). This includes explicitly defined permissions for DynamoDB on both the main table AND all Global Secondary Indexes (`TableArn/index/*`) to prevent query crashes. It also includes secure access to S3 (objects), Amazon Bedrock (Nova Lite), and CloudWatch.
4.  **`aws/04-notifications.yaml` (Name: FoodAppNotificationStack)**
    - **Amazon EventBridge:** Cron rule to trigger push notifications every morning at 9 AM Helsinki time (6 AM UTC).
    - **AWS Lambda:** Securely pulls the Firebase credentials, executes the expiration logic against DynamoDB, and sends Google FCM Push Notifications directly to user devices.
    - **AWS Secrets Manager:** Secure, encrypted vault holding the Firebase JSON private key (`freshi/firebase-service-account`).

### C. Node.js Backend Implementation

We implemented the foundational backend codebase required for the API and Cloud integrations:

1.  **`backend/package.json` & `backend/server.js` (Core Server):**
    - Created a fully deployable Node.js Express application.
    - Includes a specialized diagnostic endpoint (`/test-aws`) that actively pings DynamoDB, S3, and Amazon Bedrock to verify that all IAM roles and network connections are functioning perfectly.
2.  **`backend/src/services/imageAnalyzer.js` (AI Service):**
    - Created the Node.js logic that receives local OCR text from the mobile app, interacts with Amazon Bedrock (Nova Lite model) via the Converse API for structured AI analysis, and persists the result to DynamoDB.

## 3. Key Technical Decisions & Optimizations

- **Region Selection (Frankfurt `eu-central-1`):** We deploy to Frankfurt because it allows us to utilize the EU Cross-Region Inference Profile for Amazon Bedrock (`eu.amazon.nova-lite-v1:0`). Frankfurt guarantees sub-50ms latency to Finland, safely beating the 2-second SLA.
- **Edge OCR + AI Architecture:** We consciously removed AWS Rekognition from the cloud stack to save costs. Instead, OCR text extraction is performed _locally_ on the mobile device (Edge Computing). The extracted string is then sent to the backend and processed by Amazon Bedrock (Nova Lite) to dynamically extract only the essentials: **Product Name**, **Brand**, and **Expiration Date**.
- **Streamlined Data Model:** DynamoDB is strictly configured to save the AI-extracted fields alongside an `s3ImageKey`. This key permanently links the database record to the original **Picture** of the product stored in S3, which the mobile app can load instantly via CloudFront.
- **Optimized Access Patterns (DynamoDB GSIs):** Because DynamoDB requires exact query planning, we implemented 6 Global Secondary Indexes on the `FoodItems` table (all using `UserId` as the Partition Key for security and isolation):
  - `ExpirationDateIndex`: Solves the core app requirement by fetching a user's items sorted chronologically by expiration date.
  - `NameIndex`: Allows alphabetical sorting and querying by product name.
  - `CategoryIndex`: Enables fast filtering for category views (e.g., "Dairy").
  - `BrandIndex`: Enables filtering by brand.
  - `OpenedDateIndex` (Sparse Index): Ultra-fast and cost-effective sparse index. Since unopened items have a `null` OpenedDate, they are excluded entirely. Querying this index _only_ returns items that are currently open, sorted by how long they have been open.
  - `LastUpdateIndex`: Facilitates local data caching on the device. By tracking `LastUpdate` and an `IsDeleted` boolean, the app only queries delta changes since its last sync. This dramatically reduces DynamoDB read costs and improves app performance.
- **Cost Optimization (SingleInstance):** Disabled Elastic Beanstalk's default Load Balancer (saving ~$15-20/month) by explicitly defining the environment as `SingleInstance` running in 1 Availability Zone.
- **Performance Optimization (t3.small):** Upgraded the default instance type from `micro` to `t3.small` (2 vCPU, 2GB RAM) to ensure the Node.js backend has enough memory to process API requests and image handling concurrently without latency spikes.
- **Dynamic Platform Versions:** Configured the template to allow manual input of the exact Elastic Beanstalk Solution Stack Name to prevent deployment failures when AWS deprecates older minor versions.

## 4. Automated Infrastructure Deployment & Teardown

To eliminate manual work and avoid accidental AWS charges, we have fully automated the setup and destruction of the cloud infrastructure using the AWS CLI.

### Prerequisites

1. Install the [AWS CLI](https://aws.amazon.com/cli/).
2. Run `aws configure` in your terminal and enter your AWS Access Key, Secret Key, and set the default region to `eu-central-1`.

### Spinning Up the Infrastructure

To instantly deploy the entire production environment:

1. Navigate to the `aws/` directory in your terminal.
2. Make sure the script is executable: `chmod +x deploy.sh`
3. Run: `./deploy.sh`
4. _What it does:_ The script dynamically fetches the latest Node.js 24 Beanstalk platform and deploys the Security, Data, and Compute CloudFormation stacks in perfect sequential order.

### Shutting Down the Infrastructure

To destroy all resources and stop all AWS billing:

1. Navigate to the `aws/` directory in your terminal.
2. Make sure the script is executable: `chmod +x teardown.sh`
3. Run: `./teardown.sh`
4. _What it does:_ The script automatically locates your S3 bucket, safely deletes all uploaded images (AWS blocks bucket deletion if images exist), and then systematically deletes the three CloudFormation stacks.

## 5. CI/CD Pipeline & GitHub-AWS Integration

The `Freshi-App` repository is fully equipped with both Continuous Integration (CI) and Continuous Deployment (CD) pipelines.

### Continuous Integration (CI)

Located in `.github/workflows/backend-ci.yml`.

- Triggers on Pull Requests and pushes to `main`/`dev`.
- Automatically runs `npm install` and the mocked Jest tests inside the `backend/` directory.
- If a developer breaks the API logic, GitHub will block the code from merging.

### Continuous Deployment (CD) - Manual Trigger

Located in `.github/workflows/backend-cd.yml`.

- **Safety First:** To prevent accidental overwrites while development occurs in separate test repos, this pipeline is set to `workflow_dispatch` (Manual Trigger).
- **How to Deploy:** Log into GitHub, go to the **Actions** tab, select the **Backend CD Pipeline**, and click **Run workflow**.
- **What it does:** It zips the `backend/` folder and deploys it straight to the `FoodAppBackend` Elastic Beanstalk environment.

### Required: AWS and GitHub Secrets Integration

For the CD pipeline to have permission to upload code to AWS, you must configure GitHub Secrets.

1. Log into AWS Console -> IAM -> Users.
2. Create a user (e.g., `GitHubActionsDeployer`) and attach the policy: `AdministratorAccess-AWSElasticBeanstalk` (or create a custom restricted policy).
3. Generate an **Access Key** for this user.
4. Open your GitHub Repository -> **Settings** -> **Secrets and variables** -> **Actions**.
5. Add a New Repository Secret:
   - Name: `AWS_ACCESS_KEY_ID`
   - Value: (Paste the Key)
6. Add another Repository Secret:
   - Name: `AWS_SECRET_ACCESS_KEY`
   - Value: (Paste the Secret)

Once this is done, every push to `main` will be live on AWS in under 2 minutes!

## 6. Testing Strategy & Cost-Free Mocking

To guarantee the 99.5% uptime requirement without racking up AWS Bedrock or DynamoDB charges during testing, we will implement a strictly **mocked** testing strategy using **Jest** and **Supertest**.

### A. Unit Tests (Cost-Free AWS Mocking)

- **Goal:** Test individual functions without making real AWS API calls.
- **AWS Mocking Strategy:** We use `aws-sdk-client-mock` to intercept AWS SDK v3 calls. This completely blocks real requests from reaching Amazon Bedrock, ensuring testing remains **100% free**.
- **Test Cases:**
  - Verify `analyzeText()` successfully processes fake JSON injected by the mock.
  - Verify the system gracefully catches and handles invalid JSON (simulating a Bedrock hallucination).

### B. Integration Tests (API Endpoints)

- **Goal:** Test the Express router and HTTP responses.
- **Tool:** `supertest` allows us to send fake HTTP requests to our Express app locally.
- **Test Cases:**
  - `GET /items` without a JWT token -> Expect `401 Unauthorized`.
  - `POST /items` with valid payload -> Expect `201 Created` (using mocked DynamoDB).

### C. End-to-End (E2E) Tests

- **Goal:** Test the entire system exactly as a real user would experience it.
- **Execution:** These will be run manually against the real AWS environment. This is the _only_ backend testing phase that will hit the real Bedrock API.

### D. Frontend Testing (Android)

- **Goal:** Ensure the mobile application UI, Edge OCR processing, and AWS API integrations work flawlessly on the client device.
- **Implementation Phase:** Frontend testing (using frameworks like Espresso or Appium) will be implemented _after_ the frontend developers build the initial user interface.
- **Scope:** Tests will verify that the camera opens, the local OCR successfully extracts text strings, the app correctly authenticates with Cognito, and the app gracefully handles network failures when calling the API Gateway.

## 7. Current Project Status: Ready for Development

All foundational planning, cloud infrastructure (IaC), CI/CD scaffolding, and backend testing strategies are **100% complete and approved**. The production repository (`Freshi-App`) has been scaffolded with the initial AWS Mock testing framework. The project is officially ready for the development team to begin writing the frontend and backend application code!
