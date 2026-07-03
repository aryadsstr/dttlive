/*
  Warnings:

  - A unique constraint covering the columns `[auctionId,username]` on the table `Bidder` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Bidder_auctionId_username_key` ON `Bidder`(`auctionId`, `username`);
