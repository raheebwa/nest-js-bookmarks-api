/*
  Warnings:

  - Added the required column `title` to the `bookmarks` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "bookmarks" ADD COLUMN     "title" TEXT NOT NULL;
