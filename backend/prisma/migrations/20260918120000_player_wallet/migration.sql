-- CreateEnum
CREATE TYPE "WalletTopUpStatus" AS ENUM ('pending', 'approved', 'rejected');

-- CreateTable
CREATE TABLE "wallets" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "balance_cents" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallet_top_ups" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "amount_cents" INTEGER NOT NULL,
    "receipt_name" TEXT,
    "receipt_key" TEXT,
    "receipt_mime_type" TEXT,
    "status" "WalletTopUpStatus" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wallet_top_ups_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "wallets_user_id_key" ON "wallets"("user_id");

-- CreateIndex
CREATE INDEX "wallet_top_ups_status_idx" ON "wallet_top_ups"("status");

-- CreateIndex
CREATE INDEX "wallet_top_ups_user_id_idx" ON "wallet_top_ups"("user_id");

-- CreateIndex
CREATE INDEX "wallet_top_ups_created_at_idx" ON "wallet_top_ups"("created_at");

-- AddForeignKey
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet_top_ups" ADD CONSTRAINT "wallet_top_ups_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
