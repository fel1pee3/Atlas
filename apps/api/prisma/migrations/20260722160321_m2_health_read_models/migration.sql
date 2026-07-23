-- CreateTable
CREATE TABLE "rm_daily_sleep" (
    "user_id" UUID NOT NULL,
    "day" DATE NOT NULL,
    "count" INTEGER NOT NULL,
    "total_duration_min" INTEGER NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rm_daily_sleep_pkey" PRIMARY KEY ("user_id","day")
);

-- CreateTable
CREATE TABLE "rm_daily_activity" (
    "user_id" UUID NOT NULL,
    "day" DATE NOT NULL,
    "total_steps" INTEGER NOT NULL,
    "workout_count" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rm_daily_activity_pkey" PRIMARY KEY ("user_id","day")
);

-- AddForeignKey
ALTER TABLE "rm_daily_sleep" ADD CONSTRAINT "rm_daily_sleep_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rm_daily_activity" ADD CONSTRAINT "rm_daily_activity_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
