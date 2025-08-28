#!/bin/sh
set -e

echo "🚀 Starting SIL Lab Backend..."

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
until pg_isready -h $DB_HOST -p $DB_PORT -U $DB_USER; do
  echo "Database is unavailable - sleeping"
  sleep 2
done

echo "✅ Database is ready!"

# Run Prisma migrations
echo "🔄 Running Prisma migrations..."
npx prisma migrate deploy

# Generate Prisma client (in case of any changes)
echo "🔧 Generating Prisma client..."
npx prisma generate

# Seed database if needed (only in development)
if [ "$NODE_ENV" = "development" ]; then
  echo "🌱 Seeding database..."
  npm run db:seed || echo "⚠️  Seeding failed or already done"
fi

echo "🎉 Backend setup complete!"

# Execute the main command
exec "$@"