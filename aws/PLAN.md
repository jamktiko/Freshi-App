# Project Plan & Documentation: Kodin Ruokatarvikkeiden Ylläpitosovellus

## 1. Project Overview

This project is an Android-based mobile application designed to manage a household's grocery inventory ("Kodin ruokatarvikkeiden ylläpitosovellus"). Users can track their food items, scan barcodes, and take pictures of products. The application relies on a robust, highly available (99.5% uptime target), and low-latency (< 2s) backend infrastructure hosted on Amazon Web Services (AWS).

## 2. What We Have Done So Far

We have successfully transformed the raw architectural requirements into a production-ready, infrastructure-as-code (IaC) setup using AWS CloudFormation, while significantly optimizing for both cost and performance.

### A. Visual Architecture

- Created **`architecture3.excalidraw`**, a visually compelling architecture diagram detailing the user flow from the Android APK through the Edge, Compute, and Data layers of the AWS ecosystem.

### B. Infrastructure as Code (CloudFormation)

We created a modular, 4-stack CloudFormation setup located in the `aws/` directory. This modularity prevents accidental deletion of stateful data when updating compute resources. All stacks use parameterized cross-stack references via `Fn::ImportValue` for maintainability.

1.  **`aws/01-security-identity.yaml` (Name: FoodAppSecurityStack)**
    - **AWS Cognito:** Configured User Pools and App Clients to handle secure user registration, login, and JWT token management.
2.  **`aws/02-data-storage.yaml` (Name: FoodAppDataStack)**
    - **Amazon DynamoDB:** A Serverless NoSQL table (`FoodItems`) configured for "Pay Per Request" with `DeletionPolicy: Retain` to prevent accidental data loss. Also includes a dedicated `UserDevices` table (also with `DeletionPolicy: Retain`) for tracking mobile push notification tokens.
    - **Amazon S3:** Secure bucket for storing food images uploaded by the Android app.
    - **Amazon CloudFront:** A CDN securely connected to S3 via Origin Access Control (OAC) to cache and deliver images to the mobile app. Uses the modern OAC-only configuration (no legacy `S3OriginConfig`).
3.  **`aws/03-compute-backend.yaml` (Name: FoodAppComputeStack)**
    - **Amazon API Gateway (HTTP API):** Acts as a secure HTTPS frontend that transparently proxies all Android app requests to the internal Elastic Beanstalk instance. Configured with throttling (20 req/s steady, 50 burst) to prevent cost abuse.
    - **AWS Elastic Beanstalk (Node.js 24):** The API backend handling requests. Configured as `SingleInstance` to drastically reduce costs while relying on API Gateway for secure ingress.
    - **IAM Roles (Instance Profile):** Strict, principle-of-least-privilege permissions attached to the EC2 instance role. This includes:
      - DynamoDB: Full CRUD on both the main table AND all Global Secondary Indexes (`TableArn/index/*`).
      - S3: PutObject, GetObject, DeleteObject on the image bucket.
      - Amazon Bedrock: `InvokeModel` + `InvokeModelWithResponseStream` (required for the Converse API used by the backend).
      - CloudWatch: Logging and metric publishing.
    - **Environment Variables:** `DYNAMODB_TABLE`, `DEVICES_TABLE`, `S3_BUCKET`, `BEDROCK_REGION`, `BEDROCK_MODEL_ID`, `AWS_REGION`, `COGNITO_USER_POOL_ID`, and `COGNITO_REGION` are all injected automatically from cross-stack outputs.
4.  **`aws/04-notifications.yaml` (Name: FoodAppNotificationStack)**
    - **Amazon EventBridge:** Cron rule to trigger push notifications every morning at 9 AM Helsinki time (6 AM UTC).
    - **AWS Lambda (nodejs20.x):** Placeholder function deployed via CloudFormation. The actual firebase-admin logic should be deployed via CI/CD by zipping `backend/services/notification-lambda.js` with its dependencies.
    - **AWS Secrets Manager:** Secure, encrypted vault holding the Firebase JSON private key (`freshi/firebase-service-account`). The placeholder value must be replaced via AWS Console with the real Firebase service account JSON.

### C. Node.js Backend Implementation

The backend team implemented the foundational backend codebase required for the API and Cloud integrations:

1.  **`backend/app.js` (Core Server):**
    - Express application with CORS, JSON parsing, and route handlers for health, items, uploads, and AI endpoints.
    - Global error handler for unhandled exceptions.
2.  **`backend/services/ai-extraction.service.js` (AI Service):**
    - Receives OCR text from the mobile app, sends it to Amazon Bedrock (Nova Lite) via the Converse API, and returns structured JSON (product name, brand, expiration date, confidence).
3.  **`backend/services/dynamo.service.js` (Data Service):**
    - CRUD operations for DynamoDB using the AWS SDK v3 DocumentClient.
4.  **`backend/services/s3.service.js` (Storage Service):**
    - Uploads image buffers to S3 with private ACL.
5.  **`backend/services/notification-lambda.js` (Lambda Function Code):**
    - EventBridge-triggered Lambda that queries DynamoDB for expiring items, groups by user, fetches device tokens, and sends Firebase FCM notifications. Uses CommonJS (required for Lambda deployment separate from the ESM backend).
6.  **`backend/middleware/auth.middleware.js` (Authentication):**
    - Cognito JWT verification via JWKS. Currently commented out during development — **must be re-enabled before production**.

### D. Frontend Implementation (Ionic/Angular)

The frontend team scaffolded the Ionic 8 + Angular 20 + Capacitor mobile application:

1.  **Authentication flow:** Register, Confirm email, and Login pages using AWS Amplify SDK and Cognito.
2.  **Tab-based navigation:** Bottom tab bar with Register, Confirm, and Login tabs.
3.  **Core feature UI (item management, camera/OCR):** Not yet implemented — pending frontend development.

## 3. Key Technical Decisions & Optimizations

- **Region Selection (Frankfurt `eu-central-1`):** We deploy to Frankfurt because it allows us to utilize the EU Cross-Region Inference Profile for Amazon Bedrock (`eu.amazon.nova-lite-v1:0`). Frankfurt guarantees sub-50ms latency to Finland, safely beating the 2-second SLA.
- **Edge OCR + AI Architecture:** We consciously removed AWS Rekognition from the cloud stack to save costs. Instead, OCR text extraction is performed _locally_ on the mobile device (Edge Computing). The extracted string is then sent to the backend and processed by Amazon Bedrock (Nova Lite) to dynamically extract only the essentials: **Product Name**, **Brand**, and **Expiration Date**.
- **Streamlined Data Model:** DynamoDB is strictly configured to save the AI-extracted fields alongside an `s3ImageKey`. This key permanently links the database record to the original **Picture** of the product stored in S3, which the mobile app can load instantly via CloudFront.
- **Optimized Access Patterns (DynamoDB GSIs):** Since the Ionic mobile app caches all products locally on-device and handles all filtering/sorting client-side, we deliberately reduced the GSIs to only those required for **server-side operations**. This reduces write costs by 62.5% (every write replicates to base table + 2 GSIs instead of 7):
  - `LastUpdateIndex`: The sync engine. The app queries "give me everything changed since timestamp X" to update its local cache with only delta changes. Combined with the `IsDeleted` soft-delete boolean, this enables efficient incremental sync.
  - `NotificationQueryIndex`: Used exclusively by the Lambda notification function to efficiently find items approaching expiration across all users, partitioned by `NotificationStatus` and sorted by `ExpirationDate`.
  - _Removed indexes:_ `ExpirationDateIndex`, `NameIndex`, `CategoryIndex`, `BrandIndex`, and `OpenedDateIndex` were removed because all sorting and filtering is performed client-side on the device's local cache. Keeping them would have been pure write cost waste.
- **DynamoDB TTL (Auto-Cleanup):** Both tables use DynamoDB's native Time-To-Live feature to automatically delete stale data at zero cost:
  - `FoodItems`: TTL is set to `expirationDate + 30 days` (Unix epoch seconds). Expired food items are automatically purged after a 30-day grace period, preventing infinite table growth.
  - `UserDevices`: TTL is set to 90 days from the last app open. Stale FCM tokens from uninstalled apps are automatically cleaned up, preventing the notification Lambda from pushing to dead devices.
- **DeletionPolicy: Retain:** Both DynamoDB tables have `DeletionPolicy: Retain` so that a `cloudformation delete-stack` does not destroy user data.
- **API Gateway Throttling:** The HTTP API stage is configured with rate limiting (20 req/s, 50 burst) to prevent cost abuse from excessive Bedrock API calls.

#### NoSQL Physical Diagram: Access Pattern Matrix

| Access Pattern (What the app needs to do) | Index Used                 | Partition Key        | Sort Key (Sorting/Filtering)  |
| :---------------------------------------- | :------------------------- | :------------------- | :---------------------------- |
| **Get all items for a user (initial sync)**| `Main Table`              | `UserId`             | `ItemId`                      |
| **Sync offline device changes (delta)**   | `LastUpdateIndex`          | `UserId`             | `LastUpdate` (> lastSyncTime) |
| **Find items expiring soon (Lambda)**     | `NotificationQueryIndex`   | `NotificationStatus` | `ExpirationDate` (ASC)        |
| **Sort/filter by name, category, brand**  | _Client-side (on-device cache)_ | —            | —                             |

#### DynamoDB Key Schema — Backend Must Match

The CloudFormation table defines these exact attribute names:

| Attribute         | Type   | Usage                                                  |
| :---------------- | :----- | :----------------------------------------------------- |
| `UserId`          | String | Partition key (main table + LastUpdateIndex)            |
| `ItemId`          | String | Sort key (main table)                                  |
| `ExpirationDate`  | String | Sort key (NotificationQueryIndex), format: `YYYY-MM-DD`|
| `NotificationStatus` | String | Partition key (NotificationQueryIndex), values: `PENDING` / `SENT` |
| `LastUpdate`      | String | Sort key (LastUpdateIndex), ISO 8601 timestamp         |

> **⚠️ IMPORTANT:** Backend code MUST use these exact attribute names when writing to DynamoDB. Do NOT use `PK`/`SK` or any other naming convention — the GSIs depend on these specific names.

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
4. _What it does:_ The script dynamically fetches the latest Node.js 24 Beanstalk platform and deploys all four CloudFormation stacks (Security → Data → Compute → Notifications) in sequential order, respecting cross-stack dependencies.

### Updating Existing Infrastructure

All changes to CloudFormation templates can be deployed as **in-place updates** using the same `./deploy.sh` script. CloudFormation automatically creates a change set, shows what will change, and applies it. No teardown is required for configuration changes.

### Shutting Down the Infrastructure

To destroy all resources and stop all AWS billing:

1. Navigate to the `aws/` directory in your terminal.
2. Make sure the script is executable: `chmod +x teardown.sh`
3. Run: `./teardown.sh`
4. _What it does:_ The script automatically locates your S3 bucket, safely deletes all uploaded images (AWS blocks bucket deletion if images exist), and then systematically deletes the four CloudFormation stacks in reverse dependency order.

> **Note:** DynamoDB tables have `DeletionPolicy: Retain` and will NOT be deleted by the teardown script. To permanently delete them, use the AWS Console or CLI manually. This is a safety measure to prevent accidental data loss.

## 5. CI/CD Pipeline & GitHub-AWS Integration

The `Freshi-App` repository is fully equipped with both Continuous Integration (CI) and Continuous Deployment (CD) pipelines.

### Continuous Integration (CI)

Located in `.github/workflows/backend-ci.yml`.

- Triggers on Pull Requests and pushes to `main`/`dev`.
- Uses `npm ci` for deterministic, lockfile-based dependency installation.
- Runs an **import sanity check** that individually imports every route and service module to catch missing dependencies before they reach production.
- Runs the mocked Jest test suite.
- If any step fails, GitHub blocks the code from merging.

### Continuous Deployment (CD) - Automatic on PR Merge

Located in `.github/workflows/backend-cd.yml`.

- **Fully Automated:** When a Pull Request is merged into `main` that touches `backend/**` files, the CD pipeline triggers automatically.
- **Path Filtering:** Only backend code changes trigger a deploy — frontend-only PRs do **not** cause unnecessary AWS deployments.
- **Manual Fallback:** The pipeline also supports `workflow_dispatch` (Manual Trigger) as a fallback. Go to the **Actions** tab, select the **Backend CD Pipeline**, and click **Run workflow**.
- **Pipeline Steps:** Install dependencies (`npm ci`) → Import sanity check → Jest tests → Zip backend (excluding `node_modules`, `.git`, `tests`) → Deploy to Elastic Beanstalk via `einaregilsson/beanstalk-deploy@v21`.

### Required: AWS and GitHub Secrets Integration

For the CD pipeline to have permission to upload code to AWS, you must configure GitHub Secrets.

1. Log into AWS Console -> IAM -> Users.
2. Create a user (e.g., `GitHubActionsDeployer`) and attach a custom policy with permissions scoped to Elastic Beanstalk deploy actions and S3 artifact upload (avoid `AdministratorAccess` — use least privilege).
3. Generate an **Access Key** for this user.
4. Open your GitHub Repository -> **Settings** -> **Secrets and variables** -> **Actions**.
5. Add a New Repository Secret:
   - Name: `AWS_ACCESS_KEY_ID`
   - Value: (Paste the Key)
6. Add another Repository Secret:
   - Name: `AWS_SECRET_ACCESS_KEY`
   - Value: (Paste the Secret)

Once this is done, every merged PR touching backend code will be live on AWS in under 2 minutes!

### Important: Lockfile Versioning

The `package-lock.json` file is committed to the repository. Both CI and CD pipelines use `npm ci` (not `npm install`) to ensure deterministic, reproducible builds. If you add a new dependency, always commit the updated `package-lock.json`.

## 6. Testing Strategy & Cost-Free Mocking

To guarantee the 99.5% uptime requirement without racking up AWS Bedrock or DynamoDB charges during testing, we implement a strictly **mocked** testing strategy using **Jest** and **Supertest**.

### A. Unit Tests (Cost-Free AWS Mocking)

- **Goal:** Test individual functions without making real AWS API calls.
- **AWS Mocking Strategy:** We use `aws-sdk-client-mock` to intercept AWS SDK v3 calls. This completely blocks real requests from reaching Amazon Bedrock, ensuring testing remains **100% free**.
- **Current Test:** `backend/tests/bedrock.test.js` — verifies the Bedrock Converse API integration using mocked responses.
- **Planned Test Cases:**
  - Verify `analyzeText()` successfully processes fake JSON injected by the mock.
  - Verify the system gracefully catches and handles invalid JSON (simulating a Bedrock hallucination).
  - Verify DynamoDB CRUD operations via mocked DocumentClient.

### B. Integration Tests (API Endpoints)

- **Goal:** Test the Express router and HTTP responses.
- **Tool:** `supertest` allows us to send fake HTTP requests to our Express app locally.
- **Planned Test Cases:**
  - `GET /items` without a JWT token -> Expect `401 Unauthorized`.
  - `POST /items` with valid payload -> Expect `201 Created` (using mocked DynamoDB).

### C. End-to-End (E2E) Tests

- **Goal:** Test the entire system exactly as a real user would experience it.
- **Execution:** These will be run manually against the real AWS environment. This is the _only_ backend testing phase that will hit the real Bedrock API.

### D. Frontend Testing (Android)

- **Goal:** Ensure the mobile application UI, Edge OCR processing, and AWS API integrations work flawlessly on the client device.
- **Implementation Phase:** Frontend testing (using frameworks like Espresso or Appium) will be implemented _after_ the frontend developers build the initial user interface.
- **Scope:** Tests will verify that the camera opens, the local OCR successfully extracts text strings, the app correctly authenticates with Cognito, and the app gracefully handles network failures when calling the API Gateway.

## 7. Current Project Status

| Area | Status | Owner |
| :--- | :----- | :---- |
| CloudFormation (4 stacks) | ✅ Complete & validated | Infra/DevOps |
| CI/CD Pipelines (CI + CD) | ✅ Complete | Infra/DevOps |
| Deploy/Teardown automation | ✅ Complete | Infra/DevOps |
| Backend routes & services | 🟡 Scaffolded — needs auth re-enable, key schema fix, CRUD routes | Backend dev |
| Unit tests | 🟡 1 test exists — needs alignment with production code | Backend dev + Infra |
| Frontend auth flow | 🟡 Scaffolded — needs environment file, auth guard, error handling | Frontend dev |
| Frontend core features | 🔴 Not started — item list, camera, OCR UI | Frontend dev |
