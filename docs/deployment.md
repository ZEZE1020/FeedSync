# Feed Sync deployment

The repository includes a software-only GCP deployment path. Hardware ingestion is intentionally
out of scope for this stage.

## Runtime

- `feedsync-api`: FastAPI container on Cloud Run;
- `feedsync-web`: Next.js standalone container on Cloud Run;
- Artifact Registry stores both images;
- Cloud SQL PostgreSQL should replace the local SQLite MVP store before production use;
- Secret Manager should hold KijaniSpace credentials and database credentials.

## GitHub Actions setup

Create an Artifact Registry Docker repository and configure GitHub OIDC Workload Identity
Federation. Add these repository variables:

- `GCP_PROJECT_ID`
- `GCP_REGION`
- `GCP_ARTIFACT_REPOSITORY` is no longer needed; the repository is fixed as `feedsync`.
- `FEED_SYNC_API_BASE_URL` is discovered from the deployed API service.

Add these repository secrets:

- `GCP_WIF_PROVIDER`
- `GCP_DEPLOYER_SERVICE_ACCOUNT`

Pull requests run API tests, Ruff, web lint, typecheck and a production build. A successful CI run
on `main` then builds and deploys both containers through `.github/workflows/deploy.yml`.

The deployer should use the narrowest IAM roles needed for Artifact Registry writes and Cloud Run
deployment. Do not add a long-lived service-account JSON key to GitHub; federation provides
short-lived credentials.
