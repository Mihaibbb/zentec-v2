# Deployment Guide

This guide covers deploying the Medical Software App with a Node.js/Express backend and React/Vite frontend.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Database Setup](#database-setup)
3. [Backend Deployment](#backend-deployment)
4. [Frontend Deployment](#frontend-deployment)
5. [Environment Variables](#environment-variables)
6. [Platform-Specific Guides](#platform-specific-guides)

---

## Prerequisites

- Node.js 18+ and npm
- MySQL 8.0+ database
- Git repository
- Domain name (optional but recommended)

---

## Database Setup

### 1. Create MySQL Database

```bash
# Connect to MySQL
mysql -u root -p

# Create database
CREATE DATABASE medical_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Create a dedicated user (recommended)
CREATE USER 'medical_app_user'@'%' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON medical_app.* TO 'medical_app_user'@'%';
FLUSH PRIVILEGES;
EXIT;
```

### 2. Run Database Migrations

```bash
cd backend
mysql -u medical_app_user -p medical_app < sql/schema.sql
mysql -u medical_app_user -p medical_app < sql/migrations/alter_patients_add_fields.sql
```

### 3. Create Super Admin (Optional)

```bash
cd backend
npm run create:super-admin
# Follow the prompts to create your super admin account
```

---

## Environment Variables

### Backend Environment Variables

Create a `.env` file in the `backend/` directory:

```env
PORT=4000
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
DATABASE_URL=mysql://medical_app_user:your_secure_password@your_db_host:3306/medical_app
```

**Important Security Notes:**
- Use a strong, random JWT_SECRET (at least 32 characters)
- Never commit `.env` files to version control
- Use different secrets for development and production

### Frontend Environment Variables

Create a `.env` file in the `frontend/` directory:

```env
VITE_API_URL=https://your-backend-domain.com
```

For local development:
```env
VITE_API_URL=http://localhost:4000
```

---

## Backend Deployment

### Option 1: Using PM2 (Recommended for VPS)

1. **Build the backend:**
```bash
cd backend
npm install
npm run build
```

2. **Install PM2 globally:**
```bash
npm install -g pm2
```

3. **Start the application:**
```bash
pm2 start dist/index.js --name medical-app-backend
```

4. **Configure PM2 to start on system reboot:**
```bash
pm2 startup
pm2 save
```

5. **Monitor the application:**
```bash
pm2 status
pm2 logs medical-app-backend
```

### Option 2: Using Railway

1. **Connect your GitHub repository to Railway**
2. **Add environment variables:**
   - `PORT` (Railway sets this automatically)
   - `JWT_SECRET`
   - `DATABASE_URL` (use Railway's MySQL addon or external database)
3. **Set build command:** `npm install && npm run build`
4. **Set start command:** `npm start`
5. **Deploy!**

### Option 3: Using Render

1. **Create a new Web Service**
2. **Connect your GitHub repository**
3. **Configure:**
   - **Build Command:** `cd backend && npm install && npm run build`
   - **Start Command:** `cd backend && npm start`
   - **Environment:** Node
4. **Add environment variables** (same as above)
5. **Deploy!**

### Option 4: Using Heroku

1. **Install Heroku CLI and login:**
```bash
heroku login
```

2. **Create a Heroku app:**
```bash
cd backend
heroku create your-app-name-backend
```

3. **Add MySQL addon (or use external database):**
```bash
heroku addons:create cleardb:ignite
# Or use JawsDB
heroku addons:create jawsdb:kitefin
```

4. **Set environment variables:**
```bash
heroku config:set JWT_SECRET=your_secret_key
heroku config:set DATABASE_URL=$(heroku config:get DATABASE_URL)
```

5. **Deploy:**
```bash
git push heroku main
```

---

## Frontend Deployment

### Option 1: Using Vercel (Recommended)

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Build the frontend:**
```bash
cd frontend
npm install
npm run build
```

3. **Deploy:**
```bash
vercel
# Follow the prompts
# Make sure to set VITE_API_URL environment variable in Vercel dashboard
```

4. **Or connect via GitHub:**
   - Go to [vercel.com](https://vercel.com)
   - Import your repository
   - Set root directory to `frontend`
   - Add environment variable: `VITE_API_URL`
   - Deploy!

### Option 2: Using Netlify

1. **Build command:** `cd frontend && npm install && npm run build`
2. **Publish directory:** `frontend/dist`
3. **Add environment variable:** `VITE_API_URL`
4. **Deploy!**

### Option 3: Using GitHub Pages

1. **Update `vite.config.ts`** (if not already done):
```typescript
export default defineConfig({
  base: '/your-repo-name/', // if deploying to subdirectory
  // ... rest of config
})
```

2. **Add deploy script to `package.json`:**
```json
{
  "scripts": {
    "deploy": "npm run build && gh-pages -d dist"
  },
  "devDependencies": {
    "gh-pages": "^6.0.0"
  }
}
```

3. **Deploy:**
```bash
npm run deploy
```

### Option 4: Using Traditional Web Server (Nginx)

1. **Build the frontend:**
```bash
cd frontend
npm install
npm run build
```

2. **Copy files to server:**
```bash
scp -r dist/* user@your-server:/var/www/html/
```

3. **Configure Nginx:**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Optional: Proxy API requests
    location /api {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Complete Deployment Example (VPS with Nginx)

### Step 1: Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install MySQL
sudo apt install mysql-server -y
sudo mysql_secure_installation

# Install Nginx
sudo apt install nginx -y
```

### Step 2: Database Setup

```bash
# Create database and user (as shown in Database Setup section)
mysql -u root -p
```

### Step 3: Backend Deployment

```bash
# Clone repository
git clone https://github.com/your-username/Medical-Software-App.git
cd Medical-Software-App/backend

# Install dependencies
npm install

# Create .env file
nano .env
# Add your environment variables

# Build
npm run build

# Install PM2
sudo npm install -g pm2

# Start application
pm2 start dist/index.js --name medical-app-backend
pm2 startup
pm2 save
```

### Step 4: Frontend Deployment

```bash
cd ../frontend

# Install dependencies
npm install

# Create .env file
nano .env
# Add: VITE_API_URL=https://api.your-domain.com

# Build
npm run build

# Copy to Nginx directory
sudo cp -r dist/* /var/www/html/
```

### Step 5: Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/medical-app
```

Add configuration:
```nginx
# Frontend
server {
    listen 80;
    server_name your-domain.com;

    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}

# Backend API
server {
    listen 80;
    server_name api.your-domain.com;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/medical-app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Step 6: SSL with Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com -d api.your-domain.com
```

---

## Security Checklist

- [ ] Use strong, unique JWT_SECRET
- [ ] Use HTTPS for all connections
- [ ] Set up CORS properly (backend)
- [ ] Use environment variables for all secrets
- [ ] Enable MySQL SSL connections
- [ ] Set up firewall rules (only allow necessary ports)
- [ ] Regularly update dependencies
- [ ] Set up database backups
- [ ] Use strong database passwords
- [ ] Enable rate limiting (consider adding express-rate-limit)
- [ ] Set up monitoring and logging

---

## Monitoring & Maintenance

### Backend Monitoring

```bash
# PM2 monitoring
pm2 monit

# View logs
pm2 logs medical-app-backend

# Restart application
pm2 restart medical-app-backend
```

### Database Backups

```bash
# Create backup
mysqldump -u medical_app_user -p medical_app > backup_$(date +%Y%m%d).sql

# Restore backup
mysql -u medical_app_user -p medical_app < backup_20250101.sql
```

### Update Deployment

```bash
# Pull latest changes
git pull origin main

# Backend
cd backend
npm install
npm run build
pm2 restart medical-app-backend

# Frontend
cd ../frontend
npm install
npm run build
sudo cp -r dist/* /var/www/html/
```

---

## Troubleshooting

### Backend Issues

- **Port already in use:** Change PORT in .env or kill the process using the port
- **Database connection failed:** Check DATABASE_URL and database credentials
- **JWT errors:** Verify JWT_SECRET is set correctly

### Frontend Issues

- **API calls failing:** Check VITE_API_URL is set correctly
- **Build errors:** Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- **CORS errors:** Ensure backend CORS is configured to allow your frontend domain

---

## Quick Reference

### Backend Commands
```bash
npm run dev          # Development mode
npm run build        # Build for production
npm start            # Start production server
npm run create:super-admin  # Create super admin
```

### Frontend Commands
```bash
npm run dev          # Development mode
npm run build        # Build for production
npm run preview      # Preview production build
```

---

## Support

For issues or questions, check:
- Backend logs: `pm2 logs medical-app-backend`
- Nginx logs: `sudo tail -f /var/log/nginx/error.log`
- MySQL logs: Check MySQL error log location

