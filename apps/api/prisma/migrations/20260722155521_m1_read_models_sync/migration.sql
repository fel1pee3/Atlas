-- CreateTable
CREATE TABLE "rm_daily_mood" (
    "user_id" UUID NOT NULL,
    "day" DATE NOT NULL,
    "count" INTEGER NOT NULL,
    "sum_score" INTEGER NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rm_daily_mood_pkey" PRIMARY KEY ("user_id","day")
);

-- CreateTable
CREATE TABLE "rm_daily_expense" (
    "user_id" UUID NOT NULL,
    "day" DATE NOT NULL,
    "count" INTEGER NOT NULL,
    "total_amount" DECIMAL(14,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'BRL',
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rm_daily_expense_pkey" PRIMARY KEY ("user_id","day")
);

-- CreateIndex
CREATE INDEX "events_user_id_ingested_at_idx" ON "events"("user_id", "ingested_at");

-- AddForeignKey
ALTER TABLE "rm_daily_mood" ADD CONSTRAINT "rm_daily_mood_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rm_daily_expense" ADD CONSTRAINT "rm_daily_expense_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
