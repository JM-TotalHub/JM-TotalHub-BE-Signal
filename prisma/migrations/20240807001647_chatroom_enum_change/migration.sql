/*
  Warnings:

  - The values [one_on_one] on the enum `chat_room_chat_type` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `chat_room` MODIFY `chat_type` ENUM('one_to_one', 'private', 'public') NOT NULL;
