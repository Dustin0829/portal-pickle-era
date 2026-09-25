-- CreateEnum
CREATE TYPE "OpenPlaySessionStatus" AS ENUM ('upcoming', 'live', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "OpenPlayParticipantStatus" AS ENUM ('booked', 'checked_in', 'no_show', 'left_session');

-- CreateEnum
CREATE TYPE "OpenPlayCourtState" AS ENUM ('available', 'ready', 'playing', 'game_over', 'unavailable');

-- CreateEnum
CREATE TYPE "OpenPlayGameStatus" AS ENUM ('playing', 'completed');

-- CreateTable
CREATE TABLE "open_play_sessions" (
    "id" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "slot_id" TEXT NOT NULL,
    "status" "OpenPlaySessionStatus" NOT NULL DEFAULT 'upcoming',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "open_play_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "open_play_participants" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "user_id" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "status" "OpenPlayParticipantStatus" NOT NULL DEFAULT 'booked',
    "checked_in_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "open_play_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "open_play_courts" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "court_id" TEXT NOT NULL,
    "court_label" TEXT NOT NULL,
    "state" "OpenPlayCourtState" NOT NULL DEFAULT 'available',
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "open_play_courts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "open_play_games" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "court_row_id" TEXT NOT NULL,
    "status" "OpenPlayGameStatus" NOT NULL DEFAULT 'playing',
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended_at" TIMESTAMP(3),
    "ended_by_user_id" TEXT,
    "ended_by_role" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "open_play_games_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "open_play_game_seats" (
    "id" TEXT NOT NULL,
    "game_id" TEXT NOT NULL,
    "participant_id" TEXT NOT NULL,
    "side" TEXT NOT NULL,
    "seat_index" INTEGER NOT NULL,

    CONSTRAINT "open_play_game_seats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "open_play_queue_entries" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "participant_id" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "open_play_queue_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "open_play_sessions_status_idx" ON "open_play_sessions"("status");

-- CreateIndex
CREATE UNIQUE INDEX "open_play_sessions_date_slot_id_key" ON "open_play_sessions"("date", "slot_id");

-- CreateIndex
CREATE INDEX "open_play_participants_session_id_status_idx" ON "open_play_participants"("session_id", "status");

-- CreateIndex
CREATE INDEX "open_play_participants_user_id_idx" ON "open_play_participants"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "open_play_participants_session_id_booking_id_key" ON "open_play_participants"("session_id", "booking_id");

-- CreateIndex
CREATE UNIQUE INDEX "open_play_courts_session_id_court_id_key" ON "open_play_courts"("session_id", "court_id");

-- CreateIndex
CREATE INDEX "open_play_games_session_id_status_idx" ON "open_play_games"("session_id", "status");

-- CreateIndex
CREATE INDEX "open_play_games_court_row_id_status_idx" ON "open_play_games"("court_row_id", "status");

-- CreateIndex
CREATE INDEX "open_play_game_seats_participant_id_idx" ON "open_play_game_seats"("participant_id");

-- CreateIndex
CREATE UNIQUE INDEX "open_play_game_seats_game_id_seat_index_key" ON "open_play_game_seats"("game_id", "seat_index");

-- CreateIndex
CREATE INDEX "open_play_queue_entries_session_id_position_idx" ON "open_play_queue_entries"("session_id", "position");

-- CreateIndex
CREATE UNIQUE INDEX "open_play_queue_entries_session_id_participant_id_key" ON "open_play_queue_entries"("session_id", "participant_id");

-- AddForeignKey
ALTER TABLE "open_play_participants" ADD CONSTRAINT "open_play_participants_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "open_play_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "open_play_courts" ADD CONSTRAINT "open_play_courts_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "open_play_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "open_play_games" ADD CONSTRAINT "open_play_games_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "open_play_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "open_play_games" ADD CONSTRAINT "open_play_games_court_row_id_fkey" FOREIGN KEY ("court_row_id") REFERENCES "open_play_courts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "open_play_game_seats" ADD CONSTRAINT "open_play_game_seats_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "open_play_games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "open_play_game_seats" ADD CONSTRAINT "open_play_game_seats_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "open_play_participants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "open_play_queue_entries" ADD CONSTRAINT "open_play_queue_entries_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "open_play_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "open_play_queue_entries" ADD CONSTRAINT "open_play_queue_entries_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "open_play_participants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
