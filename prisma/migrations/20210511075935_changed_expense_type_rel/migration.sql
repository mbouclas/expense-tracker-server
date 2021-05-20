/*
  Warnings:

  - You are about to drop the column `expenseTypeId` on the `Expense` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "_ExpenseToExpenseType" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    FOREIGN KEY ("A") REFERENCES "Expense" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY ("B") REFERENCES "ExpenseType" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Expense" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "vendorId" INTEGER,
    "price" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY ("vendorId") REFERENCES "Vendor" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Expense" ("id", "title", "userId", "vendorId", "price", "created_at", "updated_at") SELECT "id", "title", "userId", "vendorId", "price", "created_at", "updated_at" FROM "Expense";
DROP TABLE "Expense";
ALTER TABLE "new_Expense" RENAME TO "Expense";
CREATE INDEX "Expense.userId_index" ON "Expense"("userId");
CREATE INDEX "Expense.vendorId_index" ON "Expense"("vendorId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "_ExpenseToExpenseType_AB_unique" ON "_ExpenseToExpenseType"("A", "B");

-- CreateIndex
CREATE INDEX "_ExpenseToExpenseType_B_index" ON "_ExpenseToExpenseType"("B");
