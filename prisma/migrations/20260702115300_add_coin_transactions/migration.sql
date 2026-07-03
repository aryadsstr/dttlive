-- CreateTable
CREATE TABLE `CoinTransaction` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `tiktokUserId` VARCHAR(191) NULL,
    `username` VARCHAR(191) NULL,
    `nickname` VARCHAR(191) NULL,
    `avatar` VARCHAR(191) NULL,
    `eventType` VARCHAR(191) NOT NULL,
    `giftName` VARCHAR(191) NULL,
    `diamondCount` INTEGER NOT NULL DEFAULT 0,
    `repeatCount` INTEGER NOT NULL DEFAULT 1,
    `coinAmount` INTEGER NOT NULL DEFAULT 0,
    `rawJson` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `CoinTransaction` ADD CONSTRAINT `CoinTransaction_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
