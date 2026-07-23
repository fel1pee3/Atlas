-- CreateTable
CREATE TABLE "rm_daily_places" (
    "user_id" UUID NOT NULL,
    "day" DATE NOT NULL,
    "visit_count" INTEGER NOT NULL,
    "total_duration_min" INTEGER NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rm_daily_places_pkey" PRIMARY KEY ("user_id","day")
);

-- CreateTable
CREATE TABLE "rm_daily_calendar" (
    "user_id" UUID NOT NULL,
    "day" DATE NOT NULL,
    "event_count" INTEGER NOT NULL,
    "total_duration_min" INTEGER NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rm_daily_calendar_pkey" PRIMARY KEY ("user_id","day")
);

-- AddForeignKey
ALTER TABLE "rm_daily_places" ADD CONSTRAINT "rm_daily_places_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rm_daily_calendar" ADD CONSTRAINT "rm_daily_calendar_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
