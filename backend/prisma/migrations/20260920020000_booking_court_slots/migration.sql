-- AlterTable
ALTER TABLE "bookings" ADD COLUMN "court_slots" JSONB;

-- Backfill single-court segments from legacy columns
UPDATE "bookings"
SET "court_slots" = jsonb_build_array(
  jsonb_build_object(
    'courtId', "court_id",
    'slotIds', to_jsonb("slot_ids")
  )
)
WHERE "court_slots" IS NULL;
