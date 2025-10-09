# Changeset Token Setup

The Changeset workflow requires a Personal Access Token (PAT) to create version PRs because GitHub Actions' default `GITHUB_TOKEN` is not permitted to create pull requests.

## Create a Fine-Grained Personal Access Token

1. Go to: https://github.com/settings/tokens?type=beta
2. Click "Generate new token"
3. Configure the token:
   - **Token name**: `Changeset Version Bot`
   - **Expiration**: 90 days (or custom)
   - **Repository access**: Only select repositories → `portfolio`
   - **Permissions**:
     - Repository permissions:
       - **Contents**: Read and write
       - **Pull requests**: Read and write
       - **Metadata**: Read-only (auto-selected)

4. Click "Generate token"
5. **Copy the token immediately** (you won't be able to see it again)

## Add Token to Repository Secrets

1. Go to: https://github.com/jdubz/portfolio/settings/secrets/actions
2. Click "New repository secret"
3. Name: `CHANGESET_TOKEN`
4. Value: Paste the token you copied
5. Click "Add secret"

## How It Works

- The workflow uses `${{ secrets.CHANGESET_TOKEN || secrets.GITHUB_TOKEN }}`
- If `CHANGESET_TOKEN` is set, it uses that (allows PR creation)
- If not set, falls back to `GITHUB_TOKEN` (will fail with permission error)

## Token Rotation

When the token expires:
1. Create a new token with the same permissions
2. Update the `CHANGESET_TOKEN` secret with the new value
3. The workflow will automatically use the new token

## Troubleshooting

### Error: "GitHub Actions is not permitted to create or approve pull requests"

This means `CHANGESET_TOKEN` is not set or has expired. Follow the setup steps above.

### PR not triggering other workflows

This is expected behavior. PRs created by PATs won't trigger workflow runs to prevent infinite loops. You'll need to manually approve and merge the version PR.
