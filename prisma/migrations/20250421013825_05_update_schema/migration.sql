/*
  Warnings:

  - You are about to drop the column `question` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `replay` on the `Message` table. All the data in the column will be lost.
  - Added the required column `sender` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `text` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Sender" AS ENUM ('user', 'model');

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "question",
DROP COLUMN "replay",
ADD COLUMN     "sender" "Sender" NOT NULL,
ADD COLUMN     "text" TEXT NOT NULL;
