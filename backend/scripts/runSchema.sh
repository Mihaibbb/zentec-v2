#!/bin/bash

# Script to run schema.sql against a MySQL database
# Usage: ./runSchema.sh [database_url]
# Example: ./runSchema.sh "mysql://user:password@localhost:3306/medical_app"

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get database URL from argument or environment variable
if [ -z "$1" ]; then
  if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}❌ Error: DATABASE_URL not provided${NC}"
    echo "Usage: $0 [database_url]"
    echo "   or: DATABASE_URL='mysql://user:pass@host:port/db' $0"
    exit 1
  fi
  DB_URL="$DATABASE_URL"
else
  DB_URL="$1"
fi

# Extract connection details from URL
# Format: mysql://user:password@host:port/database
if [[ $DB_URL =~ mysql://([^:]+):([^@]+)@([^:]+):([^/]+)/(.+) ]]; then
  DB_USER="${BASH_REMATCH[1]}"
  DB_PASS="${BASH_REMATCH[2]}"
  DB_HOST="${BASH_REMATCH[3]}"
  DB_PORT="${BASH_REMATCH[4]}"
  DB_NAME="${BASH_REMATCH[5]}"
else
  echo -e "${RED}❌ Error: Invalid DATABASE_URL format${NC}"
  echo "Expected format: mysql://user:password@host:port/database"
  exit 1
fi

echo -e "${GREEN}🔄 Connecting to database...${NC}"
echo "   Host: $DB_HOST:$DB_PORT"
echo "   Database: $DB_NAME"
echo "   User: $DB_USER"

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SCRIPT[0]}" )" && pwd )"
SCHEMA_FILE="$SCRIPT_DIR/../sql/schema.sql"
MIGRATION_FILE="$SCRIPT_DIR/../sql/migrations/alter_patients_add_fields.sql"

if [ ! -f "$SCHEMA_FILE" ]; then
  echo -e "${RED}❌ Error: Schema file not found: $SCHEMA_FILE${NC}"
  exit 1
fi

echo -e "${GREEN}📄 Running schema.sql...${NC}"

# Run schema.sql
mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < "$SCHEMA_FILE"

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Schema applied successfully!${NC}"
else
  echo -e "${RED}❌ Failed to apply schema${NC}"
  exit 1
fi

# Run migrations if they exist
if [ -f "$MIGRATION_FILE" ]; then
  echo -e "${GREEN}📄 Running migrations...${NC}"
  mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < "$MIGRATION_FILE"
  
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Migrations applied successfully!${NC}"
  else
    echo -e "${YELLOW}⚠️  Some migrations may have failed (this is OK if columns already exist)${NC}"
  fi
fi

echo -e "${GREEN}✅ All done!${NC}"

