# Cloud Run and Cloud SQL Delivery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deploy both application containers to Cloud Run and connect the API to the existing Cloud SQL MySQL instance without committing credentials.

**Architecture:** GitHub Actions deploys on `main` through Workload Identity Federation. It builds two Artifact Registry images, deploys `bookmark-api` with a Cloud SQL socket and Secret Manager runtime values, deploys `bookmark-web` with the resulting API URL, then updates API CORS with the web URL.

**Tech Stack:** GitHub Actions, Google Cloud Run, Cloud SQL for MySQL, Artifact Registry, Secret Manager, Workload Identity Federation, Docker, Bun, Prisma.

## Global Constraints

- Never commit passwords, access tokens, service-account keys, database URLs, Cloud SQL IPs, or generated secret files.
- Deploy only from `main` or an explicitly invoked manual production workflow.
- Use GitHub Environment `production`, `id-token: write`, and Workload Identity Federation; do not use service-account JSON keys.
- `GCP_CLOUD_SQL_INSTANCE` is a GitHub Environment variable in `PROJECT:REGION:INSTANCE` form.
- The runtime Cloud Run identity, not GitHub, holds Cloud SQL Client and Secret Manager Secret Accessor roles.
- Existing PR CI remains unchanged and must pass before a protected `main` merge.

---

### Task 1: Add keyless Cloud Run deployment workflow

**Files:**
- Create: `.github/workflows/deploy-production.yml`
- Test: shell contract checks against `.github/workflows/deploy-production.yml`

**Interfaces:**
- Consumes: GitHub Environment `production` variables `GCP_PROJECT_ID`, `GCP_REGION`, `GCP_WIF_PROVIDER`, `GCP_DEPLOYER_SERVICE_ACCOUNT`, `GCP_RUNTIME_SERVICE_ACCOUNT`, `GCP_CLOUD_SQL_INSTANCE`, `GCP_ARTIFACT_REPOSITORY`, `VITE_AUTH0_DOMAIN`, `VITE_AUTH0_CLIENT_ID`, `VITE_AUTH0_AUDIENCE`.
- Consumes: Secret Manager secret names `bookmark-database-url`, `bookmark-auth0-issuer-url`, `bookmark-auth0-audience`.
- Produces: Cloud Run services `bookmark-api` and `bookmark-web` plus Artifact Registry images tagged with `${GITHUB_SHA}`.

- [ ] **Step 1: Establish the missing-workflow baseline**

Run:

```bash
test -f .github/workflows/deploy-production.yml
```

Expected: fail because the deployment workflow does not exist.

- [ ] **Step 2: Create the deployment workflow**

Create `.github/workflows/deploy-production.yml` with `push.branches: [main]`, `workflow_dispatch`, `contents: read`, and `id-token: write`. Use a single `deploy` job with `environment: production`, `actions/checkout@v4`, `google-github-actions/auth@v2`, and `google-github-actions/setup-gcloud@v2`.

The job must validate every listed GitHub Environment variable with `test -n`, configure Docker for `${GCP_REGION}-docker.pkg.dev`, and build/push images using these exact image patterns:

```bash
API_IMAGE="${GCP_REGION}-docker.pkg.dev/${GCP_PROJECT_ID}/${GCP_ARTIFACT_REPOSITORY}/bookmark-api:${GITHUB_SHA}"
WEB_IMAGE="${GCP_REGION}-docker.pkg.dev/${GCP_PROJECT_ID}/${GCP_ARTIFACT_REPOSITORY}/bookmark-web:${GITHUB_SHA}"
```

Build the API with only a non-secret Prisma build-time URL:

```bash
docker build --file backend/Dockerfile --build-arg DATABASE_URL='mysql://ci:ci@localhost:3306/bookmarks' --tag "$API_IMAGE" .
docker push "$API_IMAGE"
```

Deploy the API with runtime identity, Cloud SQL attachment, Secret Manager values, and a temporary no-origin CORS value:

```bash
gcloud run deploy bookmark-api --image "$API_IMAGE" --region "$GCP_REGION" --platform managed --allow-unauthenticated --port 3001 --service-account "$GCP_RUNTIME_SERVICE_ACCOUNT" --add-cloudsql-instances "$GCP_CLOUD_SQL_INSTANCE" --set-secrets 'DATABASE_URL=bookmark-database-url:latest,AUTH0_ISSUER_URL=bookmark-auth0-issuer-url:latest,AUTH0_AUDIENCE=bookmark-auth0-audience:latest' --set-env-vars 'CORS_ORIGIN=https://placeholder.invalid'
```

Read `API_URL` with `gcloud run services describe bookmark-api --region "$GCP_REGION" --format='value(status.url)'`. Build/push the frontend with `VITE_API_BASE_URL="$API_URL"` and the three `VITE_AUTH0_*` variables. Deploy it with `--allow-unauthenticated --port 80`, read `WEB_URL`, then run:

```bash
gcloud run services update bookmark-api --region "$GCP_REGION" --update-env-vars "CORS_ORIGIN=${WEB_URL}"
```

- [ ] **Step 3: Validate workflow contract**

Run:

```bash
test -f .github/workflows/deploy-production.yml
! rg -n -- '(service_account_key|credentials_json|\.json)' .github/workflows/deploy-production.yml
rg -n 'id-token: write|workflow_dispatch|branches: \[main\]|google-github-actions/auth@v2|setup-gcloud@v2|configure-docker|add-cloudsql-instances|set-secrets|bookmark-api|bookmark-web|CORS_ORIGIN' .github/workflows/deploy-production.yml
```

Expected: the file exists, has each required deployment control, and has no JSON service-account-key mechanism.

This configuration is exempt from automated unit tests. A real deployment cannot run locally because it requires the user-owned Google Cloud project, Workload Identity Provider, service accounts, Secret Manager values, and existing Cloud SQL connection name.

### Task 2: Document one-time Google Cloud and Auth0 configuration

**Files:**
- Create: `docs/cloud-run-deployment.md`
- Modify: `README.md`
- Modify: `TASKS.md`
- Modify: `transcripts/cloud-run-cloud-sql-delivery/session.md`

**Interfaces:**
- Consumes: the workflow variable and secret names from Task 1.
- Produces: operator instructions that create Artifact Registry, configure Workload Identity Federation/IAM, add Secret Manager versions, configure GitHub Environment values, update Auth0 URLs, and verify/rollback Cloud Run revisions.

- [ ] **Step 1: Write deployment documentation**

Document these exact configuration boundaries:

1. Artifact Registry repository format: `${GCP_REGION}-docker.pkg.dev/${GCP_PROJECT_ID}/${GCP_ARTIFACT_REPOSITORY}`.
2. WIF provider issuer: `https://token.actions.githubusercontent.com`; restrict the attribute condition to `assertion.repository=='besterdev/private-bookmark-manager' && assertion.ref=='refs/heads/main'`.
3. GitHub Environment `production` variable names exactly as listed in Task 1.
4. Secret Manager secret names exactly as listed in Task 1; describe creating versions from local stdin and never from committed files.
5. Runtime service-account roles: Cloud SQL Client and Secret Manager Secret Accessor.
6. Deployer service-account roles: Artifact Registry Writer, Cloud Run Admin, and Service Account User for the runtime identity.
7. Auth0 Allowed Callback URLs, Allowed Logout URLs, Allowed Web Origins, and API CORS must use the deployed web/API URLs.
8. Smoke checks: `/healthz`, browser login, `GET /me`, bookmark CRUD.
9. Rollback: route traffic to the prior ready Cloud Run revision.

- [ ] **Step 2: Update repository documentation and evidence**

Add a Cloud Run deployment section to `README.md` linking to `docs/cloud-run-deployment.md`. Add a delivery task section to `TASKS.md` with unchecked external configuration items and checked repository-automation items. Record the approved design, plan, workflow validation, and the fact that live deployment awaits user-owned GCP configuration in `transcripts/cloud-run-cloud-sql-delivery/session.md`.

- [ ] **Step 3: Commit focused delivery configuration**

```bash
git add .github/workflows/deploy-production.yml docs/cloud-run-deployment.md README.md TASKS.md transcripts/cloud-run-cloud-sql-delivery/session.md
git commit -m "🚀 ci: deploy Cloud Run services"
```

## Plan self-review

- Spec coverage: Task 1 implements keyless deploy, Artifact Registry images, Cloud Run API/web services, Cloud SQL attachment, runtime secrets, and CORS handoff. Task 2 documents external GCP/Auth0 setup, operation, rollback, and evidence.
- Placeholder scan: all configuration inputs use named GitHub Environment variables or Secret Manager secret names; no credentials or unresolved implementation markers are embedded.
- Type consistency: Cloud Run service names, Secret Manager secret names, variables, image paths, and CORS/API URL handoff are identical across both tasks.
