# 🐙 GitHub Integration Setup Guide

**Complete guide to enable GitHub integration in BigDaddyG IDE**

---

## 📋 Overview

BigDaddyG IDE now has seamless GitHub integration that works **without a backend server!**

**Features:**

- ✅ Connect GitHub account (OAuth Device Flow)
- ✅ Browse all your repositories
- ✅ View and edit files directly from GitHub
- ✅ Commit changes with one click
- ✅ Create feature branches
- ✅ Create pull requests
- ✅ All client-side, no server needed!

---

## 🚀 Quick Setup (5 Minutes)

### **Step 1: Register GitHub OAuth App**

1. Go to GitHub Settings: <https://github.com/settings/developers>
2. Click **"OAuth Apps"** in left sidebar
3. Click **"New OAuth App"**
4. Fill in the details:

```plaintext
Application name: BigDaddyG IDE
Homepage URL: <https://github.com/ItsMehRAWRXD/BigDaddyG-IDE>
Authorization callback URL: <http://localhost:3000/callback>
(Note: We use Device Flow, so callback isn't actually used, but GitHub requires it)

```plaintext
  1. Click **"Register application"**
  2. You'll see your **Client ID** - **COPY THIS!**

---

### **Step 2: Update BigDaddyG IDE**

1. Open `electron/github-integration.js`
2. Find this line (around line 17):

```javascript

this.clientId = 'Ov23liYour_GitHub_App_Client_ID';

```plaintext
  1. Replace with your actual Client ID:

```javascript

this.clientId = 'Ov23liYOUR_ACTUAL_CLIENT_ID_HERE';

```plaintext
  1. Save the file

**That's it!** No client secret needed, no backend server needed!

---

### **Step 3: Add to Your IDE**

Add these lines to your main HTML file (e.g., `electron/index.html`):

```html

<!-- GitHub Integration -->
<link rel="stylesheet" href="github-integration.css">
<script src="github-integration.js"></script>

```plaintext
**Or if using the Electron app**, add to `electron/main.js`:

```javascript

// Load GitHub integration
const githubIntegration = require('./github-integration');

```plaintext
---

## 🎯 How to Use

### **1. Connect GitHub Account**

1. Open BigDaddyG IDE
2. Look for **🐙 GitHub Integration** panel in sidebar
3. Click **"Connect GitHub"**
4. A dialog appears with a code (e.g., `A1B2-C3D4`)
5. Click **"Open GitHub"** or go to <https://github.com/login/device>
6. Enter the code
7. Click **"Authorize"**
8. Return to BigDaddyG IDE
9. ✅ You're connected!

---

### **2. Browse Repositories**

1. Click **"Load Repositories"**
2. Select a repository from the dropdown
3. Files appear in the file tree
4. Click any file to open it in the editor

---

### **3. Edit and Commit**

1. Make changes to the file in the editor
2. Click **"Commit Changes"**
3. Enter a commit message
4. Done! File is committed to GitHub

---

### **4. Create Feature Branch**

1. Click **"Create Branch"**
2. Enter branch name (e.g., `feature/new-ui`)
3. Branch is created from current branch
4. You're automatically switched to the new branch

---

### **5. Create Pull Request**

1. Make changes and commit to your feature branch
2. Click **"Create PR"**
3. Enter PR title and description
4. PR is created and opened in your browser

---

## 🔒 Security & Privacy

### **Why is this safe?**

1. **Device Flow = No Client Secret**
   - Uses GitHub's Device Flow OAuth
   - No backend server needed
   - No secrets exposed in client code
   - Client ID is public (safe to share)

  1. **Token Storage**
   - Access token stored in `localStorage` (browser-only)
   - Never sent to any server except GitHub
   - Can disconnect anytime

  1. **Permissions**
   - You control what the app can access
   - Can revoke access anytime at: <https://github.com/settings/applications>

---

## ❓ Troubleshooting

### **"Authentication failed"**

**Cause:** Client ID not set or invalid

**Fix:**

1. Check that you replaced the Client ID in `github-integration.js`
2. Make sure you copied the entire Client ID (starts with `Ov23li`)
3. No spaces or quotes

---

### **"Failed to load repositories"**

**Cause:** Token expired or network issue

**Fix:**

1. Click "Disconnect"
2. Click "Connect GitHub" again
3. Re-authorize

---

### **"Failed to commit"**

**Cause:** No write access to repository

**Fix:**

1. Make sure you're the owner or have write access
2. Check that you're on the correct branch
3. Try creating a new branch first

---

### **File tree not loading**

**Cause:** Large repository or network timeout

**Fix:**

1. Try refreshing (select repo again)
2. Check browser console for errors (F12)
3. Some repos are too large for the tree API

---

## 🎨 Customization

### **Change OAuth Scopes**

Edit `github-integration.js`, line ~29:

```javascript

scope: 'repo user'  // Change scopes here

```plaintext
**Available scopes:**

- `repo` - Full repo access (default)
- `public_repo` - Public repos only
- `user` - User profile
- `gist` - Gist access
- See: <https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/scopes-for-oauth-apps>

---

### **Customize UI**

Edit `github-integration.css`:

- Change colors
- Adjust panel size
- Modify button styles
- Customize file tree appearance

---

## 🚀 Advanced Features

### **Programmatic Access**

Use the GitHub API directly in your code:

```javascript

// Get current user
const user = await githubIntegration.fetchUserInfo();
console.log('Logged in as:', user.login);

// List repos
const repos = await githubIntegration.listRepositories();
console.log('Repos:', repos.map(r => r.full_name));

// Get file content
const file = await githubIntegration.getFileContent(
    'owner',
    'repo',
    'path/to/file.js'
);
console.log(file.content);

// Commit file
await githubIntegration.commitFile(
    'owner',
    'repo',
    'path/to/file.js',
    'new content',
    'Updated file via BigDaddyG',
    'main'
);

// Create branch
await githubIntegration.createBranch(
    'owner',
    'repo',
    'feature/new-feature',
    'main'
);

// Create PR
const pr = await githubIntegration.createPullRequest(
    'owner',
    'repo',
    'New Feature',
    'feature/new-feature',
    'main',
    'This PR adds...'
);
console.log('PR created:', pr.html_url);

```plaintext
---

## 📊 API Rate Limits

### **GitHub API Limits:**

**Authenticated:**

- 5,000 requests per hour
- Should be more than enough for normal use

**Tips to avoid limits:**

- Don't refresh file tree constantly
- Use branches selector instead of loading full tree
- Cache data in `localStorage` when possible

---

## 🆚 Comparison to Cursor Web

| Feature | Cursor Web | BigDaddyG |
|---------|-----------|-----------|
| GitHub OAuth | ✅ | ✅ |
| Browse repos | ✅ | ✅ |
| Edit files | ✅ | ✅ |
| Commit changes | ✅ | ✅ |
| Create branches | ✅ | ✅ |
| Create PRs | ✅ | ✅ |
| **Backend required** | ✅ Yes | ❌ **No!** |
| **Cost** | $20-40/mo | **FREE** |
| **Works offline** | ❌ No | ✅ **Yes** (after auth) |

---

## 🎉 Next Steps

Now that you have GitHub integration:

1. **Connect your account**
2. **Open a repository**
3. **Make some edits**
4. **Commit and create a PR**
5. **Share with your team!**

---

## 📚 Additional Resources

- **GitHub OAuth Device Flow:** <https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps#device-flow>
- **GitHub API Documentation:** <https://docs.github.com/en/rest>
- **BigDaddyG IDE Repo:** <https://github.com/ItsMehRAWRXD/BigDaddyG-IDE>

---

## 🐛 Reporting Issues

Found a bug? Have a feature request?

1. Open an issue: <https://github.com/ItsMehRAWRXD/BigDaddyG-IDE/issues>
2. Include:
   - What you were trying to do
   - What happened instead
   - Browser console errors (F12 → Console)
   - Steps to reproduce

---

**Made with ❤️ by the BigDaddyG IDE Team**

*Bringing professional GitHub integration to everyone, for FREE!* 🚀

