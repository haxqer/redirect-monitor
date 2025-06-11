# Setup Instructions

## Docker Hub Integration

To enable automatic Docker image publishing to Docker Hub, you need to configure the following GitHub repository secrets:

### 1. Create Docker Hub Access Token

1. Go to [Docker Hub](https://hub.docker.com/)
2. Sign in to your account
3. Click on your username → **Account Settings**
4. Go to **Security** tab
5. Click **New Access Token**
6. Enter a description (e.g., "GitHub Actions")
7. Select **Read, Write, Delete** permissions
8. Click **Generate**
9. **Copy the token** (you won't be able to see it again)

### 2. Configure GitHub Repository Secrets

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add the following secrets:

#### DOCKERHUB_USERNAME
- **Name**: `DOCKERHUB_USERNAME`
- **Value**: Your Docker Hub username (e.g., `haxqer`)

#### DOCKERHUB_TOKEN
- **Name**: `DOCKERHUB_TOKEN`
- **Value**: The access token you generated in step 1

### 3. Verify Setup

Once configured, the GitHub Actions workflow will automatically:

- Build Docker images on every push to `main`/`master`
- Push images to `haxqer/redirect-monitor` on Docker Hub
- Tag images appropriately:
  - `latest` for main branch
  - `v1.0.0`, `1.0`, `1` for version tags
  - Branch names for feature branches

### 4. Create Your First Release

```bash
# Create and push a version tag
git tag v1.0.0
git push origin v1.0.0
```

This will trigger the workflow and create a versioned Docker image at:
- `haxqer/redirect-monitor:v1.0.0`
- `haxqer/redirect-monitor:1.0`
- `haxqer/redirect-monitor:1`
- `haxqer/redirect-monitor:latest`

### 5. Using the Published Images

```bash
# Pull and run the latest version
docker pull haxqer/redirect-monitor:latest
docker run -p 8080:8080 haxqer/redirect-monitor:latest

# Or run directly
docker run -p 8080:8080 haxqer/redirect-monitor:latest
```

## Troubleshooting

### Common Issues

1. **Authentication Failed**
   - Verify your Docker Hub username and token are correct
   - Ensure the access token has the right permissions
   - Check that secrets are properly set in GitHub

2. **Build Failed**
   - Check the GitHub Actions logs
   - Ensure all files are committed and pushed
   - Verify the Dockerfile syntax

3. **Image Not Found**
   - Wait for the GitHub Actions workflow to complete
   - Check the Actions tab for build status
   - Verify the image name matches `haxqer/redirect-monitor`

### Monitoring Builds

- Go to your repository's **Actions** tab
- Click on the latest workflow run
- Monitor the build progress and logs
- Check for any errors in the build or push steps 