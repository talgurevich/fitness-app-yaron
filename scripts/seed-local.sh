#!/bin/bash

# Save current schema
cp prisma/schema.prisma prisma/schema.prisma.backup

# Change to SQLite for local seeding
sed -i '' 's/provider = "postgresql"/provider = "sqlite"/' prisma/schema.prisma

# Generate Prisma client for SQLite
npx prisma generate

# Run seed script with local database
DATABASE_URL="file:./prisma/dev.db" npx tsx scripts/seed-data.ts

# Restore PostgreSQL schema
mv prisma/schema.prisma.backup prisma/schema.prisma

# Regenerate Prisma client for PostgreSQL
npx prisma generate

echo "✅ Seeding complete and schema restored!"