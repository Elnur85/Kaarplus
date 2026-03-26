-- CreateEnum
CREATE TYPE "VehicleReferenceOptionType" AS ENUM (
    'FUEL_TYPE',
    'TRANSMISSION',
    'DRIVE_TYPE',
    'EXTERIOR_COLOR',
    'LOCATION',
    'CONDITION'
);

-- CreateTable
CREATE TABLE "VehicleMake" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VehicleMake_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehicleModel" (
    "id" TEXT NOT NULL,
    "makeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VehicleModel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehicleBodyCategory" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VehicleBodyCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehicleBodySubtype" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VehicleBodySubtype_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehicleReferenceOption" (
    "id" TEXT NOT NULL,
    "type" "VehicleReferenceOptionType" NOT NULL,
    "key" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VehicleReferenceOption_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VehicleMake_name_key" ON "VehicleMake"("name");

-- CreateIndex
CREATE UNIQUE INDEX "VehicleModel_makeId_name_key" ON "VehicleModel"("makeId", "name");

-- CreateIndex
CREATE INDEX "VehicleModel_makeId_sortOrder_idx" ON "VehicleModel"("makeId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "VehicleBodyCategory_key_key" ON "VehicleBodyCategory"("key");

-- CreateIndex
CREATE UNIQUE INDEX "VehicleBodySubtype_categoryId_key_key" ON "VehicleBodySubtype"("categoryId", "key");

-- CreateIndex
CREATE INDEX "VehicleBodySubtype_categoryId_sortOrder_idx" ON "VehicleBodySubtype"("categoryId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "VehicleReferenceOption_type_key_key" ON "VehicleReferenceOption"("type", "key");

-- CreateIndex
CREATE INDEX "VehicleReferenceOption_type_sortOrder_idx" ON "VehicleReferenceOption"("type", "sortOrder");

-- AddForeignKey
ALTER TABLE "VehicleModel"
ADD CONSTRAINT "VehicleModel_makeId_fkey"
FOREIGN KEY ("makeId") REFERENCES "VehicleMake"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleBodySubtype"
ADD CONSTRAINT "VehicleBodySubtype_categoryId_fkey"
FOREIGN KEY ("categoryId") REFERENCES "VehicleBodyCategory"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
