# Quick Deployment Guide

## 🚀 Fastest Deployment Path

### Option A: Railway (Easiest - Recommended for Beginners)

**Backend:**
1. Go to [railway.app](https://railway.app)
2. New Project → Deploy from GitHub
3. Select your repo, set root directory to `backend`
4. Add MySQL service (or use external database)
5. Add environment variables:
   - `JWT_SECRET` (generate a random string)
   - `DATABASE_URL` (from MySQL service)
6. Deploy!

**Frontend:**
1. New Service → Deploy from GitHub
2. Set root directory to `frontend`
3. Add environment variable: `VITE_API_URL` (your backend URL)
4. Deploy!

**Total time: ~15 minutes**

---

### Option B: Vercel (Frontend) + Railway (Backend)

**Backend:** Same as Option A

**Frontend:**
1. Go to [vercel.com](https://vercel.com)
2. Import GitHub repository
3. Set root directory to `frontend`
4. Add environment variable: `VITE_API_URL`
5. Deploy!

**Total time: ~10 minutes**

---

## 📋 Pre-Deployment Checklist

### Database Setup
- [ ] MySQL database created
- [ ] Database user created with proper permissions
- [ ] Schema applied: `mysql -u user -p database < backend/sql/schema.sql`
- [ ] Migrations applied: `mysql -u user -p database < backend/sql/migrations/alter_patients_add_fields.sql`
- [ ] Super admin created: `cd backend && npm run create:super-admin`

### Backend
- [ ] `.env` file created with:
  - `PORT=4000` (or let platform set it)
  - `JWT_SECRET` (strong random string)
  - `DATABASE_URL` (MySQL connection string)
- [ ] `npm run build` succeeds
- [ ] `npm start` works locally

### Frontend
- [ ] `.env` file created with:
  - `VITE_API_URL` (your backend URL)
- [ ] `npm run build` succeeds
- [ ] Build output in `frontend/dist/` directory

---

## 🔧 Environment Variables Reference

### Backend `.env`
```env
PORT=4000
JWT_SECRET=change_this_to_a_random_32_character_string
DATABASE_URL=mysql://username:password@host:3306/database_name
```

### Frontend `.env`
```env
VITE_API_URL=https://your-backend-url.com
```

**For local development:**
```env
VITE_API_URL=http://localhost:4000
```

---

## 🎯 Platform-Specific Quick Commands

### Railway
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link project
railway link

# Deploy
railway up
```

### Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel
```

### Render
- Use web dashboard (no CLI needed)
- Connect GitHub repo
- Set build/start commands
- Add environment variables

---

## 🔐 Security Quick Tips

1. **Generate strong JWT_SECRET:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Use HTTPS:** All platforms provide SSL certificates automatically

3. **Database Security:**
   - Use strong passwords
   - Restrict database access to backend IP only (if possible)
   - Enable SSL connections

4. **Environment Variables:**
   - Never commit `.env` files
   - Use platform's environment variable settings
   - Rotate secrets regularly

---

## 🐛 Common Issues & Fixes

### "Cannot connect to database"
- Check DATABASE_URL format: `mysql://user:pass@host:port/db`
- Verify database is accessible from deployment platform
- Check firewall rules

### "CORS error"
- Backend CORS is already configured to allow all origins
- If issues persist, check backend logs

### "API calls failing"
- Verify `VITE_API_URL` is set correctly
- Check backend is running and accessible
- Verify backend URL doesn't have trailing slash

### "Build fails"
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version (should be 18+)
- Review build logs for specific errors

---

## 📊 Post-Deployment

1. **Test the application:**
   - Visit frontend URL
   - Login with super admin credentials
   - Create a clinic
   - Create users for the clinic
   - Test appointments, doctors, patients

2. **Monitor:**
   - Check backend logs
   - Monitor database connections
   - Set up error tracking (optional: Sentry)

3. **Backup:**
   - Set up database backups (daily recommended)
   - Document your deployment configuration

---

## 🆘 Need Help?

1. Check the full [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions
2. Review platform-specific documentation:
   - [Railway Docs](https://docs.railway.app)
   - [Vercel Docs](https://vercel.com/docs)
   - [Render Docs](https://render.com/docs)

---

## ✅ Success Indicators

Your deployment is successful when:
- ✅ Frontend loads without errors
- ✅ Login works
- ✅ API calls succeed (check browser Network tab)
- ✅ Database operations work (create clinic, add doctor, etc.)
- ✅ No CORS errors in browser console

