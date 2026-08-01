const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

// Helper: convert "10:00 AM" / "02:00 PM" → Date object at 1970-01-01
function parseTime(str) {
  if (!str) return null;
  const [time, meridiem] = str.trim().split(' ');
  let [hours, minutes] = time.split(':').map(Number);
  if (meridiem === 'PM' && hours !== 12) hours += 12;
  if (meridiem === 'AM' && hours === 12) hours = 0;
  return new Date(`1970-01-01T${String(hours).padStart(2,'0')}:${String(minutes).padStart(2,'0')}:00`);
}

async function main() {
  console.log('🧹 Clearing existing data...');

  // Delete in reverse dependency order to respect FK constraints
  await prisma.availability_Slots.deleteMany();
  await prisma.volunteer_Verification.deleteMany();
  await prisma.task_Assignments.deleteMany();
  await prisma.tasks.deleteMany();
  await prisma.home_Network_Map.deleteMany();
  await prisma.home_Networks.deleteMany();
  await prisma.elderly_Home_Residents.deleteMany();
  await prisma.elderly_Homes.deleteMany();
  await prisma.emergency_Contacts.deleteMany();
  await prisma.family_Elderly_Map.deleteMany();
  await prisma.elderly_Medical_Notes.deleteMany();
  await prisma.elderly_Profiles.deleteMany();
  await prisma.task_Categories.deleteMany();
  await prisma.locations.deleteMany();
  await prisma.postal_Codes.deleteMany();
  await prisma.user_Roles.deleteMany();
  await prisma.users.deleteMany();
  await prisma.roles.deleteMany();
  console.log('✅ Cleared\n');

  // ─────────────────────────────────────────────────────────
  // 1. ROLES  (map to app-recognised: Admin, Volunteer, Family)
  // ─────────────────────────────────────────────────────────
  const adminRole     = await prisma.roles.create({ data: { role_name: 'Admin' } });
  const volunteerRole = await prisma.roles.create({ data: { role_name: 'Volunteer' } });
  const familyRole    = await prisma.roles.create({ data: { role_name: 'Family' } });
  console.log('✅ Roles: Admin, Volunteer, Family');

  // ─────────────────────────────────────────────────────────
  // 2. USERS  (passwords → bcrypt of "Password@123")
  // ─────────────────────────────────────────────────────────
  const hash = await bcrypt.hash('Password@123', 10);
  const [u1, u2, u3, u4, u5] = await Promise.all([
    prisma.users.create({ data: { full_name: 'Admin One',      email: 'arjun@email.com',  phone: '9876543210', password_hash: hash, status: 'Active'   } }),
    prisma.users.create({ data: { full_name: 'Volunteer One',  email: 'priya@email.com',  phone: '9876543211', password_hash: hash, status: 'Active'   } }),
    prisma.users.create({ data: { full_name: 'User Two',       email: 'ravi@email.com',   phone: '9876543212', password_hash: hash, status: 'Active'   } }),
    prisma.users.create({ data: { full_name: 'User Three',     email: 'anita@email.com',  phone: '9876543213', password_hash: hash, status: 'Active'   } }),
    prisma.users.create({ data: { full_name: 'Donald Trump',   email: 'vikram@email.com', phone: '9876543214', password_hash: hash, status: 'Active' } }),
  ]);
  console.log('✅ Users created');

  // ─────────────────────────────────────────────────────────
  // 3. USER ROLES
  //   u1 → Admin | u2 → Volunteer | u3 → Family
  //   u4 → Family (was "Home Manager") | u5 → Volunteer
  // ─────────────────────────────────────────────────────────
  await Promise.all([
    prisma.user_Roles.create({ data: { user_id: u1.user_id, role_id: adminRole.role_id } }),
    prisma.user_Roles.create({ data: { user_id: u2.user_id, role_id: volunteerRole.role_id } }),
    prisma.user_Roles.create({ data: { user_id: u3.user_id, role_id: familyRole.role_id } }),
    prisma.user_Roles.create({ data: { user_id: u4.user_id, role_id: familyRole.role_id } }),
    prisma.user_Roles.create({ data: { user_id: u5.user_id, role_id: volunteerRole.role_id } }),
  ]);
  console.log('✅ User roles assigned');

  // ─────────────────────────────────────────────────────────
  // 4. POSTAL CODES
  // ─────────────────────────────────────────────────────────
  await Promise.all([
    prisma.postal_Codes.create({ data: { pincode: '600127', city: 'Chennai',   state: 'Tamil Nadu'  } }),
    prisma.postal_Codes.create({ data: { pincode: '560001', city: 'Bangalore', state: 'Karnataka'   } }),
    prisma.postal_Codes.create({ data: { pincode: '400001', city: 'Mumbai',    state: 'Maharashtra' } }),
    prisma.postal_Codes.create({ data: { pincode: '110001', city: 'New Delhi', state: 'Delhi'       } }),
    prisma.postal_Codes.create({ data: { pincode: '500001', city: 'Hyderabad', state: 'Telangana'   } }),
  ]);
  console.log('✅ Postal codes created');

  // ─────────────────────────────────────────────────────────
  // 5. LOCATIONS
  // ─────────────────────────────────────────────────────────
  const [l1, l2, l3, l4, l5] = await Promise.all([
    prisma.locations.create({ data: { address_line: '12 Vandalur-Kelambakkam Road', pincode: '600127' } }),
    prisma.locations.create({ data: { address_line: '45 MG Road',                  pincode: '560001' } }),
    prisma.locations.create({ data: { address_line: '78 Marine Drive',             pincode: '400001' } }),
    prisma.locations.create({ data: { address_line: '10 Connaught Place',          pincode: '110001' } }),
    prisma.locations.create({ data: { address_line: '22 Jubilee Hills',            pincode: '500001' } }),
  ]);
  console.log('✅ Locations created');

  // ─────────────────────────────────────────────────────────
  // 6. TASK CATEGORIES
  // ─────────────────────────────────────────────────────────
  const [cat1, cat2, cat3, cat4, cat5] = await Promise.all([
    prisma.task_Categories.create({ data: { category_name: 'Medical Transport'  } }),
    prisma.task_Categories.create({ data: { category_name: 'Grocery Delivery'   } }),
    prisma.task_Categories.create({ data: { category_name: 'Companionship'      } }),
    prisma.task_Categories.create({ data: { category_name: 'Tech Support'       } }),
    prisma.task_Categories.create({ data: { category_name: 'Home Maintenance'   } }),
  ]);
  console.log('✅ Task categories created');

  // ─────────────────────────────────────────────────────────
  // 7. ELDERLY PROFILES
  // ─────────────────────────────────────────────────────────
  const [e1, e2, e3, e4, e5] = await Promise.all([
    prisma.elderly_Profiles.create({ data: { name: 'Patient One',   date_of_birth: new Date('1950-05-15'), gender: 'Male',   living_type: 'Home',      location_id: l1.location_id } }),
    prisma.elderly_Profiles.create({ data: { name: 'Patient Two',   date_of_birth: new Date('1945-10-20'), gender: 'Female', living_type: 'Care_Home', location_id: l2.location_id } }),
    prisma.elderly_Profiles.create({ data: { name: 'Patient Three', date_of_birth: new Date('1955-03-10'), gender: 'Male',   living_type: 'Home',      location_id: l3.location_id } }),
    prisma.elderly_Profiles.create({ data: { name: 'Patient Four',  date_of_birth: new Date('1948-12-05'), gender: 'Female', living_type: 'Care_Home', location_id: l4.location_id } }),
    prisma.elderly_Profiles.create({ data: { name: 'Patient Five',  date_of_birth: new Date('1952-07-22'), gender: 'Male',   living_type: 'Home',      location_id: l5.location_id } }),
  ]);
  console.log('✅ Elderly profiles created');

  // ─────────────────────────────────────────────────────────
  // 8. ELDERLY MEDICAL NOTES
  // ─────────────────────────────────────────────────────────
  await Promise.all([
    prisma.elderly_Medical_Notes.create({ data: { elderly_id: e1.elderly_id, condition_note: 'Mild hypertension, requires regular monitoring.' } }),
    prisma.elderly_Medical_Notes.create({ data: { elderly_id: e2.elderly_id, condition_note: 'Diabetic type 2, insulin dependent.' } }),
    prisma.elderly_Medical_Notes.create({ data: { elderly_id: e3.elderly_id, condition_note: 'Arthritis in both knees.' } }),
    prisma.elderly_Medical_Notes.create({ data: { elderly_id: e4.elderly_id, condition_note: 'History of mild asthma.' } }),
    prisma.elderly_Medical_Notes.create({ data: { elderly_id: e5.elderly_id, condition_note: 'No major issues, routine vitamins prescribed.' } }),
  ]);
  console.log('✅ Medical notes created');

  // ─────────────────────────────────────────────────────────
  // 9. FAMILY ELDERLY MAP
  //   (map_id, family_user_id, elderly_id) from original data:
  //   1→u3+e1, 2→u3+e2, 3→u4+e4, 4→u4+e3, 5→u1+e5
  // ─────────────────────────────────────────────────────────
  await Promise.all([
    prisma.family_Elderly_Map.create({ data: { family_user_id: u3.user_id, elderly_id: e1.elderly_id, relation_type: 'Family Member' } }),
    prisma.family_Elderly_Map.create({ data: { family_user_id: u3.user_id, elderly_id: e2.elderly_id, relation_type: 'Family Member' } }),
    prisma.family_Elderly_Map.create({ data: { family_user_id: u4.user_id, elderly_id: e4.elderly_id, relation_type: 'Family Member' } }),
    prisma.family_Elderly_Map.create({ data: { family_user_id: u4.user_id, elderly_id: e3.elderly_id, relation_type: 'Family Member' } }),
    prisma.family_Elderly_Map.create({ data: { family_user_id: u1.user_id, elderly_id: e5.elderly_id, relation_type: 'Guardian'      } }),
  ]);
  console.log('✅ Family-elderly mappings created');

  // ─────────────────────────────────────────────────────────
  // 10. EMERGENCY CONTACTS
  // ─────────────────────────────────────────────────────────
  await Promise.all([
    prisma.emergency_Contacts.create({ data: { elderly_id: e1.elderly_id, contact_name: 'Contact One',   contact_phone: '9123456780', relation: 'Neighbor'      } }),
    prisma.emergency_Contacts.create({ data: { elderly_id: e2.elderly_id, contact_name: 'Dr. Smith',     contact_phone: '9123456781', relation: 'Primary Doctor'} }),
    prisma.emergency_Contacts.create({ data: { elderly_id: e3.elderly_id, contact_name: 'Contact Two',   contact_phone: '9123456782', relation: 'Brother'       } }),
    prisma.emergency_Contacts.create({ data: { elderly_id: e4.elderly_id, contact_name: 'Contact Three', contact_phone: '9123456783', relation: 'Sister'        } }),
    prisma.emergency_Contacts.create({ data: { elderly_id: e5.elderly_id, contact_name: 'Contact Four',  contact_phone: '9123456784', relation: 'Son'           } }),
  ]);
  console.log('✅ Emergency contacts created');

  // ─────────────────────────────────────────────────────────
  // 11. ELDERLY HOMES
  // ─────────────────────────────────────────────────────────
  const [h1, h2, h3, h4, h5] = await Promise.all([
    prisma.elderly_Homes.create({ data: { home_name: 'Care Home Alpha',   registration_number: 'REG101', capacity: 50,  phone: '8888888881', email: 'alpha@care.com',   location_id: l1.location_id, status: 'Active'   } }),
    prisma.elderly_Homes.create({ data: { home_name: 'Care Home Beta',    registration_number: 'REG102', capacity: 100, phone: '8888888882', email: 'beta@care.com',    location_id: l2.location_id, status: 'Active'   } }),
    prisma.elderly_Homes.create({ data: { home_name: 'Care Home Gamma',   registration_number: 'REG103', capacity: 75,  phone: '8888888883', email: 'gamma@care.com',   location_id: l3.location_id, status: 'Active'   } }),
    prisma.elderly_Homes.create({ data: { home_name: 'Care Home Delta',   registration_number: 'REG104', capacity: 60,  phone: '8888888884', email: 'delta@care.com',   location_id: l4.location_id, status: 'Active'   } }),
    prisma.elderly_Homes.create({ data: { home_name: 'Care Home Epsilon', registration_number: 'REG105', capacity: 80,  phone: '8888888885', email: 'epsilon@care.com', location_id: l5.location_id, status: 'Inactive' } }),
  ]);
  console.log('✅ Elderly homes created');

  // ─────────────────────────────────────────────────────────
  // 12. HOME NETWORKS
  // ─────────────────────────────────────────────────────────
  const [n1, n2, n3, n4, n5] = await Promise.all([
    prisma.home_Networks.create({ data: { network_name: 'Network Alpha',   description: 'Primary care home network.',         location_id: l1.location_id } }),
    prisma.home_Networks.create({ data: { network_name: 'Network Beta',    description: 'Secondary care home network.',       location_id: l2.location_id } }),
    prisma.home_Networks.create({ data: { network_name: 'Network Gamma',   description: 'Metropolitan support network.',      location_id: l3.location_id } }),
    prisma.home_Networks.create({ data: { network_name: 'Network Delta',   description: 'Premium assisted living network.',   location_id: l4.location_id } }),
    prisma.home_Networks.create({ data: { network_name: 'Network Epsilon', description: 'Community-driven care network.',     location_id: l5.location_id } }),
  ]);
  console.log('✅ Home networks created');

  // ─────────────────────────────────────────────────────────
  // 13. HOME NETWORK MAP
  // ─────────────────────────────────────────────────────────
  await Promise.all([
    prisma.home_Network_Map.create({ data: { home_id: h1.home_id, network_id: n1.network_id } }),
    prisma.home_Network_Map.create({ data: { home_id: h2.home_id, network_id: n2.network_id } }),
    prisma.home_Network_Map.create({ data: { home_id: h3.home_id, network_id: n3.network_id } }),
    prisma.home_Network_Map.create({ data: { home_id: h4.home_id, network_id: n4.network_id } }),
    prisma.home_Network_Map.create({ data: { home_id: h5.home_id, network_id: n5.network_id } }),
  ]);
  console.log('✅ Home network mappings created');

  // ─────────────────────────────────────────────────────────
  // 14. ELDERLY HOME RESIDENTS
  //   Original: (resident_id, elderly_id, home_id, room_number, admission_date, discharge_date)
  // ─────────────────────────────────────────────────────────
  await Promise.all([
    prisma.elderly_Home_Residents.create({ data: { elderly_id: e2.elderly_id, home_id: h1.home_id, room_number: 'A101', admission_date: new Date('2025-01-15'), discharge_date: null } }),
    prisma.elderly_Home_Residents.create({ data: { elderly_id: e4.elderly_id, home_id: h2.home_id, room_number: 'B205', admission_date: new Date('2024-11-10'), discharge_date: null } }),
    prisma.elderly_Home_Residents.create({ data: { elderly_id: e1.elderly_id, home_id: h3.home_id, room_number: 'C302', admission_date: new Date('2023-05-20'), discharge_date: new Date('2023-12-01') } }),
    prisma.elderly_Home_Residents.create({ data: { elderly_id: e3.elderly_id, home_id: h4.home_id, room_number: 'D404', admission_date: new Date('2025-02-01'), discharge_date: null } }),
    prisma.elderly_Home_Residents.create({ data: { elderly_id: e5.elderly_id, home_id: h5.home_id, room_number: 'E501', admission_date: new Date('2022-08-14'), discharge_date: new Date('2024-01-15') } }),
  ]);
  console.log('✅ Elderly home residents created');

  // ─────────────────────────────────────────────────────────
  // 15. TASKS
  //   Original columns: (task_id, elderly_id, requested_by, category_id, home_id, description, task_date, task_time, status)
  // ─────────────────────────────────────────────────────────
  const [t1, t2, t3, t4, t5] = await Promise.all([
    prisma.tasks.create({ data: { elderly_id: e1.elderly_id, requested_by: u3.user_id, category_id: cat1.category_id, home_id: h1.home_id, description: 'Drive to Hospital',      task_date: new Date('2026-04-15'), task_time: parseTime('10:00 AM'), status: 'Assigned'  } }),
    prisma.tasks.create({ data: { elderly_id: e2.elderly_id, requested_by: u4.user_id, category_id: cat2.category_id, home_id: h2.home_id, description: 'Groceries',              task_date: new Date('2026-04-16'), task_time: parseTime('02:00 PM'), status: 'Pending'   } }),
    prisma.tasks.create({ data: { elderly_id: e3.elderly_id, requested_by: u1.user_id, category_id: cat3.category_id, home_id: h3.home_id, description: 'Companionship reading', task_date: new Date('2026-04-17'), task_time: parseTime('04:00 PM'), status: 'Assigned'  } }),
    prisma.tasks.create({ data: { elderly_id: e4.elderly_id, requested_by: u3.user_id, category_id: cat4.category_id, home_id: null,        description: 'Smartphone setup',      task_date: new Date('2026-04-14'), task_time: parseTime('11:00 AM'), status: 'Completed' } }),
    prisma.tasks.create({ data: { elderly_id: e5.elderly_id, requested_by: u4.user_id, category_id: cat5.category_id, home_id: null,        description: 'Fix sink',              task_date: new Date('2026-04-18'), task_time: parseTime('09:00 AM'), status: 'Pending'   } }),
  ]);
  console.log('✅ Tasks created');

  // ─────────────────────────────────────────────────────────
  // 16. TASK ASSIGNMENTS
  //   Original: (assignment_id, task_id, volunteer_id, assigned_at, completion_status)
  //   Status mapping: 'In Progress'→'In Progress', 'Scheduled'→'Pending', 'Finished'→'Completed', 'Assigned'→'In Progress'
  // ─────────────────────────────────────────────────────────
  await Promise.all([
    prisma.task_Assignments.create({ data: { task_id: t1.task_id, volunteer_id: u2.user_id, completion_status: 'In Progress' } }),
    prisma.task_Assignments.create({ data: { task_id: t2.task_id, volunteer_id: u5.user_id, completion_status: 'Pending'     } }),
    prisma.task_Assignments.create({ data: { task_id: t3.task_id, volunteer_id: u2.user_id, completion_status: 'In Progress' } }),
    prisma.task_Assignments.create({ data: { task_id: t4.task_id, volunteer_id: u2.user_id, completion_status: 'Completed',  completed_at: new Date('2026-04-13') } }),
    prisma.task_Assignments.create({ data: { task_id: t5.task_id, volunteer_id: u5.user_id, completion_status: 'Pending'     } }),
  ]);
  console.log('✅ Task assignments created');

  // ─────────────────────────────────────────────────────────
  // 17. VOLUNTEER VERIFICATION
  //   Original: (verif_id, volunteer_id, id_document_type, id_proof_number, background_check_status, verified_by, verified_at)
  // ─────────────────────────────────────────────────────────
  await Promise.all([
    prisma.volunteer_Verification.create({ data: { volunteer_id: u2.user_id, id_document_type: 'Aadhaar Card',    id_proof_number: '123456789012', background_check_status: 'Approved', verified_by: u1.user_id, verified_at: new Date() } }),
    prisma.volunteer_Verification.create({ data: { volunteer_id: u5.user_id, id_document_type: 'PAN Card',        id_proof_number: 'ABCDE1234F',   background_check_status: 'Pending'  } }),
    prisma.volunteer_Verification.create({ data: { volunteer_id: u2.user_id, id_document_type: 'Driving License', id_proof_number: 'DL123456',     background_check_status: 'Approved', verified_by: u1.user_id, verified_at: new Date() } }),
    prisma.volunteer_Verification.create({ data: { volunteer_id: u5.user_id, id_document_type: 'Aadhaar Card',    id_proof_number: '987654321098', background_check_status: 'Approved', verified_by: u1.user_id, verified_at: new Date() } }),
    prisma.volunteer_Verification.create({ data: { volunteer_id: u2.user_id, id_document_type: 'Passport',        id_proof_number: 'Z1234567',     background_check_status: 'Approved', verified_by: u1.user_id, verified_at: new Date() } }),
  ]);
  console.log('✅ Volunteer verifications created');

  // ─────────────────────────────────────────────────────────
  // 18. AVAILABILITY SLOTS
  //   Original: (slot_id, volunteer_id, available_date, start_time, end_time)
  // ─────────────────────────────────────────────────────────
  await Promise.all([
    prisma.availability_Slots.create({ data: { volunteer_id: u2.user_id, available_date: new Date('2026-04-15'), start_time: parseTime('09:00 AM'), end_time: parseTime('01:00 PM') } }),
    prisma.availability_Slots.create({ data: { volunteer_id: u2.user_id, available_date: new Date('2026-04-16'), start_time: parseTime('02:00 PM'), end_time: parseTime('06:00 PM') } }),
    prisma.availability_Slots.create({ data: { volunteer_id: u5.user_id, available_date: new Date('2026-04-17'), start_time: parseTime('10:00 AM'), end_time: parseTime('12:00 PM') } }),
    prisma.availability_Slots.create({ data: { volunteer_id: u5.user_id, available_date: new Date('2026-04-18'), start_time: parseTime('08:00 AM'), end_time: parseTime('11:00 AM') } }),
    prisma.availability_Slots.create({ data: { volunteer_id: u2.user_id, available_date: new Date('2026-04-19'), start_time: parseTime('03:00 PM'), end_time: parseTime('07:00 PM') } }),
  ]);
  console.log('✅ Availability slots created');

  console.log('\n🎉 All data seeded successfully!\n');
  console.log('📧 Login credentials (all use password: Password@123)');
  console.log('┌──────────────────────────────────────────────┬───────────────┐');
  console.log('│ Email                   │ Role              │');
  console.log('├──────────────────────────────────────────────┼───────────────┤');
  console.log('│ arjun@email.com         │ Admin             │');
  console.log('│ priya@email.com         │ Volunteer         │');
  console.log('│ ravi@email.com          │ Family            │');
  console.log('│ anita@email.com         │ Family            │');
  console.log('│ vikram@email.com        │ Volunteer         │');
  console.log('└──────────────────────────────────────────────┴───────────────┘');
}

main()
  .catch(e => { console.error('❌ Seed failed:', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
