/*
  Normalize the user auth key for the Supabase migration.
  This renames the legacy Firebase column to the Supabase equivalent
  and preserves existing user rows and company relationships.
*/

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'User'
      AND column_name = 'firebaseUid'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'User'
      AND column_name = 'supabaseUid'
  ) THEN
    EXECUTE 'ALTER TABLE "User" RENAME COLUMN "firebaseUid" TO "supabaseUid"';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename = 'User'
      AND indexname = 'User_firebaseUid_key'
  ) THEN
    EXECUTE 'ALTER INDEX "User_firebaseUid_key" RENAME TO "User_supabaseUid_key"';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename = 'User'
      AND indexname = 'User_firebaseUid_idx'
  ) THEN
    EXECUTE 'ALTER INDEX "User_firebaseUid_idx" RENAME TO "User_supabaseUid_idx"';
  END IF;
END $$;
