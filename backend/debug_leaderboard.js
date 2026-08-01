const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  // Test the exact leaderboard query
  const r = await p.$queryRawUnsafe(
    "SELECT u.full_name AS volunteer_name, COUNT(ta.assignment_id) AS completed_tasks FROM Users u JOIN Task_Assignments ta ON u.user_id = ta.volunteer_id WHERE ta.completion_status = 'Completed' GROUP BY u.user_id, u.full_name ORDER BY completed_tasks DESC LIMIT 10"
  );
  console.log('Leaderboard results:', JSON.stringify(r, (_, v) => typeof v === 'bigint' ? v.toString() : v, 2));

  // Check all assignments
  const a = await p.task_Assignments.findMany({ include: { Users: { select: { full_name: true } } } });
  console.log('All assignments:', JSON.stringify(a.map(x => ({ vol: x.Users.full_name, status: x.completion_status })), null, 2));
}

main().catch(console.error).finally(() => p.$disconnect());
