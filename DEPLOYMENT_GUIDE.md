# 🚀 SIL Lab Management System - Docker Deployment Guide

## 📋 Prerequisites

### Local Development
- Docker Desktop installed
- Docker Compose installed
- Git installed

### VPS Requirements (152.42.140.159)
- Ubuntu 20.04+ or similar Linux distribution
- Docker and Docker Compose installed
- At least 2GB RAM and 20GB storage
- Ports 80, 443, 5001, 5432 available

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   PostgreSQL    │
│  (React+Nginx)  │◄──►│ (Node.js+API)   │◄──►│   Database      │
│   Port: 80/443  │    │   Port: 5001    │    │   Port: 5432    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔧 Local Development Setup

### 1. Clone and Prepare
```bash
# Navigate to your project directory
cd "/Users/soufianerochdi/Downloads/SIL Lab Management System_files (1)"

# Create production environment file
cp .env.production .env

# Edit the .env file with your secure values
nano .env
```

### 2. Update Environment Variables
Edit `.env` file:
```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-make-it-very-long-and-random
POSTGRES_PASSWORD=your-secure-database-password-here
PGADMIN_DEFAULT_PASSWORD=your-pgadmin-password-here
```

### 3. Build and Run Locally
```bash
# Build all services
docker-compose build

# Start all services
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f
```

### 4. Access Applications
- **Frontend**: http://localhost
- **Backend API**: http://localhost:5001
- **pgAdmin**: http://localhost:8080 (optional)
- **Health Check**: http://localhost/health

### 5. Stop Services
```bash
# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ This will delete data)
docker-compose down -v
```

## 🌐 VPS Deployment

### 1. Prepare VPS (152.42.140.159)

#### Install Docker
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Logout and login again for group changes
exit
```

#### Configure Firewall
```bash
# Allow necessary ports
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw allow 5001  # Backend API
sudo ufw enable
```

### 2. Deploy Application

#### Method A: Direct File Transfer
```bash
# From your local machine, copy files to VPS
scp -r "/Users/soufianerochdi/Downloads/SIL Lab Management System_files (1)" user@152.42.140.159:/home/user/sil-lab/

# SSH into VPS
ssh user@152.42.140.159

# Navigate to project
cd /home/user/sil-lab
```

#### Method B: Git Repository (Recommended)
```bash
# On VPS, clone your repository
git clone <your-repository-url> /home/user/sil-lab
cd /home/user/sil-lab
```

### 3. Configure Production Environment
```bash
# Create production environment file
cp .env.production .env

# Edit with secure values
nano .env
```

Update `.env` with production values:
```env
JWT_SECRET=your-super-long-random-jwt-secret-for-production
POSTGRES_PASSWORD=your-very-secure-database-password
PGADMIN_DEFAULT_PASSWORD=your-secure-pgadmin-password
SERVER_IP=152.42.140.159
```

### 4. Deploy Services
```bash
# Build and start services
docker-compose up -d --build

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Check health
curl http://localhost/health
curl http://localhost:5001/api/health
```

### 5. Access Your Application
- **Frontend**: http://152.42.140.159
- **Backend API**: http://152.42.140.159:5001
- **Health Check**: http://152.42.140.159/health

## 🔒 SSL/HTTPS Setup (Optional but Recommended)

### Using Let's Encrypt with Certbot
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Stop nginx container temporarily
docker-compose stop frontend

# Get SSL certificate
sudo certbot certonly --standalone -d your-domain.com

# Update nginx.conf to include SSL configuration
# Then restart
docker-compose up -d frontend
```

## 📊 Monitoring and Maintenance

### Check Service Status
```bash
# View running containers
docker-compose ps

# Check resource usage
docker stats

# View logs
docker-compose logs -f [service-name]
```

### Database Management
```bash
# Access PostgreSQL directly
docker-compose exec postgres psql -U sil_user -d sil_lab

# Create database backup
docker-compose exec postgres pg_dump -U sil_user sil_lab > backup.sql

# Restore database
docker-compose exec -T postgres psql -U sil_user sil_lab < backup.sql
```

### Update Application
```bash
# Pull latest changes (if using Git)
git pull origin main

# Rebuild and restart services
docker-compose up -d --build

# Clean up old images
docker image prune -f
```

## 🛠️ Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Check what's using the port
sudo netstat -tulpn | grep :80

# Stop conflicting service
sudo systemctl stop apache2  # or nginx
```

#### 2. Database Connection Issues
```bash
# Check database logs
docker-compose logs postgres

# Verify database is healthy
docker-compose exec postgres pg_isready -U sil_user
```

#### 3. Frontend Not Loading
```bash
# Check frontend logs
docker-compose logs frontend

# Verify nginx configuration
docker-compose exec frontend nginx -t
```

#### 4. Backend API Issues
```bash
# Check backend logs
docker-compose logs backend

# Test database connection
docker-compose exec backend npm run db:generate
```

### Useful Commands
```bash
# Restart specific service
docker-compose restart [service-name]

# View service logs
docker-compose logs -f [service-name]

# Execute command in container
docker-compose exec [service-name] [command]

# Clean up everything
docker-compose down -v
docker system prune -a
```

## 🔐 Security Recommendations

1. **Change Default Passwords**: Update all default passwords in `.env`
2. **Use Strong JWT Secret**: Generate a long, random JWT secret
3. **Enable Firewall**: Configure UFW to allow only necessary ports
4. **Regular Updates**: Keep Docker images and system updated
5. **SSL Certificate**: Use HTTPS in production
6. **Database Security**: Restrict database access to application only
7. **Backup Strategy**: Implement regular database backups

## 📈 Performance Optimization

1. **Resource Limits**: Add resource limits to docker-compose.yml
2. **Nginx Caching**: Configure proper caching headers
3. **Database Tuning**: Optimize PostgreSQL configuration
4. **Log Rotation**: Implement log rotation to prevent disk space issues

## 🎉 Success Verification

After deployment, verify everything works:

1. ✅ Frontend loads: http://152.42.140.159
2. ✅ API responds: http://152.42.140.159:5001/api/health
3. ✅ Database connected: Check backend logs
4. ✅ Authentication works: Try logging in
5. ✅ All features functional: Test key application features

Your SIL Lab Management System is now successfully deployed! 🚀