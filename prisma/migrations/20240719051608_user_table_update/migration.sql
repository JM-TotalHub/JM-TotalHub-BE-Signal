/*
  Warnings:

  - Made the column `user_id` on table `board` required. This step will fail if there are existing NULL values in that column.
  - Made the column `user_id` on table `comment` required. This step will fail if there are existing NULL values in that column.
  - Made the column `user_id` on table `post` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `board` DROP FOREIGN KEY `board_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `comment` DROP FOREIGN KEY `comment_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `post` DROP FOREIGN KEY `post_user_id_fkey`;

-- AlterTable
ALTER TABLE `board` MODIFY `user_id` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `comment` MODIFY `user_id` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `post` MODIFY `user_id` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `board` ADD CONSTRAINT `board_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `post` ADD CONSTRAINT `post_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comment` ADD CONSTRAINT `comment_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
