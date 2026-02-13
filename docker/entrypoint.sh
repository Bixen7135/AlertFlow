#!/bin/sh
set -e

echo "Waiting for database to be ready..."
until bun run backend/scripts/migrate.ts 2>/dev/null; do
  echo "Database not ready or migration failed, retrying in 2 seconds..."
  sleep 2
done

echo "Database migrations completed successfully!"

# Execute the main command
exec "$@"
