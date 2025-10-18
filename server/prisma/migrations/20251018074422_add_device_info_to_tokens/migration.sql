-- AlterTable
ALTER TABLE "login_history" ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "refresh_tokens" ADD COLUMN     "browser" TEXT,
ADD COLUMN     "deviceType" TEXT,
ADD COLUMN     "operatingSystem" TEXT;
