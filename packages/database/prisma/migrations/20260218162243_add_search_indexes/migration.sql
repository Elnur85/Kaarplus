/*
  Warnings:

  - A unique constraint covering the columns `[reviewerId,targetId,listingId]` on the table `Review` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `Session` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "AdUnitType" AS ENUM ('BANNER', 'NATIVE', 'ADSENSE');

-- CreateEnum
CREATE TYPE "AdEventType" AS ENUM ('IMPRESSION', 'CLICK');

-- DropIndex
DROP INDEX "Review_reviewerId_listingId_key";

-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "ListingImage" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdCampaign" (
    "id" TEXT NOT NULL,
    "advertiserId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "budget" DECIMAL(10,2) NOT NULL,
    "dailyBudget" DECIMAL(10,2) NOT NULL,
    "spent" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "CampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "priority" INTEGER NOT NULL DEFAULT 3,
    "targeting" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdCampaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdUnit" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "placementId" TEXT NOT NULL,
    "type" "AdUnitType" NOT NULL DEFAULT 'BANNER',
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdUnit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Advertisement" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "adUnitId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "imageUrl" TEXT,
    "imageUrlMobile" TEXT,
    "linkUrl" TEXT,
    "adSenseSnippet" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Advertisement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdAnalytics" (
    "id" TEXT NOT NULL,
    "advertisementId" TEXT NOT NULL,
    "eventType" "AdEventType" NOT NULL,
    "userId" TEXT,
    "device" TEXT,
    "locale" TEXT,
    "ipHash" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SponsoredListing" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "boostMultiplier" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SponsoredListing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_token_key" ON "PasswordResetToken"("token");

-- CreateIndex
CREATE INDEX "PasswordResetToken_email_idx" ON "PasswordResetToken"("email");

-- CreateIndex
CREATE INDEX "PasswordResetToken_token_idx" ON "PasswordResetToken"("token");

-- CreateIndex
CREATE INDEX "PasswordResetToken_expires_idx" ON "PasswordResetToken"("expires");

-- CreateIndex
CREATE INDEX "AdCampaign_status_startDate_endDate_idx" ON "AdCampaign"("status", "startDate", "endDate");

-- CreateIndex
CREATE INDEX "AdCampaign_advertiserId_idx" ON "AdCampaign"("advertiserId");

-- CreateIndex
CREATE INDEX "AdCampaign_priority_status_idx" ON "AdCampaign"("priority", "status");

-- CreateIndex
CREATE UNIQUE INDEX "AdUnit_placementId_key" ON "AdUnit"("placementId");

-- CreateIndex
CREATE INDEX "AdUnit_placementId_active_idx" ON "AdUnit"("placementId", "active");

-- CreateIndex
CREATE INDEX "Advertisement_campaignId_active_idx" ON "Advertisement"("campaignId", "active");

-- CreateIndex
CREATE INDEX "Advertisement_adUnitId_active_idx" ON "Advertisement"("adUnitId", "active");

-- CreateIndex
CREATE INDEX "AdAnalytics_advertisementId_eventType_idx" ON "AdAnalytics"("advertisementId", "eventType");

-- CreateIndex
CREATE INDEX "AdAnalytics_createdAt_idx" ON "AdAnalytics"("createdAt");

-- CreateIndex
CREATE INDEX "AdAnalytics_advertisementId_createdAt_idx" ON "AdAnalytics"("advertisementId", "createdAt");

-- CreateIndex
CREATE INDEX "SponsoredListing_active_campaignId_idx" ON "SponsoredListing"("active", "campaignId");

-- CreateIndex
CREATE UNIQUE INDEX "SponsoredListing_listingId_campaignId_key" ON "SponsoredListing"("listingId", "campaignId");

-- CreateIndex
CREATE INDEX "GdprConsent_ipAddress_idx" ON "GdprConsent"("ipAddress");

-- CreateIndex
CREATE INDEX "Listing_userId_deletedAt_idx" ON "Listing"("userId", "deletedAt");

-- CreateIndex
CREATE INDEX "Listing_deletedAt_idx" ON "Listing"("deletedAt");

-- CreateIndex
CREATE INDEX "Listing_make_model_year_price_status_idx" ON "Listing"("make", "model", "year", "price", "status");

-- CreateIndex
CREATE INDEX "Listing_location_status_publishedAt_idx" ON "Listing"("location", "status", "publishedAt");

-- CreateIndex
CREATE INDEX "Listing_fuelType_status_idx" ON "Listing"("fuelType", "status");

-- CreateIndex
CREATE INDEX "Listing_transmission_status_idx" ON "Listing"("transmission", "status");

-- CreateIndex
CREATE INDEX "Listing_bodyType_status_idx" ON "Listing"("bodyType", "status");

-- CreateIndex
CREATE INDEX "Listing_mileage_idx" ON "Listing"("mileage");

-- CreateIndex
CREATE INDEX "Message_senderId_idx" ON "Message"("senderId");

-- CreateIndex
CREATE INDEX "Message_deletedAt_idx" ON "Message"("deletedAt");

-- CreateIndex
CREATE INDEX "Newsletter_active_idx" ON "Newsletter"("active");

-- CreateIndex
CREATE INDEX "Payment_listingId_idx" ON "Payment"("listingId");

-- CreateIndex
CREATE INDEX "Review_rating_idx" ON "Review"("rating");

-- CreateIndex
CREATE UNIQUE INDEX "Review_reviewerId_targetId_listingId_key" ON "Review"("reviewerId", "targetId", "listingId");

-- CreateIndex
CREATE INDEX "User_deletedAt_idx" ON "User"("deletedAt");

-- CreateIndex
CREATE INDEX "User_email_deletedAt_idx" ON "User"("email", "deletedAt");

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdCampaign" ADD CONSTRAINT "AdCampaign_advertiserId_fkey" FOREIGN KEY ("advertiserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Advertisement" ADD CONSTRAINT "Advertisement_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "AdCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Advertisement" ADD CONSTRAINT "Advertisement_adUnitId_fkey" FOREIGN KEY ("adUnitId") REFERENCES "AdUnit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdAnalytics" ADD CONSTRAINT "AdAnalytics_advertisementId_fkey" FOREIGN KEY ("advertisementId") REFERENCES "Advertisement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SponsoredListing" ADD CONSTRAINT "SponsoredListing_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SponsoredListing" ADD CONSTRAINT "SponsoredListing_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "AdCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;
