# 🚀 How to Upload BigDaddyG IDE to GitHub

## Step 1: Get Your GitHub Token

1. Go to: https://github.com/settings/tokens
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Give it a name: `BigDaddyG IDE Upload`
4. Select scopes:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `workflow` (Update GitHub Action workflows)
5. Click **"Generate token"**
6. **COPY THE TOKEN** (you'll only see it once!)

## Step 2: Run the Upload Script

### Option A: Interactive (Recommended)
```powershell
.\upload-essential-only.ps1
```
It will ask for your token.

### Option B: Direct
```powershell
.\upload-essential-only.ps1 -GithubToken "YOUR_TOKEN_HERE"
```

## Step 3: Verify Upload

Visit: `https://github.com/ItsMehRAWRXD/BigDaddyG-IDE`

You should see:
- ✅ All source code (~50-100 MB)
- ✅ README with setup instructions
- ✅ PRESERVATION-POLICY.md
- ✅ All test files and experiments
- ✅ Complete history (mistakes included!)

## What Gets Uploaded?

### ✅ Included (~50-100 MB)
- All source code
- All test files (even "failed" ones)
- All experiments
- All documentation
- Build scripts
- **PRESERVATION-POLICY.md** ← Your philosophy!

### ❌ Excluded (Can be recreated)
- node_modules/ (430 MB - run `npm install`)
- dist/ builds (486 MB - run `npm run build`)
- AI models (10 GB - documented separately)

## Anyone Can Recreate Full Project!

```bash
# Clone
git clone https://github.com/ItsMehRAWRXD/BigDaddyG-IDE.git
cd BigDaddyG-IDE

# Install dependencies
npm install

# Run!
npm start
```

That's it! Full 21 GB project recreated from 50 MB source! 🎯

## Security Note

Your GitHub token is NOT stored anywhere. It's only used during upload.

After upload, you can:
- Delete the token from GitHub settings
- Or keep it for future updates

---

**Ready? Run the upload script now!** 🚀

