-- CreateTable
CREATE TABLE "facility_settings" (
    "id" TEXT NOT NULL,
    "court_price_pesos" INTEGER NOT NULL,
    "open_play_price_pesos" INTEGER NOT NULL,
    "clinic_price_pesos" INTEGER NOT NULL,
    "open_play_sessions" JSONB NOT NULL,
    "pre_signup" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "facility_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "facility_payment_methods" (
    "id" TEXT NOT NULL,
    "settings_id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "qr_image_key" TEXT,
    "sort_order" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "facility_payment_methods_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "facility_payment_methods_settings_id_sort_order_idx" ON "facility_payment_methods"("settings_id", "sort_order");

-- AddForeignKey
ALTER TABLE "facility_payment_methods" ADD CONSTRAINT "facility_payment_methods_settings_id_fkey" FOREIGN KEY ("settings_id") REFERENCES "facility_settings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
