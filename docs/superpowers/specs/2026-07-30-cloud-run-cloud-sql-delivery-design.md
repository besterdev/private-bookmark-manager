# Cloud Run and Cloud SQL Delivery Design

## Goal

Deploy the Private Bookmark Manager frontend and backend to Google Cloud Run, with the backend securely connected to the existing Cloud SQL for MySQL instance.

## Architecture

Two independent Cloud Run services are deployed in the same Google Cloud project and region:

- `bookmark-api` runs the existing NestJS backend container and receives its database connection configuration only at runtime.
- `bookmark-web` runs the existing static frontend container and is built with the deployed backend's HTTPS URL.

The API service is attached to the existing Cloud SQL instance through the Cloud SQL connector. It mounts the `/cloudsql/<instance-connection-name>` Unix socket. The backend's `DATABASE_URL` is stored in Secret Manager and references that socket; neither database credentials nor connection details are committed to Git.

## Delivery workflow

The new deployment workflow runs on pushes to `main` and supports manual dispatch. It uses GitHub Actions Workload Identity Federation to obtain a short-lived Google Cloud credential without a service-account key.

It performs these actions in order:

1. Authenticate to Google Cloud through the configured Workload Identity Provider and deployer service account.
2. Build and publish the backend image to Artifact Registry.
3. Deploy `bookmark-api` with the Cloud SQL instance attachment, runtime secrets, required Auth0 environment variables, and port 3001.
4. Read the deployed API URL.
5. Build and publish the frontend image with that API URL plus its public Auth0 configuration.
6. Deploy `bookmark-web` and emit both deployed service URLs.

The existing pull-request CI workflow remains responsible for lint, typecheck, tests, E2E, and build. Repository branch protection should require CI before merge so the deploy workflow only runs for reviewed main-branch commits.

## Required Google Cloud and GitHub configuration

GitHub Environment `production` contains the following non-secret variables:

- `GCP_PROJECT_ID`
- `GCP_REGION`
- `GCP_WIF_PROVIDER`
- `GCP_DEPLOYER_SERVICE_ACCOUNT`
- `GCP_RUNTIME_SERVICE_ACCOUNT`
- `GCP_CLOUD_SQL_INSTANCE` in `PROJECT:REGION:INSTANCE` form
- `GCP_ARTIFACT_REPOSITORY`
- `VITE_AUTH0_DOMAIN`
- `VITE_AUTH0_CLIENT_ID`
- `VITE_AUTH0_AUDIENCE`

Secret Manager contains the backend runtime secrets:

- `bookmark-database-url`: a MySQL URL that uses the `/cloudsql/<instance-connection-name>` socket.
- `bookmark-auth0-issuer-url`
- `bookmark-auth0-audience`

The Google deployer service account requires Artifact Registry writer, Cloud Run admin, and Service Account user for the Cloud Run runtime identity. The Cloud Run runtime service account requires Secret Manager secret accessor and Cloud SQL client. The GitHub repository principal is authorized only to impersonate the deployer service account through the configured Workload Identity Provider.

## Runtime behavior

Cloud Run receives `DATABASE_URL`, `AUTH0_ISSUER_URL`, and `AUTH0_AUDIENCE` from Secret Manager. The backend container executes `prisma migrate deploy` before starting NestJS, retaining the current container behavior. Frontend Auth0 values are public SPA configuration, not credentials.

After the first frontend deployment, Auth0 must include the Cloud Run frontend URL in Allowed Callback URLs, Allowed Logout URLs, and Allowed Web Origins. CORS must allow the frontend service URL at the API.

## Safety and rollback

Cloud Run revisions make rollback possible by routing traffic to the previous revision. Deployment fails before traffic is moved if a new revision does not become ready. The workflow never prints secrets, database URLs, or access tokens.

## Scope

This change creates deployment automation, Docker build support required by that automation, documented setup instructions, and transcript evidence. It does not create or modify the user's Cloud SQL instance, Google IAM resources, Auth0 tenant settings, custom domains, or branch-protection rules because those operations require the user's Google Cloud or Auth0 authority.
