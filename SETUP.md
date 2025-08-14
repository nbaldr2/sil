# SIL Laboratory Management System - PostgreSQL + Prisma Setup

This guide will help you set up the complete SIL Laboratory Management System with PostgreSQL database and Prisma ORM.

## 🚀 Quick Start

### Prerequisites

- **Node.js 16+** - [Download here](https://nodejs.org/)
- **PostgreSQL 12+** - [Download here](https://www.postgresql.org/download/)
- **Docker** (optional) - [Download here](https://www.docker.com/)

## 📋 Setup Options

### Option 1: Docker (Recommended)

If you have Docker installed, this is the easiest way to get started.

#### 1. Start PostgreSQL with Docker

```bash
# Start PostgreSQL container
docker-compose up -d postgres

# Verify it's running
docker ps
```

#### 2. Set up the Backend

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed the database with initial data
npm run db:seed

# Start the development server
npm run dev
```

#### 3. Set up the Frontend

```bash
# Navigate back to root directory
cd ..

# Install frontend dependencies
npm install

# Start the development server
npm run dev
```

### Option 2: Local PostgreSQL

If you prefer to use a local PostgreSQL installation.

#### 1. Install PostgreSQL

**macOS (using Homebrew):**
```bash
brew install postgresql
brew services start postgresql
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**Windows:**
Download and install from [PostgreSQL official website](https://www.postgresql.org/download/windows/)

#### 2. Create Database and User

```bash
# Connect to PostgreSQL as superuser
sudo -u postgres psql

# Create database and user
CREATE DATABASE sil_lab;
CREATE USER sil_user WITH PASSWORD 'sil_password';
GRANT ALL PRIVILEGES ON DATABASE sil_lab TO sil_user;
\q
```

#### 3. Set up the Backend

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed the database with initial data
npm run db:seed

# Start the development server
npm run dev
```

#### 4. Set up the Frontend

```bash
# Navigate back to root directory
cd ..

# Install frontend dependencies
npm install

# Start the development server
npm run dev
```

## 🔧 Configuration

### Environment Variables

The backend uses the following environment variables (already configured in `server/.env`):

```env
# Database
DATABASE_URL="postgresql://sil_user:sil_password@localhost:5432/sil_lab?schema=public"

# Server
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:5174

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend Configuration

The frontend is configured to connect to the backend at `http://localhost:5000/api`. This is set in `src/services/integrations.ts`.

## 🗄️ Database Management

### Prisma Studio

View and edit your database through Prisma Studio:

```bash
cd server
npm run db:studio
```

Access at: http://localhost:5555

### Database Commands

```bash
# Generate Prisma client (after schema changes)
npm run db:generate

# Push schema changes to database
npm run db:push

# Run migrations
npm run db:migrate

# Reset database (WARNING: This will delete all data)
npx prisma db push --force-reset
```

## 🔐 Authentication

### Demo Users

The system comes with pre-configured demo users:

| Role | Email | Password | Access |
|------|-------|----------|---------|
| **Admin** | `admin@lab.fr` | `admin` | Full system access |
| **Secretary** | `secretary@lab.fr` | `123456` | Patient registration, requests, billing |
| **Biologist** | `bio@lab.fr` | `123456` | Results validation, analysis management |
| **Technician** | `tech@lab.fr` | `123456` | Result entry, printing |

### JWT Authentication

The system uses JWT tokens for authentication. Tokens are automatically stored in localStorage and included in API requests.

## 📊 Initial Data

The database is seeded with:

- **4 Demo Users** (Admin, Secretary, Biologist, Technician)
- **15 Analysis Types** (Hématologie, Biochimie, Lipides, Hormonologie, Inflammation)
- **5 Sample Doctors** (various specialties)
- **5 Sample Patients** (with CNSS numbers)
- **2 Sample Requests** (completed and pending)
- **System Configuration** (laboratory settings)

## 🚀 Running the Application

### Development Mode

1. **Start the Backend:**
   ```bash
   cd server
   npm run dev
   ```
   Backend will be available at: http://localhost:5000

2. **Start the Frontend:**
   ```bash
   npm run dev
   ```
   Frontend will be available at: http://localhost:5174

3. **Access the Application:**
   - Open http://localhost:5174 in your browser
   - Login with demo credentials
   - Start using the system!

### Production Mode

1. **Build the Frontend:**
   ```bash
   npm run build
   ```

2. **Start the Backend:**
   ```bash
   cd server
   npm start
   ```

## 🔍 API Testing

### Health Check

```bash
curl http://localhost:5000/api/health
```

### Login Test

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@lab.fr","password":"admin"}'
```

### Get Patients

```bash
curl http://localhost:5000/api/patients \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🛠️ Troubleshooting

### Common Issues

#### 1. Database Connection Error

**Error:** `ECONNREFUSED` or `Connection failed`

**Solution:**
- Ensure PostgreSQL is running
- Check if the database exists: `psql -U sil_user -d sil_lab`
- Verify connection string in `server/.env`

#### 2. Prisma Client Error

**Error:** `PrismaClient is not generated`

**Solution:**
```bash
cd server
npm run db:generate
```

#### 3. CORS Error

**Error:** `CORS policy: No 'Access-Control-Allow-Origin' header`

**Solution:**
- Ensure backend is running on port 5000
- Check CORS_ORIGIN in `server/.env`
- Restart both frontend and backend

#### 4. Authentication Error

**Error:** `Invalid credentials`

**Solution:**
- Use the correct demo credentials
- Check if the database was seeded properly
- Try logging out and logging back in

#### 5. Port Already in Use

**Error:** `EADDRINUSE`

**Solution:**
- Kill the process using the port: `lsof -ti:5000 | xargs kill -9`
- Or change the port in `server/.env`

### Database Reset

If you need to start fresh:

```bash
cd server

# Reset database
npx prisma db push --force-reset

# Re-seed data
npm run db:seed
```

### Logs

**Backend logs:** Check the terminal where you ran `npm run dev`
**Frontend logs:** Check browser console (F12)

## 📁 Project Structure

```
SIL Lab Management System/
├── server/                 # Backend (Node.js + Express + Prisma)
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── controllers/   # Route handlers
│   │   └── index.js       # Main server file
│   ├── prisma/
│   │   ├── schema.prisma  # Database schema
│   │   └── seed.js        # Database seeding
│   └── package.json
├── src/                   # Frontend (React + TypeScript)
│   ├── components/        # React components
│   ├── services/          # API services
│   └── App.tsx           # Main app component
├── docker-compose.yml     # Docker configuration
└── package.json
```

## 🔒 Security Notes

- **JWT Secret:** Change the JWT_SECRET in production
- **Database Password:** Use strong passwords in production
- **HTTPS:** Use HTTPS in production
- **Rate Limiting:** Configure appropriate rate limits
- **CORS:** Restrict CORS origins in production

## 🚀 Deployment

### Backend Deployment

1. **Set environment variables for production**
2. **Use PM2 for process management:**
   ```bash
   npm install -g pm2
   pm2 start server/src/index.js --name sil-backend
   ```

3. **Set up reverse proxy (nginx):**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location /api {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

### Frontend Deployment

1. **Build for production:**
   ```bash
   npm run build
   ```

2. **Deploy the `dist` folder to your web server**

## 🤝 Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Verify all prerequisites are installed
3. Check the logs for error messages
4. Ensure the database is properly seeded

## 📚 Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://reactjs.org/docs/)

---

**SIL Laboratory Management System** - Professional laboratory management with PostgreSQL and Prisma. 