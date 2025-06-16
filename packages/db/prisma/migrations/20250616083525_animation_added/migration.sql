-- CreateTable
CREATE TABLE "Animation" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Animation_pkey" PRIMARY KEY ("id")
);
