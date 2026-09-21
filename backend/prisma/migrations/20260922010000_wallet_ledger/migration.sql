-- CreateEnum
CREATE TYPE "WalletLedgerType" AS ENUM ('top_up', 'booking_debit', 'booking_refund', 'food_debit');

-- CreateTable
CREATE TABLE "wallet_ledger_entries" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "amount_cents" INTEGER NOT NULL,
    "balance_after_cents" INTEGER NOT NULL,
    "type" "WalletLedgerType" NOT NULL,
    "reference_type" TEXT,
    "reference_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wallet_ledger_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "wallet_ledger_entries_user_id_created_at_idx" ON "wallet_ledger_entries"("user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "wallet_ledger_entries_reference_type_reference_id_type_idx" ON "wallet_ledger_entries"("reference_type", "reference_id", "type");

-- AddForeignKey
ALTER TABLE "wallet_ledger_entries" ADD CONSTRAINT "wallet_ledger_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
