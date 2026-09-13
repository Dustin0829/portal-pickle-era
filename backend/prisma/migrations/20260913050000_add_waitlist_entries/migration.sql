-- CreateEnum
CREATE TYPE "WaitlistSource" AS ENUM ('join_club', 'newsletter');

-- CreateTable
CREATE TABLE "waitlist_entries" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "source" "WaitlistSource" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "waitlist_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "waitlist_entries_email_key" ON "waitlist_entries"("email");

-- CreateIndex
CREATE INDEX "waitlist_entries_created_at_idx" ON "waitlist_entries"("created_at");

-- CreateIndex
CREATE INDEX "waitlist_entries_email_idx" ON "waitlist_entries"("email");
