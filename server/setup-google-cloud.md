# Google Cloud Storage Setup Guide

This guide will help you set up Google Cloud Storage for your wedding photos app to use the bucket `gs://bucket-armalino-photo`.

## Prerequisites

- Google Cloud account
- Google Cloud CLI (gcloud) installed
- Node.js 16+ installed

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Create Project" or select an existing project
3. Note down your Project ID

## Step 2: Enable Required APIs

```bash
# Set your project ID
gcloud config set project YOUR_PROJECT_ID

# Enable Cloud Storage API
gcloud services enable storage.googleapis.com

# Enable Cloud Storage Admin API (for bucket management)
gcloud services enable storage-component.googleapis.com
```

## Step 3: Create Storage Bucket

```bash
# Create the bucket (if it doesn't exist)
gsutil mb gs://bucket-armalino-photo

# Set bucket to public (optional - for public photo access)
gsutil iam ch allUsers:objectViewer gs://bucket-armalino-photo

# Or keep it private and use signed URLs
gsutil iam ch allUsers:objectViewer gs://bucket-armalino-photo
```

## Step 4: Create Service Account

```bash
# Create service account
gcloud iam service-accounts create wedding-photos-uploader \
    --display-name="Wedding Photos Uploader"

# Get the service account email
gcloud iam service-accounts list --filter="displayName:Wedding Photos Uploader"
```

## Step 5: Grant Permissions

```bash
# Grant Storage Admin role to service account
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
    --member="serviceAccount:wedding-photos-uploader@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/storage.admin"

# Alternative: Grant only Object Admin role (more restrictive)
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
    --member="serviceAccount:wedding-photos-uploader@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/storage.objectAdmin"
```

## Step 6: Create and Download Key

```bash
# Create and download the service account key
gcloud iam service-accounts keys create service-account-key.json \
    --iam-account=wedding-photos-uploader@YOUR_PROJECT_ID.iam.gserviceaccount.com
```

## Step 7: Configure Environment

1. Copy `env.example` to `.env`
2. Update the values:

```bash
# Copy the example file
cp env.example .env

# Edit the .env file with your values
GOOGLE_CLOUD_PROJECT_ID=your-actual-project-id
GOOGLE_CLOUD_KEY_FILE=service-account-key.json
PORT=3000
```

## Step 8: Install Dependencies

```bash
# Install Node.js dependencies
npm install
```

## Step 9: Test the Setup

```bash
# Start the server
npm start

# Test the health endpoint
curl http://localhost:3000/api/health

# Test upload (you'll need to use the frontend or Postman)
```

## Step 10: Deploy to Production

### Option A: Google Cloud Run (Recommended)

```bash
# Build and deploy to Cloud Run
gcloud run deploy wedding-photos-server \
    --source . \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated \
    --set-env-vars GOOGLE_CLOUD_PROJECT_ID=YOUR_PROJECT_ID
```

### Option B: Google Compute Engine

```bash
# Create a VM instance
gcloud compute instances create wedding-photos-server \
    --zone=us-central1-a \
    --machine-type=e2-micro \
    --image-family=debian-11 \
    --image-project=debian-cloud \
    --tags=http-server,https-server

# Copy files and start the server
gcloud compute scp --recurse . wedding-photos-server:~/wedding-photos
gcloud compute ssh wedding-photos-server --command="cd wedding-photos/server && npm install && npm start"
```

## Security Considerations

1. **Service Account Key**: Keep the service account key secure and never commit it to version control
2. **Bucket Permissions**: Consider using signed URLs instead of public bucket access
3. **CORS Configuration**: Configure CORS if accessing from different domains
4. **Rate Limiting**: Implement rate limiting to prevent abuse

## CORS Configuration (if needed)

If you're hosting the frontend on a different domain, create a `cors.json` file:

```json
[
  {
    "origin": ["*"],
    "method": ["GET", "POST", "DELETE"],
    "responseHeader": ["Content-Type"],
    "maxAgeSeconds": 3600
  }
]
```

Then apply it:

```bash
gsutil cors set cors.json gs://bucket-armalino-photo
```

## Monitoring and Logging

```bash
# View bucket contents
gsutil ls gs://bucket-armalino-photo/wedding-photos/

# View server logs (if using Cloud Run)
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=wedding-photos-server"

# Monitor storage usage
gsutil du -sh gs://bucket-armalino-photo
```

## Troubleshooting

### Common Issues

1. **Permission Denied**: Ensure service account has proper roles
2. **Bucket Not Found**: Verify bucket name and project ID
3. **Key File Issues**: Ensure service account key is in the correct location
4. **CORS Errors**: Check CORS configuration if accessing from different domains

### Debug Commands

```bash
# Test bucket access
gsutil ls gs://bucket-armalino-photo/

# Test file upload manually
echo "test" | gsutil cp - gs://bucket-armalino-photo/test.txt

# Check service account permissions
gcloud projects get-iam-policy YOUR_PROJECT_ID \
    --flatten="bindings[].members" \
    --filter="bindings.members:wedding-photos-uploader@YOUR_PROJECT_ID.iam.gserviceaccount.com"
```

## Cost Optimization

1. **Storage Class**: Use Standard storage for frequently accessed photos
2. **Lifecycle Management**: Set up automatic deletion of old photos if needed
3. **Monitoring**: Set up billing alerts to avoid unexpected charges

## Next Steps

1. Test the upload functionality
2. Deploy to production
3. Set up monitoring and alerts
4. Configure backup and disaster recovery if needed 