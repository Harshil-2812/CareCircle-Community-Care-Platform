const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.task_Assignments.deleteMany({ where: { task_id: { in: [25, 26] } } });
  console.log('Cleaned orphaned assignments.');
}

main().finally(() => prisma.$disconnect());
