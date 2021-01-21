-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL,
    "rep" INTEGER NOT NULL DEFAULT 1
);

-- CreateIndex
CREATE UNIQUE INDEX "User.id_unique" ON "User"("id");
