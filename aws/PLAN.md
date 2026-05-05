# Project Plan & Documentation: Kodin Ruokatarvikkeiden Ylläpitosovellus

## 1. Project Overview

This project is an Android-based mobile application designed to manage a household's grocery inventory ("Kodin ruokatarvikkeiden ylläpitosovellus"). Users can track their food items, scan barcodes, and take pictures of products. The application relies on a robust, highly available (99.5% uptime target), and low-latency (< 2s) backend infrastructure hosted on Amazon Web Services (AWS).

## 2. What We Have Done So Far

We have successfully transformed the raw architectural requirements into a production-ready, infrastructure-as-code (IaC) setup using AWS CloudFormation, while significantly optimizing for both cost and performance.

### A. Visual Architecture

- Created **`architecture3.excalidraw`**, a visually compelling architecture diagram detailing the user flow from the Android APK through the Edge, Compute, and Data layers of the AWS ecosystem.

### B. Infrastructure as Code (CloudFormation)

We created a modular, 4-stack CloudFormation setup located in the `aws/` directory. This modularity prevents accidental deletion of stateful data when updating compute resources. All stacks use parameterized cross-stack references via `Fn::ImportValue` for maintainability.

1.  **`aws/00-vpc-network.yaml` (Name: FoodAppVpcStack)**
    - **Enterprise VPC:** Deploys a custom VPC with 2 Public Subnets and 2 Private Subnets.
    - **NAT Gateway & EIP:** Allows the private subnets to securely access the internet and AWS APIs.
    - **DynamoDB VPC Endpoint:** A free Gateway Endpoint routing DynamoDB traffic privately, saving on NAT Gateway data transfer costs.
2.  **`aws/01-security-identity.yaml` (Name: FoodAppSecurityStack)**
    - **AWS Cognito:** Configured User Pools and App Clients to handle secure user registration, login, and JWT token management.
    - **AWS Secrets Manager:** Automatically generates and stores a shared secret (`freshi/api-gateway-secret`) to secure the Beanstalk Application Load Balancer from direct internet access.
3.  **`aws/02-data-storage.yaml` (Name: FoodAppDataStack)**
    - **Amazon DynamoDB:** A Serverless NoSQL table (`FoodItems`) configured for "Pay Per Request". (Uses `DeletionPolicy: Retain` in production, but removed in dev for clean teardowns).
    - **Amazon S3:** Secure bucket for storing food images uploaded by the Android app.
    - **Amazon CloudFront:** A CDN securely connected to S3 via Origin Access Control (OAC) to cache and deliver images to the mobile app. Uses the modern OAC-only configuration.
4.  **`aws/03-compute-backend.yaml` (Name: FoodAppComputeStack)**
    - **Amazon API Gateway (HTTP API):** Acts as a secure HTTPS frontend. Configured with a **Cognito JWT Authorizer** (validating both ID Tokens and Access Tokens via Audience verification against the App Client ID) so it drops invalid traffic before hitting the backend, and injects the authenticated `x-user-id` header to the backend. It securely handles **CORS (Cross-Origin Resource Sharing)** centrally, eliminating the need for backend CORS middleware. It also securely fetches the Secrets Manager secret at deploy time and injects it as an `x-api-gateway-secret` header (with proper quoting for static values). Both headers use the `overwrite:header` mapping format (along with `$context.authorizer.jwt.claims.sub`) to prevent request spoofing. Configured with throttling (20 req/s steady, 50 burst). The integration securely proxies HTTP traffic directly to the backend load balancer over port 80.
      - **Public Routes:** `GET /` and `GET /health` are explicitly allowed through the API Gateway without JWT authentication (`AuthorizationType: NONE`) so that uptime monitoring tools can reach them safely. All other wildcard routes (`ANY /{proxy+}`) remain permanently locked.
    - **AWS Elastic Beanstalk (Node.js 24):** The API backend handling requests. Deployed in the **Private Subnets** inside the custom VPC for maximum security. Configured as `LoadBalanced` using an Application Load Balancer in the Public Subnets. The backend receives the `API_GATEWAY_SECRET` environment variable directly from Secrets Manager using CloudFormation dynamic resolution.
    - **IAM Roles (Instance Profile):** Strict, principle-of-least-privilege permissions attached to the EC2 instance role. This includes:
      - DynamoDB: Full CRUD on both the main table AND all Global Secondary Indexes (`TableArn/index/*`).
      - S3: PutObject, GetObject, DeleteObject on the image bucket.
      - Amazon Bedrock: `InvokeModel` + `InvokeModelWithResponseStream` (required for the Converse API used by the backend).
      - CloudWatch: Logging and metric publishing.
    - **Environment Variables:** `DYNAMODB_TABLE`, `S3_BUCKET`, `BEDROCK_REGION`, `BEDROCK_MODEL_ID`, `AWS_REGION`, `COGNITO_USER_POOL_ID`, and `COGNITO_REGION` are all injected automatically from cross-stack outputs.

### C. Node.js Backend Implementation

The backend team implemented the foundational backend codebase required for the API and Cloud integrations:

1.  **`backend/app.js` (Core Server):**
    - Express application with JSON parsing, and route handlers for health, items, uploads, and AI endpoints (CORS is handled globally by AWS API Gateway).
    - Global error handler for unhandled exceptions.
2.  **`backend/services/ai-extraction.service.js` (AI Service):**
    - Receives OCR text from the mobile app, sends it to Amazon Bedrock (Nova 2 Lite) via the Converse API, and returns structured JSON (product name, brand, expiration date, confidence).
3.  **`backend/services/dynamo.service.js` (Data Service):**
    - CRUD operations for DynamoDB using the AWS SDK v3 DocumentClient.
4.  **`backend/services/s3.service.js` (Storage Service):**
    - Uploads image buffers to S3 with private ACL.
5.  **`backend/middleware/auth.middleware.js` (Authentication):**
    - Cognito JWT verification via decoding the payload manually to extract `sub`. This allows API Gateway to proxy the request smoothly while preventing mapping failures.

### D. Frontend Implementation (Ionic/Angular)

The frontend team scaffolded the Ionic 8 + Angular 20 + Capacitor mobile application:

1.  **Authentication flow:** Register, Confirm email, and Login pages using AWS Amplify SDK and Cognito.
2.  **Tab-based navigation:** Bottom tab bar with Register, Confirm, and Login tabs.
3.  **New Component Architecture:** Skeleton folders created for `home`, `product-card`, and `summary-card` views, paving the way for the primary item list UI.
4.  **Local Storage (Waitlisting Data):** Developed `StorageService` using Capacitor Preferences to handle writing/reading AI-extracted products to and from the device's native local storage. Fully covered by offline Jasmine unit tests.
5.  **Search & Filtering Mechanism:** Implemented an Angular Pipe `ProductFilterPipe` for highly efficient client-side text searching (by Name, Brand, or Category) and sorting out expired items without needing to query the server or write slow frontend UI tests.

## 4. Key Technical Decisions & Optimizations

- **Test-Driven Development (TDD) Foundation:** We've laid the groundwork for robust security testing by implementing strict mock testing boundaries.
  - **AWS SDK Mocking:** We inject dummy `AWS_REGION` values inside GitHub Actions and use `aws-sdk-client-mock`. This allows tests to run continuously in CI/CD without making any real AWS API calls or incurring AWS billing charges.
  - **Stubbed Backend Tests:** Using Jest `.skip()`, we mapped out exact authorization logic parameters against missing/invalid JWT tokens.
  - **Golden Path E2E Testing:** Playwright testing is reserved only for a single critical user journey (`e2e/user-journey.spec.ts`) encompassing Registration -> Sign In -> Scan Product -> View Summary. Smaller functionalities (like local storage wrapping and list filtering) are tested with lightweight Angular/Jasmine unit tests instead of heavy UI rendering DOM checks.

- **Region Selection (Frankfurt `eu-central-1`):** We deploy to Frankfurt because it allows us to utilize the EU Cross-Region Inference Profile for Amazon Bedrock (`eu.amazon.nova-2-lite-v1:0`). Frankfurt guarantees sub-50ms latency to Finland, safely beating the 2-second SLA.
- **Edge OCR + AI Architecture:** We consciously removed AWS Rekognition from the cloud stack to save costs. Instead, OCR text extraction is performed _locally_ on the mobile device (Edge Computing). The extracted string is then sent to the backend and processed by Amazon Bedrock (Nova 2 Lite) to dynamically extract only the essentials: **Product Name**, **Brand**, and **Expiration Date**.
- **Streamlined Data Model:** DynamoDB is strictly configured to save the AI-extracted fields alongside an `s3ImageKey`. This key permanently links the database record to the original **Picture** of the product stored in S3, which the mobile app can load instantly via CloudFront.
- **Optimized Access Patterns (DynamoDB GSIs):** Since the Ionic mobile app caches all products locally on-device and handles all filtering/sorting client-side, we deliberately reduced the GSIs to only those required for **server-side operations**. This reduces write costs by 62.5% (every write replicates to base table + 2 GSIs instead of 7):
  - `LastUpdateIndex`: The sync engine. The app queries "give me everything changed since timestamp X" to update its local cache with only delta changes. Combined with the `isDeleted` soft-delete boolean, this enables efficient incremental sync.
  - _Removed indexes:_ `NotificationQueryIndex` (notifications are now completely offline/local via Capacitor on the device), `ExpirationDateIndex`, `NameIndex`, `CategoryIndex`, `BrandIndex`, and `OpenedDateIndex` were removed because all sorting and filtering is performed client-side on the device's local cache. Keeping them would have been pure write cost waste.
- **DynamoDB TTL (Auto-Cleanup):** The table uses DynamoDB's native Time-To-Live feature to automatically delete stale data at zero cost:
  - `FoodItems`: TTL is set to `expirationDate + 30 days` (Unix epoch seconds). Expired food items are automatically purged after a 30-day grace period, preventing infinite table growth.
- **DeletionPolicy: Retain:** The DynamoDB table has `DeletionPolicy: Retain` so that a `cloudformation delete-stack` does not destroy user data.
- **API Gateway Throttling:** The HTTP API stage is configured with rate limiting (20 req/s, 50 burst) to prevent cost abuse from excessive Bedrock API calls.

#### NoSQL Physical Diagram: Access Pattern Matrix

| Access Pattern (What the app needs to do)   | Index Used                      | Partition Key        | Sort Key (Sorting/Filtering)  |
| :------------------------------------------ | :------------------------------ | :------------------- | :---------------------------- |
| **Get all items for a user (initial sync)** | `Main Table`                    | `userId`             | `itemId`                      |
| **Sync offline device changes (delta)**     | `LastUpdateIndex`               | `userId`             | `lastUpdate` (> lastSyncTime) |
| **Sort/filter by name, category, brand**    | _Client-side (on-device cache)_ | —                    | —                             |

#### DynamoDB Key Schema — Backend Must Match

The CloudFormation table defines these exact attribute names:

| Attribute            | Type    | Usage                                                              |
| :------------------- | :------ | :----------------------------------------------------------------- |
| `userId`             | String  | Partition key (main table + LastUpdateIndex)                       |
| `itemId`             | String  | Sort key (main table)                                              |
| `lastUpdate`         | String  | Sort key (LastUpdateIndex), ISO 8601 timestamp                     |
| `isDeleted`          | Boolean | Soft delete flag used for client-side delta syncing                |
| `ttl`                | Number  | Unix epoch (seconds) for automatic expiration cleanup              |

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
4. _What it does:_ The script dynamically fetches the latest Node.js 24 Beanstalk platform and deploys all three CloudFormation stacks (Security → Data → Compute) in sequential order, respecting cross-stack dependencies.

### Updating Existing Infrastructure

All changes to CloudFormation templates can be deployed as **in-place updates** using the same `./deploy.sh` script. CloudFormation automatically creates a change set, shows what will change, and applies it. No teardown is required for configuration changes.

### Shutting Down the Infrastructure

To destroy all resources and stop all AWS billing:

1. Navigate to the `aws/` directory in your terminal.
2. Make sure the script is executable: `chmod +x teardown.sh`
3. Run: `./teardown.sh`
4. _What it does:_ The script automatically locates your S3 bucket, safely deletes all uploaded images (AWS blocks bucket deletion if images exist), and then systematically deletes the CloudFormation stacks.
   - **Note on Security Stack:** The `teardown.sh` script is explicitly configured to _skip_ deleting the Security Identity stack (`FoodAppSecurityStack`). This solves the developer complaint around Cognito: by preserving the User Pool during teardowns, the **App Client ID and Developer Users remain 100% static**. Backend and frontend developers no longer need to recreate users or update `.env` variables every time the ephemeral infrastructure is destroyed to save costs overnight.

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

## 6. Testing Strategy: "Pre-Wiring" with Mocks and Skip/Todo

Testing a product while it is actively being built requires a specific strategy so we don't break the CI/CD pipelines. We have successfully implemented a **"Pre-Wired" Testing Strategy** using Jest (Backend) and Playwright (Frontend).

### The Methodology: How we test missing code

Instead of writing commented-out code (which rots and gets forgotten), we pre-write the exact testing specifications and use testing flags to keep the CI/CD pipelines green:

1. **`test.todo('description')`**: Used when the target code (like an API route) doesn't exist yet. Jest logs it as a literal "to-do" task for the developer. CI passes.
2. **`test.skip('description', ...)`**: Used when we have written the actual test code (like an E2E journey), but the UI isn't ready. Jest skips execution but remembers the test exists. CI passes.

When developers build the missing features, they simply remove `.todo` or `.skip` to activate the test.

### A. Unit Tests (Backend)

- **Goal:** Test pure logic and functions in absolute isolation.
- **Status:** **✅ Fully Active**. We built `backend/utils/expiry.js` (pure date math without AWS dependencies) and have active, passing tests in `expiry.test.js` using Jest fake timers.
- **Cost-Free AWS Mocking:** For tests that touch AWS (like `ai-extraction.test.js`), we use `aws-sdk-client-mock`. This intercepts calls to Amazon Bedrock, ensuring zero cost and instantaneous execution. Currently, the Bedrock mock test is `.skip`ped pending the backend developer finalizing the AI service logic.

### B. Integration Tests (Backend API)

- **Goal:** Test the Express router HTTP responses (Login -> Create -> Delete flow).
- **Status:** **📝 Scaffolded via `.todo()`**. The file `items-api.test.js` is built with a list of `test.todo()` placeholders that exactly match the product specification.
- **Future Execution:** Once the backend developer builds the CRUD routes, they will replace the `todo`s with Supertest calls that mock DynamoDB.

### C. End-to-End (E2E) Tests (Frontend Browser)

- **Goal:** Simulate a complete user journey exactly as a human would experience it.
- **Status:** **⏭️ Scaffolded via `.skip()`**. We chose **Playwright** as the E2E framework. The complete user journey (Register -> Add photo -> Sort -> Logout) is fully pre-written in `frontend/e2e/user-journey.spec.ts`.
- **How it works:** We guessed the HTML IDs (e.g., `#add-product-btn`). The frontend team must use these IDs when building the UI. Because the UI doesn't exist yet, the entire test block is wrapped in `test.skip()`.

### D. Frontend CI Pipeline (`frontend-ci.yml`)

- We have created a dedicated GitHub Actions workflow for the frontend.
- It triggers automatically on changes to the `frontend/` directory.
- It installs Playwright and executes the test suite. Because our E2E tests are `.skip`ped, the pipeline succeeds and stays green, proving the infrastructure works before the product is even finished.

## 7. Current Project Status

| Area                              | Status                                                             | Owner        |
| :-------------------------------- | :----------------------------------------------------------------- | :----------- |
| CloudFormation (4 stacks)         | ✅ Complete & validated                                            | Infra/DevOps |
| CI/CD Pipelines (CI + CD)         | ✅ Complete                                                        | Infra/DevOps |
| Testing Infrastructure & Strategy | ✅ Complete (Jest + Playwright configured)                         | Infra/DevOps |
| Backend routes & services         | 🟡 Scaffolded — needs auth re-enable, key schema fix, CRUD routes  | Backend dev  |
| Frontend auth flow                | 🟡 Scaffolded — needs environment file, auth guard, error handling | Frontend dev |
| Frontend core features            | 🔴 Not started — item list, camera, OCR UI                         | Frontend dev |

## 8. Security stack takedown

aws cloudformation delete-stack --stack-name FoodAppSecurityStack
