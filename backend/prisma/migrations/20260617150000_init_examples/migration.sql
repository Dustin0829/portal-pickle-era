CREATE TABLE "examples" (
    "id" TEXT NOT NULL,
    "label" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "examples_pkey" PRIMARY KEY ("id")
);
