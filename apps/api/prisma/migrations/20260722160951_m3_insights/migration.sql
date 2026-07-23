-- CreateTable
CREATE TABLE "insights" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "kind" TEXT NOT NULL,
    "fingerprint" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION,
    "method" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "insights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "insight_evidence" (
    "insight_id" UUID NOT NULL,
    "event_id" UUID NOT NULL,
    "weight" DOUBLE PRECISION,

    CONSTRAINT "insight_evidence_pkey" PRIMARY KEY ("insight_id","event_id")
);

-- CreateIndex
CREATE INDEX "insights_user_id_status_created_at_idx" ON "insights"("user_id", "status", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "insights_user_id_fingerprint_key" ON "insights"("user_id", "fingerprint");

-- AddForeignKey
ALTER TABLE "insights" ADD CONSTRAINT "insights_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insight_evidence" ADD CONSTRAINT "insight_evidence_insight_id_fkey" FOREIGN KEY ("insight_id") REFERENCES "insights"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insight_evidence" ADD CONSTRAINT "insight_evidence_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
