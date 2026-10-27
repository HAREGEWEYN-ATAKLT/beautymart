-- Reconcile index changes already present in the database.
DROP INDEX IF EXISTS "Stores_OwnerId_idx";

CREATE UNIQUE INDEX IF NOT EXISTS "Stores_OwnerId_key"
ON "Stores"("OwnerId");

CREATE UNIQUE INDEX IF NOT EXISTS "Users_PhoneNumber_key"
ON "Users"("PhoneNumber");