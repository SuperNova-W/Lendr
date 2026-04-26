#!/usr/bin/env bash
# Run once from the repo root to bootstrap the GCP project.
# Usage: bash scripts/setup-gcp.sh <your-gcp-project-id>

set -euo pipefail

PROJECT_ID="${1:?Usage: bash scripts/setup-gcp.sh <gcp-project-id>}"
REGION="us-central1"
REPO="lend"
SA_NAME="lend-deployer"
SA_EMAIL="${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"
KEY_FILE="/tmp/gcp-sa-key.json"

echo "==> Project: $PROJECT_ID"
gcloud config set project "$PROJECT_ID"

echo ""
echo "==> Enabling required APIs (this takes ~1 min)..."
gcloud services enable \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  secretmanager.googleapis.com \
  cloudbuild.googleapis.com \
  iam.googleapis.com

echo ""
echo "==> Creating Artifact Registry Docker repository..."
gcloud artifacts repositories create "$REPO" \
  --repository-format=docker \
  --location="$REGION" \
  --description="Lend app container images" 2>/dev/null \
  || echo "  (already exists — skipping)"

echo ""
echo "==> Creating GitHub Actions service account..."
gcloud iam service-accounts create "$SA_NAME" \
  --display-name="Lend GitHub Actions Deployer" 2>/dev/null \
  || echo "  (already exists — skipping)"

echo ""
echo "==> Granting roles to service account..."
for role in \
  roles/run.developer \
  roles/artifactregistry.writer \
  roles/secretmanager.secretAccessor \
  roles/iam.serviceAccountUser; do
  gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="$role" \
    --quiet
  echo "  Granted $role"
done

echo ""
echo "==> Granting default Compute SA access to Secret Manager (for Cloud Run)..."
COMPUTE_SA="${PROJECT_ID}-compute@developer.gserviceaccount.com" 2>/dev/null || true
# Try to grant; may fail if Compute SA doesn't exist yet (it appears after first Cloud Run deploy)
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:${COMPUTE_SA}" \
  --role="roles/secretmanager.secretAccessor" \
  --quiet 2>/dev/null \
  || echo "  (Compute SA not ready yet — re-run after first deploy if secrets fail)"

echo ""
echo "==> Creating Secret Manager secrets from .env..."
# Read .env from repo root; skip EXPO_PUBLIC_* (stored as GitHub secrets, not GCP)
while IFS='=' read -r key rest; do
  # Skip blank lines, comments, and EXPO_PUBLIC_ vars
  [[ -z "$key" || "$key" == \#* || "$key" == EXPO_PUBLIC_* ]] && continue
  value="${rest}"
  # Secret name: lendr-<key-lowercase-with-hyphens>
  secret_name="lendr-$(echo "${key}" | tr '[:upper:]_' '[:lower:]-')"
  if gcloud secrets describe "$secret_name" --project="$PROJECT_ID" &>/dev/null; then
    echo "  Updating secret: $secret_name"
    printf '%s' "$value" | gcloud secrets versions add "$secret_name" \
      --data-file=- --project="$PROJECT_ID"
  else
    echo "  Creating secret: $secret_name"
    printf '%s' "$value" | gcloud secrets create "$secret_name" \
      --data-file=- \
      --replication-policy=automatic \
      --project="$PROJECT_ID"
  fi
done < .env

echo ""
echo "==> Generating service account key for GitHub Actions..."
gcloud iam service-accounts keys create "$KEY_FILE" \
  --iam-account="$SA_EMAIL"
echo "  Key saved to $KEY_FILE"

echo ""
echo "============================================================"
echo "Setup complete. Add the following GitHub repository secrets:"
echo "  (Settings → Secrets and variables → Actions → New secret)"
echo "============================================================"
echo ""
echo "  GCP_PROJECT_ID              = $PROJECT_ID"
echo "  GCP_SA_KEY                  = (paste contents of $KEY_FILE)"
echo "  FIREBASE_SERVICE_ACCOUNT    = (see step below)"
echo "  EXPO_PUBLIC_API_BASE_URL    = (set after first Cloud Run deploy)"
echo "  EXPO_PUBLIC_GOOGLE_CLIENT_ID = 27126137080-e8ef1u7bvdkhqgs7p1it9m2ejtcp8ls1.apps.googleusercontent.com"
echo ""
echo "For FIREBASE_SERVICE_ACCOUNT:"
echo "  1. Go to Firebase console → Project settings → Service accounts"
echo "  2. Click 'Generate new private key'"
echo "  3. Paste the entire JSON as the secret value"
echo ""
echo "After first deploy, get your Cloud Run URL with:"
echo "  gcloud run services describe lend-backend --region $REGION --format 'value(status.url)'"
echo "Then set EXPO_PUBLIC_API_BASE_URL to that URL."
echo ""
echo "Also update .firebaserc with your project ID:"
echo "  \"default\": \"$PROJECT_ID\""
