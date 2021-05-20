-- CreateIndex
CREATE INDEX "Attachment.userId_index" ON "Attachment"("userId");

-- CreateIndex
CREATE INDEX "Expense.userId_index" ON "Expense"("userId");

-- CreateIndex
CREATE INDEX "Expense.vendorId_index" ON "Expense"("vendorId");
