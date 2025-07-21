# 🚀 Deployment Guide - Formularz Vite

## Quick Deploy to Vercel (Recommended)

### 1. Prepare Repository
```bash
# Make sure all changes are committed
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2. Deploy with Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "New Project"
4. Import this repository
5. Vercel will auto-detect it's a Vite project
6. Add environment variables in Vercel dashboard:
   - `VITE_AIRTABLE_PAT`
   - `VITE_AIRTABLE_BASE_ID` 
   - `VITE_AIRTABLE_APPLICATIONS_TABLE_ID`
   - `VITE_AIRTABLE_EMPLOYEES_TABLE_ID`
7. Click "Deploy"

### 3. Set Custom Domain (Optional)
- In Vercel dashboard → Project → Domains
- Add your custom domain

---

## Alternative: Netlify Deploy

### 1. Build Project
```bash
npm run build
```

### 2. Deploy to Netlify
1. Go to [netlify.com](https://netlify.com)
2. Drag & drop the `dist/` folder
3. Or connect GitHub for auto-deployments
4. Add environment variables in Site settings

---

## Alternative: GitHub Pages

### 1. Create Workflow File
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [ main ]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
        env:
          VITE_AIRTABLE_PAT: ${{ secrets.VITE_AIRTABLE_PAT }}
          VITE_AIRTABLE_BASE_ID: ${{ secrets.VITE_AIRTABLE_BASE_ID }}
          VITE_AIRTABLE_APPLICATIONS_TABLE_ID: ${{ secrets.VITE_AIRTABLE_APPLICATIONS_TABLE_ID }}
          VITE_AIRTABLE_EMPLOYEES_TABLE_ID: ${{ secrets.VITE_AIRTABLE_EMPLOYEES_TABLE_ID }}
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

### 2. Add Secrets to GitHub
Go to Repository → Settings → Secrets → Add your environment variables

---

## Environment Variables Setup

For any hosting provider, you need to set these environment variables:

```
VITE_AIRTABLE_PAT=your_personal_access_token
VITE_AIRTABLE_BASE_ID=your_base_id  
VITE_AIRTABLE_APPLICATIONS_TABLE_ID=your_applications_table_id
VITE_AIRTABLE_EMPLOYEES_TABLE_ID=your_employees_table_id
```

## 📋 Pre-deployment Checklist

- [ ] All environment variables are set
- [ ] `npm run build` works locally
- [ ] `npm run lint` passes
- [ ] Application loads correctly with env variables
- [ ] Airtable integration working
- [ ] All routes work (check React Router)

## 🔧 Troubleshooting

### Build Fails
```bash
# Check TypeScript errors
npm run build

# Check linting
npm run lint
```

### Environment Variables Not Working
- Make sure all variables start with `VITE_`
- Restart build after adding env vars
- Check browser console for configuration errors

### Routing Issues (404s)
- Ensure hosting provider supports SPA routing
- Check `vercel.json` or equivalent config file