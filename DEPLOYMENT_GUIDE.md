# 🚀 MathBot Arena - Production Deployment Guide

**Version:** v2.1-AVATAR-SKILLS
**Date:** 2026-01-11
**Status:** Production Ready

---

## 📋 Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Setup](#environment-setup)
3. [Build Process](#build-process)
4. [Deployment Options](#deployment-options)
5. [Post-Deployment Verification](#post-deployment-verification)
6. [Monitoring & Maintenance](#monitoring--maintenance)
7. [Rollback Procedure](#rollback-procedure)

---

## ✅ Pre-Deployment Checklist

### Code Quality
- [x] TypeScript type check passes (`npm run type-check`)
- [x] No console.error in production code
- [x] All TODO comments resolved or documented
- [x] Code reviewed and approved
- [x] Git branch up to date with latest changes

### Testing
- [ ] Manual testing completed on all features
- [ ] Avatar system tested (all 4 types)
- [ ] Skills Dashboard verified
- [ ] Language switching tested (RU/EN)
- [ ] Skill gains/decay verified
- [ ] PvP Arena tested with 2+ players
- [ ] Mobile responsiveness checked
- [ ] Browser compatibility verified (Chrome, Firefox, Safari, Edge)

### Documentation
- [x] LOCAL_RUN_GUIDE.md updated
- [x] AVATAR_SYSTEM_SUMMARY.md complete
- [x] README.md accurate
- [x] API endpoints documented
- [x] Environment variables documented

### Security
- [ ] No sensitive data in code
- [ ] Environment variables properly configured
- [ ] CORS settings verified
- [ ] Rate limiting configured (if applicable)
- [ ] Input validation implemented

### Performance
- [ ] Large bundle analyzed and optimized
- [ ] Images optimized (SVG only, no external images)
- [ ] Lazy loading implemented where appropriate
- [ ] Caching strategy defined

---

## 🌍 Environment Setup

### Client Environment Variables

Create `.env.production` in root directory:

```env
# Production WebSocket Server URL
VITE_SERVER_URL=https://your-server-domain.com

# Optional: Analytics
# VITE_ANALYTICS_ID=your-analytics-id

# Optional: Sentry for error tracking
# VITE_SENTRY_DSN=your-sentry-dsn
```

### Server Environment Variables

Create `server/.env.production`:

```env
# Server Configuration
PORT=3001
NODE_ENV=production

# Client URL for CORS
CLIENT_URL=https://your-client-domain.com

# Battle Configuration
QUESTION_TIME_LIMIT=45
MAX_ROUNDS=10
DISCONNECT_TIMEOUT=30
MATCHMAKING_INTERVAL=2000
ELO_K_FACTOR=32

# Optional: Database (if you add persistence)
# DATABASE_URL=postgresql://user:pass@host:5432/dbname

# Optional: Redis (for matchmaking queue)
# REDIS_URL=redis://host:6379
```

---

## 🏗️ Build Process

### 1. Client Build

```bash
# In project root
npm install --production=false
npm run build

# Output: dist/ directory
# Contains optimized static files
```

**Build Output:**
```
dist/
├── assets/
│   ├── index-[hash].js     # Main bundle
│   ├── index-[hash].css    # Styles
│   └── ...                 # Other chunks
├── index.html              # Entry point
└── favicon.ico             # (if exists)
```

### 2. Server Build

```bash
# In server directory
cd server
npm install --production=false
npm run build

# Output: server/dist/ directory
# Contains compiled TypeScript
```

**Build Output:**
```
server/dist/
├── index.js                # Main server file
├── battle/
│   ├── battleMechanics.js
│   └── matchmaking.js
└── data/
    └── taskBank.js
```

### 3. Verify Build

```bash
# Test client build locally
npx serve -s dist -l 3000

# Test server build locally
cd server
node dist/index.js
```

---

## 🌐 Deployment Options

### Option 1: Vercel (Client) + Heroku (Server)

#### Deploy Client to Vercel

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel --prod
   ```

3. **Configure Environment:**
   - Go to Vercel Dashboard → Project Settings → Environment Variables
   - Add `VITE_SERVER_URL` with your server URL

4. **Custom Domain (Optional):**
   - Vercel Dashboard → Domains → Add domain

#### Deploy Server to Heroku

1. **Install Heroku CLI:**
   ```bash
   # macOS
   brew tap heroku/brew && brew install heroku

   # Windows
   # Download from https://devcenter.heroku.com/articles/heroku-cli
   ```

2. **Login and Create App:**
   ```bash
   heroku login
   heroku create mathbot-arena-server
   ```

3. **Configure Buildpack:**
   ```bash
   heroku buildpacks:set heroku/nodejs
   ```

4. **Set Environment Variables:**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set PORT=3001
   heroku config:set CLIENT_URL=https://your-vercel-app.vercel.app
   ```

5. **Deploy:**
   ```bash
   # From server directory
   git subtree push --prefix server heroku main

   # Or use Heroku Git
   cd server
   git init
   heroku git:remote -a mathbot-arena-server
   git add .
   git commit -m "Deploy server"
   git push heroku main
   ```

6. **Enable WebSockets:**
   ```bash
   heroku features:enable http-session-affinity
   ```

---

### Option 2: Netlify (Client) + Railway (Server)

#### Deploy Client to Netlify

1. **Install Netlify CLI:**
   ```bash
   npm i -g netlify-cli
   ```

2. **Build and Deploy:**
   ```bash
   npm run build
   netlify deploy --prod --dir=dist
   ```

3. **Configure:**
   - Netlify Dashboard → Site Settings → Environment Variables
   - Add `VITE_SERVER_URL`

#### Deploy Server to Railway

1. **Go to Railway.app**
2. **New Project → Deploy from GitHub**
3. **Select Repository and Server Directory**
4. **Configure Environment Variables** in Railway Dashboard
5. **Deploy** (automatic on push)

---

### Option 3: AWS (Full Stack)

#### S3 + CloudFront (Client)

1. **Build Client:**
   ```bash
   npm run build
   ```

2. **Create S3 Bucket:**
   ```bash
   aws s3 mb s3://mathbot-arena-client
   ```

3. **Upload:**
   ```bash
   aws s3 sync dist/ s3://mathbot-arena-client --delete
   ```

4. **Configure Bucket:**
   - Enable static website hosting
   - Set index.html as index document
   - Configure bucket policy for public access

5. **Create CloudFront Distribution:**
   - Origin: S3 bucket
   - Viewer Protocol: Redirect HTTP to HTTPS
   - Compress Objects: Yes

#### EC2 or ECS (Server)

1. **Create EC2 Instance** (Ubuntu 22.04)
2. **Install Node.js:**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. **Clone and Setup:**
   ```bash
   git clone <your-repo>
   cd MATHBOT/server
   npm install --production
   npm run build
   ```

4. **Install PM2:**
   ```bash
   sudo npm install -g pm2
   ```

5. **Start Server:**
   ```bash
   pm2 start dist/index.js --name mathbot-server
   pm2 startup
   pm2 save
   ```

6. **Configure Nginx** (reverse proxy):
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

7. **SSL with Let's Encrypt:**
   ```bash
   sudo apt-get install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

---

### Option 4: DigitalOcean App Platform (Full Stack)

1. **Go to DigitalOcean App Platform**
2. **Create New App → Connect GitHub**
3. **Configure Components:**
   - **Client (Static Site):**
     - Build Command: `npm run build`
     - Output Directory: `dist`
   - **Server (Web Service):**
     - Source Directory: `server`
     - Build Command: `npm run build`
     - Run Command: `node dist/index.js`
     - HTTP Port: 3001

4. **Set Environment Variables** for both components
5. **Deploy** (automatic)

---

## 🔍 Post-Deployment Verification

### Client Verification

1. **Access Site:**
   - Open production URL in browser
   - Check SSL certificate (HTTPS)

2. **Test Core Features:**
   - [ ] Welcome screen loads
   - [ ] Registration works
   - [ ] Avatar selection appears
   - [ ] Avatar customization works
   - [ ] Game screen displays correctly
   - [ ] Language switcher functions
   - [ ] Skills Dashboard loads
   - [ ] Training mode works
   - [ ] Learning mode works
   - [ ] Statistics display correctly

3. **Check Console:**
   - Open DevTools → Console
   - No errors should appear
   - Check Network tab for failed requests

4. **Test Mobile:**
   - Open on mobile device
   - Check responsive layout
   - Test touch interactions

### Server Verification

1. **Health Check:**
   ```bash
   curl https://your-server-url/health
   ```

   Expected response:
   ```json
   {
     "status": "ok",
     "timestamp": 1234567890,
     "uptime": 12.34,
     "queue": { "child": 0, "teen": 0, "adult": 0 },
     "activeBattles": 0
   }
   ```

2. **WebSocket Connection:**
   - Open browser console on client
   - Should see: "🔌 Connected to battle server"
   - Check server logs for connection messages

3. **PvP Testing:**
   - Open 2 browser windows
   - Both register and enter PvP
   - Click "Начать бой!"
   - Verify matchmaking works
   - Complete a battle

4. **Load Testing (Optional):**
   ```bash
   # Install artillery
   npm i -g artillery

   # Create test config: artillery.yml
   # Run test
   artillery run artillery.yml
   ```

### Performance Checks

1. **Lighthouse Audit:**
   - Open DevTools → Lighthouse
   - Run audit on production URL
   - Target scores:
     - Performance: > 90
     - Accessibility: > 90
     - Best Practices: > 90
     - SEO: > 80

2. **Bundle Size:**
   ```bash
   # Check main bundle size
   ls -lh dist/assets/*.js

   # Should be < 500KB for main bundle
   ```

3. **Load Time:**
   - First Contentful Paint: < 1.5s
   - Time to Interactive: < 3.5s
   - Total Load Time: < 5s

---

## 📊 Monitoring & Maintenance

### Client Monitoring

**Tools:**
- **Vercel Analytics** (if using Vercel)
- **Google Analytics** (optional)
- **Sentry** for error tracking

**Key Metrics:**
- Page views
- User sessions
- Bounce rate
- Error rate
- Load time

### Server Monitoring

**Tools:**
- **Heroku Metrics** (if using Heroku)
- **PM2 Monitor** (if using PM2)
- **Datadog** or **New Relic** (advanced)

**Key Metrics:**
- CPU usage
- Memory usage
- Active connections
- WebSocket connections
- Queue size
- Active battles
- Response time

**Setup PM2 Monitoring:**
```bash
pm2 install pm2-server-monit
pm2 monit
```

### Log Management

**Server Logs:**
```bash
# View logs
pm2 logs mathbot-server

# Or Heroku
heroku logs --tail -a mathbot-arena-server

# Or Docker
docker logs -f container-name
```

**Client Errors:**
- Use Sentry or similar
- Track JavaScript errors
- Monitor console errors

### Backup Strategy

**User Data:**
- localStorage (client-side, auto-backed up by browser)
- Consider adding server-side persistence for:
  - User profiles
  - Avatar data
  - Progress history

**Database Backups (if added):**
```bash
# PostgreSQL
pg_dump dbname > backup.sql

# Schedule daily backups with cron
0 2 * * * pg_dump dbname > /backups/backup-$(date +\%Y\%m\%d).sql
```

---

## 🔄 Rollback Procedure

### Quick Rollback (Vercel)

```bash
# List deployments
vercel ls

# Rollback to previous
vercel rollback
```

### Quick Rollback (Heroku)

```bash
# List releases
heroku releases

# Rollback
heroku rollback v123
```

### Manual Rollback

1. **Git Revert:**
   ```bash
   git revert HEAD
   git push origin main
   ```

2. **Redeploy Previous Version:**
   ```bash
   git checkout <previous-commit-hash>
   git push -f origin main
   ```

3. **Notify Users:**
   - Add banner: "System maintenance in progress"
   - Update status page

---

## 🔒 Security Considerations

### Client Security

1. **Content Security Policy:**
   ```html
   <meta http-equiv="Content-Security-Policy"
         content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';">
   ```

2. **Environment Variables:**
   - Never commit `.env` files
   - Use platform-specific secret management
   - Rotate secrets regularly

### Server Security

1. **CORS Configuration:**
   ```typescript
   // server/index.ts
   const corsOptions = {
     origin: process.env.CLIENT_URL,
     methods: ['GET', 'POST'],
     credentials: true
   };
   ```

2. **Rate Limiting:**
   ```bash
   npm install express-rate-limit
   ```

   ```typescript
   import rateLimit from 'express-rate-limit';

   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100 // limit each IP to 100 requests per windowMs
   });

   app.use(limiter);
   ```

3. **Input Validation:**
   - Validate all WebSocket messages
   - Sanitize user inputs
   - Use TypeScript types

4. **HTTPS Only:**
   - Redirect HTTP to HTTPS
   - Use HSTS header

---

## 📞 Support & Troubleshooting

### Common Deployment Issues

**Issue: Build fails with "Cannot find module"**
```bash
# Solution: Install all dependencies including devDependencies
npm install
npm run build
```

**Issue: WebSocket connection fails in production**
```bash
# Solution: Check CORS settings and ensure WSS:// (not WS://)
# Update client VITE_SERVER_URL to use https://
```

**Issue: 404 on client routes**
```bash
# Solution: Configure server for SPA
# For Vercel, add vercel.json:
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

**Issue: Environment variables not loading**
```bash
# Solution: Ensure .env.production exists
# For Vite, use VITE_ prefix
# Rebuild after adding env vars
```

### Getting Help

- **Email:** info@y7agency.com
- **Telegram:** [@sergiivoo](https://t.me/sergiivoo)
- **Documentation:** See LOCAL_RUN_GUIDE.md
- **GitHub Issues:** (if public repo)

---

## 🎯 Production URLs

**Client:**
- Production: `https://your-domain.com`
- Staging: `https://staging.your-domain.com`

**Server:**
- Production: `https://api.your-domain.com`
- Staging: `https://staging-api.your-domain.com`

**Health Checks:**
- Client: `https://your-domain.com` (should load)
- Server: `https://api.your-domain.com/health` (should return JSON)

---

<div align="center">

**✅ Deployment Guide Complete**

**Version:** v2.1-AVATAR-SKILLS
**Last Updated:** 2026-01-11

Follow this guide step-by-step for a successful production deployment.

</div>
