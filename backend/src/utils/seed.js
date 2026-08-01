const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Roles
  const roles = await Promise.all([
    prisma.roles.upsert({ where: { role_name: 'Admin' }, update: {}, create: { role_name: 'Admin' } }),
    prisma.roles.upsert({ where: { role_name: 'Family' }, update: {}, create: { role_name: 'Family' } }),
    prisma.roles.upsert({ where: { role_name: 'Volunteer' }, update: {}, create: { role_name: 'Volunteer' } }),
  ]);
  const [adminRole, familyRole, volunteerRole] = roles;
  console.log('✅ Roles created');

  // Postal Codes
  const postalCodes = [
    { pincode: '110001', city: 'New Delhi', state: 'Delhi' },
    { pincode: '400001', city: 'Mumbai', state: 'Maharashtra' },
    { pincode: '560001', city: 'Bengaluru', state: 'Karnataka' },
    { pincode: '600001', city: 'Chennai', state: 'Tamil Nadu' },
    { pincode: '700001', city: 'Kolkata', state: 'West Bengal' },
  ];
  for (const pc of postalCodes) {
    await prisma.postal_Codes.upsert({ where: { pincode: pc.pincode }, update: {}, create: pc });
  }
  console.log('✅ Postal codes created');

  // Locations
  const locs = await Promise.all([
    prisma.locations.create({ data: { address_line: '12, Gandhi Nagar, Sector 4', pincode: '110001' } }),
    prisma.locations.create({ data: { address_line: '45, MG Road', pincode: '400001' } }),
    prisma.locations.create({ data: { address_line: '78, Indiranagar, 100 Feet Road', pincode: '560001' } }),
    prisma.locations.create({ data: { address_line: '22, Anna Salai', pincode: '600001' } }),
    prisma.locations.create({ data: { address_line: '9, Park Street', pincode: '700001' } }),
    prisma.locations.create({ data: { address_line: '34, Lajpat Nagar', pincode: '110001' } }),
    prisma.locations.create({ data: { address_line: '56, Bandra West', pincode: '400001' } }),
    prisma.locations.create({ data: { address_line: '12, Whitefield Main Road', pincode: '560001' } }),
  ]);
  console.log('✅ Locations created');

  // Hash for "Password@123"
  const hash = await bcrypt.hash('Password@123', 10);

  // Users
  const users = await Promise.all([
    prisma.users.create({ data: { full_name: 'Arjun Sharma', email: 'admin@carecircle.com', phone: '9999000001', password_hash: hash, status: 'Active' } }),
    prisma.users.create({ data: { full_name: 'Priya Mehta', email: 'priya.mehta@email.com', phone: '9999000002', password_hash: hash, status: 'Active' } }),
    prisma.users.create({ data: { full_name: 'Rahul Gupta', email: 'rahul.gupta@email.com', phone: '9999000003', password_hash: hash, status: 'Active' } }),
    prisma.users.create({ data: { full_name: 'Sneha Patel', email: 'sneha.patel@email.com', phone: '9999000004', password_hash: hash, status: 'Active' } }),
    prisma.users.create({ data: { full_name: 'Vikram Singh', email: 'vikram.singh@email.com', phone: '9999000005', password_hash: hash, status: 'Active' } }),
    prisma.users.create({ data: { full_name: 'Ananya Roy', email: 'ananya.roy@email.com', phone: '9999000006', password_hash: hash, status: 'Active' } }),
    prisma.users.create({ data: { full_name: 'Deepak Kumar', email: 'deepak.kumar@email.com', phone: '9999000007', password_hash: hash, status: 'Active' } }),
    prisma.users.create({ data: { full_name: 'Kavita Nair', email: 'kavita.nair@email.com', phone: '9999000008', password_hash: hash, status: 'Active' } }),
  ]);
  const [admin, priya, rahul, sneha, vikram, ananya, deepak, kavita] = users;
  console.log('✅ Users created');

  // User Roles
  await Promise.all([
    prisma.user_Roles.create({ data: { user_id: admin.user_id, role_id: adminRole.role_id } }),
    prisma.user_Roles.create({ data: { user_id: priya.user_id, role_id: familyRole.role_id } }),
    prisma.user_Roles.create({ data: { user_id: rahul.user_id, role_id: familyRole.role_id } }),
    prisma.user_Roles.create({ data: { user_id: sneha.user_id, role_id: familyRole.role_id } }),
    prisma.user_Roles.create({ data: { user_id: vikram.user_id, role_id: volunteerRole.role_id } }),
    prisma.user_Roles.create({ data: { user_id: ananya.user_id, role_id: volunteerRole.role_id } }),
    prisma.user_Roles.create({ data: { user_id: deepak.user_id, role_id: volunteerRole.role_id } }),
    prisma.user_Roles.create({ data: { user_id: kavita.user_id, role_id: volunteerRole.role_id } }),
  ]);
  console.log('✅ User roles assigned');

  // Task Categories
  const catNames = ['Grocery Shopping', 'Doctor Appointment', 'Companionship', 'Medication Pickup', 'Home Maintenance', 'Transportation'];
  const cats = await Promise.all(catNames.map(n => prisma.task_Categories.upsert({ where: { category_name: n }, update: {}, create: { category_name: n } })));
  console.log('✅ Task categories created');

  // Elderly Profiles
  const elderly = await Promise.all([
    prisma.elderly_Profiles.create({ data: { name: 'Ramesh Sharma', date_of_birth: new Date('1945-03-15'), gender: 'Male', living_type: 'Home', location_id: locs[0].location_id } }),
    prisma.elderly_Profiles.create({ data: { name: 'Kamala Devi', date_of_birth: new Date('1940-07-22'), gender: 'Female', living_type: 'Care_Home', location_id: locs[1].location_id } }),
    prisma.elderly_Profiles.create({ data: { name: 'Mohan Lal', date_of_birth: new Date('1938-11-05'), gender: 'Male', living_type: 'Home', location_id: locs[2].location_id } }),
    prisma.elderly_Profiles.create({ data: { name: 'Susheela Rani', date_of_birth: new Date('1942-01-30'), gender: 'Female', living_type: 'Care_Home', location_id: locs[3].location_id } }),
    prisma.elderly_Profiles.create({ data: { name: 'Baldev Raj', date_of_birth: new Date('1936-09-18'), gender: 'Male', living_type: 'Home', location_id: locs[4].location_id } }),
  ]);
  const [e1, e2, e3, e4, e5] = elderly;
  console.log('✅ Elderly profiles created');

  // Medical Notes
  await Promise.all([
    prisma.elderly_Medical_Notes.create({ data: { elderly_id: e1.elderly_id, condition_note: 'Diagnosed with Type 2 Diabetes. Requires daily insulin monitoring.' } }),
    prisma.elderly_Medical_Notes.create({ data: { elderly_id: e1.elderly_id, condition_note: 'Mild hypertension. On medication - Amlodipine 5mg daily.' } }),
    prisma.elderly_Medical_Notes.create({ data: { elderly_id: e2.elderly_id, condition_note: 'Arthritis in both knees. Mobility assistance required.' } }),
    prisma.elderly_Medical_Notes.create({ data: { elderly_id: e2.elderly_id, condition_note: 'Cataracts in left eye. Scheduled for surgery next month.' } }),
    prisma.elderly_Medical_Notes.create({ data: { elderly_id: e3.elderly_id, condition_note: 'History of cardiac issues. Pacemaker implanted in 2019.' } }),
    prisma.elderly_Medical_Notes.create({ data: { elderly_id: e3.elderly_id, condition_note: 'Mild dementia. Requires supervision for daily activities.' } }),
    prisma.elderly_Medical_Notes.create({ data: { elderly_id: e4.elderly_id, condition_note: 'Osteoporosis. High fall risk. Requires walker support.' } }),
    prisma.elderly_Medical_Notes.create({ data: { elderly_id: e5.elderly_id, condition_note: 'Chronic kidney disease Stage 3. Bi-weekly dialysis required.' } }),
  ]);
  console.log('✅ Medical notes created');

  // Family Elderly Map
  await Promise.all([
    prisma.family_Elderly_Map.create({ data: { family_user_id: priya.user_id, elderly_id: e1.elderly_id, relation_type: 'Daughter' } }),
    prisma.family_Elderly_Map.create({ data: { family_user_id: priya.user_id, elderly_id: e3.elderly_id, relation_type: 'Niece' } }),
    prisma.family_Elderly_Map.create({ data: { family_user_id: rahul.user_id, elderly_id: e2.elderly_id, relation_type: 'Son' } }),
    prisma.family_Elderly_Map.create({ data: { family_user_id: rahul.user_id, elderly_id: e4.elderly_id, relation_type: 'Nephew' } }),
    prisma.family_Elderly_Map.create({ data: { family_user_id: sneha.user_id, elderly_id: e1.elderly_id, relation_type: 'Granddaughter' } }), // shared
    prisma.family_Elderly_Map.create({ data: { family_user_id: sneha.user_id, elderly_id: e5.elderly_id, relation_type: 'Daughter' } }),
  ]);
  console.log('✅ Family elderly mappings created');

  // Emergency Contacts
  await Promise.all([
    prisma.emergency_Contacts.create({ data: { elderly_id: e1.elderly_id, contact_name: 'Priya Mehta', contact_phone: '9999000002', relation: 'Daughter' } }),
    prisma.emergency_Contacts.create({ data: { elderly_id: e2.elderly_id, contact_name: 'Rahul Gupta', contact_phone: '9999000003', relation: 'Son' } }),
    prisma.emergency_Contacts.create({ data: { elderly_id: e3.elderly_id, contact_name: 'Arjun Sharma', contact_phone: '9998765432', relation: 'Nephew' } }),
    prisma.emergency_Contacts.create({ data: { elderly_id: e4.elderly_id, contact_name: 'Sneha Patel', contact_phone: '9999000004', relation: 'Niece' } }),
    prisma.emergency_Contacts.create({ data: { elderly_id: e5.elderly_id, contact_name: 'Kavita Nair', contact_phone: '9999000008', relation: 'Daughter' } }),
    prisma.emergency_Contacts.create({ data: { elderly_id: e5.elderly_id, contact_name: 'Local Hospital', contact_phone: '1800123456', relation: 'Medical Emergency' } }),
  ]);
  console.log('✅ Emergency contacts created');

  // Elderly Homes
  const homes = await Promise.all([
    prisma.elderly_Homes.create({ data: { home_name: 'Sunrise Senior Care', registration_number: 'REG-MH-2020-001', capacity: 50, phone: '9800000001', email: 'sunrise@care.com', location_id: locs[1].location_id, status: 'Active' } }),
    prisma.elderly_Homes.create({ data: { home_name: 'Golden Years Home', registration_number: 'REG-KA-2019-045', capacity: 30, phone: '9800000002', email: 'goldenyears@care.com', location_id: locs[2].location_id, status: 'Active' } }),
    prisma.elderly_Homes.create({ data: { home_name: 'Serenity Elder Home', registration_number: 'REG-TN-2021-012', capacity: 40, phone: '9800000003', email: 'serenity@care.com', location_id: locs[3].location_id, status: 'Inactive' } }),
  ]);
  const [h1, h2, h3] = homes;
  console.log('✅ Elderly homes created');

  // Home Networks
  const nets = await Promise.all([
    prisma.home_Networks.create({ data: { network_name: 'South India Elder Care Network', description: 'Network of elder care homes across South India.', location_id: locs[2].location_id } }),
    prisma.home_Networks.create({ data: { network_name: 'Western India Senior Alliance', description: 'Alliance of premium senior living facilities in Maharashtra and Gujarat.', location_id: locs[1].location_id } }),
  ]);
  const [net1, net2] = nets;
  console.log('✅ Home networks created');

  // Home Network Map
  await Promise.all([
    prisma.home_Network_Map.create({ data: { home_id: h1.home_id, network_id: net2.network_id } }),
    prisma.home_Network_Map.create({ data: { home_id: h2.home_id, network_id: net1.network_id } }),
    prisma.home_Network_Map.create({ data: { home_id: h3.home_id, network_id: net1.network_id } }),
  ]);
  console.log('✅ Home network mappings created');

  // Elderly Home Residents
  await Promise.all([
    prisma.elderly_Home_Residents.create({ data: { elderly_id: e2.elderly_id, home_id: h1.home_id, room_number: 'A-101', admission_date: new Date('2023-06-01') } }),
    prisma.elderly_Home_Residents.create({ data: { elderly_id: e4.elderly_id, home_id: h3.home_id, room_number: 'B-205', admission_date: new Date('2022-09-15'), discharge_date: new Date('2023-12-31') } }),
    prisma.elderly_Home_Residents.create({ data: { elderly_id: e2.elderly_id, home_id: h1.home_id, room_number: 'A-102', admission_date: new Date('2024-01-10') } }),
    prisma.elderly_Home_Residents.create({ data: { elderly_id: e4.elderly_id, home_id: h1.home_id, room_number: 'C-301', admission_date: new Date('2024-02-01') } }),
  ]);
  console.log('✅ Residents created');

  // Tasks
  const tasks = await Promise.all([
    prisma.tasks.create({ data: { elderly_id: e1.elderly_id, requested_by: priya.user_id, category_id: cats[0].category_id, description: 'Weekly grocery shopping from nearby market.', task_date: new Date('2024-07-15'), task_time: new Date('1970-01-01T10:00:00'), status: 'Completed' } }),
    prisma.tasks.create({ data: { elderly_id: e2.elderly_id, requested_by: rahul.user_id, category_id: cats[1].category_id, home_id: h1.home_id, description: 'Doctor appointment at City Hospital for monthly checkup.', task_date: new Date('2024-07-20'), task_time: new Date('1970-01-01T09:30:00'), status: 'Assigned' } }),
    prisma.tasks.create({ data: { elderly_id: e3.elderly_id, requested_by: priya.user_id, category_id: cats[2].category_id, description: 'Companionship visit - chess and reading session.', task_date: new Date('2024-07-22'), task_time: new Date('1970-01-01T15:00:00'), status: 'Pending' } }),
    prisma.tasks.create({ data: { elderly_id: e4.elderly_id, requested_by: sneha.user_id, category_id: cats[3].category_id, home_id: h1.home_id, description: 'Collect medicines from pharmacy.', task_date: new Date('2024-07-23'), task_time: new Date('1970-01-01T11:00:00'), status: 'Assigned' } }),
    prisma.tasks.create({ data: { elderly_id: e5.elderly_id, requested_by: sneha.user_id, category_id: cats[5].category_id, description: 'Transportation to dialysis center and back.', task_date: new Date('2024-07-25'), task_time: new Date('1970-01-01T08:00:00'), status: 'Completed' } }),
    prisma.tasks.create({ data: { elderly_id: e1.elderly_id, requested_by: priya.user_id, category_id: cats[4].category_id, description: 'Fix leaking tap in kitchen.', task_date: new Date('2024-07-28'), task_time: new Date('1970-01-01T14:00:00'), status: 'Pending' } }),
    prisma.tasks.create({ data: { elderly_id: e3.elderly_id, requested_by: rahul.user_id, category_id: cats[0].category_id, description: 'Grocery run for the week.', task_date: new Date('2024-07-30'), task_time: new Date('1970-01-01T10:00:00'), status: 'Pending' } }),
    prisma.tasks.create({ data: { elderly_id: e2.elderly_id, requested_by: sneha.user_id, category_id: cats[1].category_id, home_id: h1.home_id, description: 'Specialist consultation with cardiologist.', task_date: new Date('2024-08-02'), task_time: new Date('1970-01-01T11:30:00'), status: 'Pending' } }),
  ]);
  console.log('✅ Tasks created');

  // Task Assignments
  await Promise.all([
    prisma.task_Assignments.create({ data: { task_id: tasks[0].task_id, volunteer_id: vikram.user_id, completion_status: 'Completed', completed_at: new Date('2024-07-15T12:30:00') } }),
    prisma.task_Assignments.create({ data: { task_id: tasks[1].task_id, volunteer_id: ananya.user_id, completion_status: 'In Progress' } }),
    prisma.task_Assignments.create({ data: { task_id: tasks[3].task_id, volunteer_id: deepak.user_id, completion_status: 'Pending' } }),
    prisma.task_Assignments.create({ data: { task_id: tasks[4].task_id, volunteer_id: kavita.user_id, completion_status: 'Completed', completed_at: new Date('2024-07-25T13:00:00') } }),
  ]);
  console.log('✅ Task assignments created');

  // Volunteer Verification
  await Promise.all([
    prisma.volunteer_Verification.create({ data: { volunteer_id: vikram.user_id, id_document_type: 'Aadhaar Card', id_proof_number: 'XXXX-XXXX-1234', background_check_status: 'Approved', verified_by: admin.user_id, verified_at: new Date('2024-06-10T10:00:00') } }),
    prisma.volunteer_Verification.create({ data: { volunteer_id: ananya.user_id, id_document_type: 'PAN Card', id_proof_number: 'ABCDE1234F', background_check_status: 'Approved', verified_by: admin.user_id, verified_at: new Date('2024-06-12T11:00:00') } }),
    prisma.volunteer_Verification.create({ data: { volunteer_id: deepak.user_id, id_document_type: 'Passport', id_proof_number: 'Z1234567', background_check_status: 'Pending' } }),
    prisma.volunteer_Verification.create({ data: { volunteer_id: kavita.user_id, id_document_type: 'Driving License', id_proof_number: 'TN-01-20230012345', background_check_status: 'Pending' } }),
  ]);
  console.log('✅ Volunteer verifications created');

  // Availability Slots
  await Promise.all([
    prisma.availability_Slots.create({ data: { volunteer_id: vikram.user_id, available_date: new Date('2024-07-20'), start_time: new Date('1970-01-01T09:00:00'), end_time: new Date('1970-01-01T13:00:00') } }),
    prisma.availability_Slots.create({ data: { volunteer_id: vikram.user_id, available_date: new Date('2024-07-22'), start_time: new Date('1970-01-01T14:00:00'), end_time: new Date('1970-01-01T18:00:00') } }),
    prisma.availability_Slots.create({ data: { volunteer_id: ananya.user_id, available_date: new Date('2024-07-20'), start_time: new Date('1970-01-01T08:00:00'), end_time: new Date('1970-01-01T12:00:00') } }),
    prisma.availability_Slots.create({ data: { volunteer_id: ananya.user_id, available_date: new Date('2024-07-23'), start_time: new Date('1970-01-01T10:00:00'), end_time: new Date('1970-01-01T15:00:00') } }),
    prisma.availability_Slots.create({ data: { volunteer_id: deepak.user_id, available_date: new Date('2024-07-28'), start_time: new Date('1970-01-01T09:00:00'), end_time: new Date('1970-01-01T17:00:00') } }),
    prisma.availability_Slots.create({ data: { volunteer_id: deepak.user_id, available_date: new Date('2024-07-30'), start_time: new Date('1970-01-01T10:00:00'), end_time: new Date('1970-01-01T14:00:00') } }),
    prisma.availability_Slots.create({ data: { volunteer_id: kavita.user_id, available_date: new Date('2024-07-25'), start_time: new Date('1970-01-01T07:00:00'), end_time: new Date('1970-01-01T14:00:00') } }),
    prisma.availability_Slots.create({ data: { volunteer_id: kavita.user_id, available_date: new Date('2024-08-02'), start_time: new Date('1970-01-01T10:00:00'), end_time: new Date('1970-01-01T16:00:00') } }),
  ]);
  console.log('✅ Availability slots created');

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📧 Login credentials (all use password: Password@123):');
  console.log('  Admin:     admin@carecircle.com');
  console.log('  Family:    priya.mehta@email.com, rahul.gupta@email.com, sneha.patel@email.com');
  console.log('  Volunteer: vikram.singh@email.com, ananya.roy@email.com, deepak.kumar@email.com, kavita.nair@email.com');
}

main()
  .catch(e => { console.error('❌ Seed failed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
