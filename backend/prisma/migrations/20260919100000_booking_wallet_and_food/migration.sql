-- AlterTable
ALTER TABLE "bookings" ADD COLUMN "wallet_applied_cents" INTEGER NOT NULL DEFAULT 0;

-- CreateEnum
CREATE TYPE "FoodOrderStatus" AS ENUM ('pending', 'preparing', 'ready');

-- CreateEnum
CREATE TYPE "FoodPayMode" AS ENUM ('wallet', 'counter');

-- CreateTable
CREATE TABLE "food_menu_items" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price_cents" INTEGER NOT NULL,
    "category" TEXT,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "image_key" TEXT,
    "image_mime_type" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "food_menu_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "food_orders" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "status" "FoodOrderStatus" NOT NULL DEFAULT 'pending',
    "pay_mode" "FoodPayMode" NOT NULL,
    "total_cents" INTEGER NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "food_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "food_order_lines" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "menu_item_id" TEXT,
    "name" TEXT NOT NULL,
    "unit_price_cents" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "food_order_lines_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "food_menu_items_available_idx" ON "food_menu_items"("available");

-- CreateIndex
CREATE INDEX "food_orders_status_idx" ON "food_orders"("status");

-- CreateIndex
CREATE INDEX "food_orders_user_id_idx" ON "food_orders"("user_id");

-- CreateIndex
CREATE INDEX "food_orders_created_at_idx" ON "food_orders"("created_at");

-- CreateIndex
CREATE INDEX "food_order_lines_order_id_idx" ON "food_order_lines"("order_id");

-- AddForeignKey
ALTER TABLE "food_orders" ADD CONSTRAINT "food_orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "food_order_lines" ADD CONSTRAINT "food_order_lines_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "food_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
