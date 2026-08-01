-- CareCircle Seed Data
-- Run after migrations

-- Roles
INSERT INTO Roles (role_name) VALUES ('Admin'), ('Family'), ('Volunteer');

-- Postal Codes
INSERT INTO Postal_Codes (pincode, city, state) VALUES
('110001', 'New Delhi', 'Delhi'),
('400001', 'Mumbai', 'Maharashtra'),
('560001', 'Bengaluru', 'Karnataka'),
('600001', 'Chennai', 'Tamil Nadu'),
('700001', 'Kolkata', 'West Bengal');

-- Locations
INSERT INTO Locations (address_line, pincode) VALUES
('12, Gandhi Nagar, Sector 4', '110001'),
('45, MG Road', '400001'),
('78, Indiranagar, 100 Feet Road', '560001'),
('22, Anna Salai', '600001'),
('9, Park Street', '700001'),
('34, Lajpat Nagar', '110001'),
('56, Bandra West', '400001'),
('12, Whitefield Main Road', '560001');

-- Users (passwords are hashed "Password@123" using bcrypt)
INSERT INTO Users (full_name, email, phone, password_hash, status) VALUES
('Arjun Sharma', 'admin@carecircle.com', '9999000001', '$2b$10$Xq5K8RzVl9mNpL2oQfTu3uWs6yHnKdMpJcRbIxGtEaVlNmZoU7GfC', 'Active'),
('Priya Mehta', 'priya.mehta@email.com', '9999000002', '$2b$10$Xq5K8RzVl9mNpL2oQfTu3uWs6yHnKdMpJcRbIxGtEaVlNmZoU7GfC', 'Active'),
('Rahul Gupta', 'rahul.gupta@email.com', '9999000003', '$2b$10$Xq5K8RzVl9mNpL2oQfTu3uWs6yHnKdMpJcRbIxGtEaVlNmZoU7GfC', 'Active'),
('Sneha Patel', 'sneha.patel@email.com', '9999000004', '$2b$10$Xq5K8RzVl9mNpL2oQfTu3uWs6yHnKdMpJcRbIxGtEaVlNmZoU7GfC', 'Active'),
('Vikram Singh', 'vikram.singh@email.com', '9999000005', '$2b$10$Xq5K8RzVl9mNpL2oQfTu3uWs6yHnKdMpJcRbIxGtEaVlNmZoU7GfC', 'Active'),
('Ananya Roy', 'ananya.roy@email.com', '9999000006', '$2b$10$Xq5K8RzVl9mNpL2oQfTu3uWs6yHnKdMpJcRbIxGtEaVlNmZoU7GfC', 'Active'),
('Deepak Kumar', 'deepak.kumar@email.com', '9999000007', '$2b$10$Xq5K8RzVl9mNpL2oQfTu3uWs6yHnKdMpJcRbIxGtEaVlNmZoU7GfC', 'Active'),
('Kavita Nair', 'kavita.nair@email.com', '9999000008', '$2b$10$Xq5K8RzVl9mNpL2oQfTu3uWs6yHnKdMpJcRbIxGtEaVlNmZoU7GfC', 'Active');

-- User_Roles
INSERT INTO User_Roles (user_id, role_id) VALUES
(1, 1), -- Arjun = Admin
(2, 2), -- Priya = Family
(3, 2), -- Rahul = Family
(4, 2), -- Sneha = Family
(5, 3), -- Vikram = Volunteer
(6, 3), -- Ananya = Volunteer
(7, 3), -- Deepak = Volunteer
(8, 3); -- Kavita = Volunteer

-- Task Categories
INSERT INTO Task_Categories (category_name) VALUES
('Grocery Shopping'),
('Doctor Appointment'),
('Companionship'),
('Medication Pickup'),
('Home Maintenance'),
('Transportation');

-- Elderly Profiles (using date_of_birth, NO age column)
INSERT INTO Elderly_Profiles (name, date_of_birth, gender, living_type, location_id) VALUES
('Ramesh Sharma', '1945-03-15', 'Male', 'Home', 1),
('Kamala Devi', '1940-07-22', 'Female', 'Care_Home', 2),
('Mohan Lal', '1938-11-05', 'Male', 'Home', 3),
('Susheela Rani', '1942-01-30', 'Female', 'Care_Home', 4),
('Baldev Raj', '1936-09-18', 'Male', 'Home', 5);

-- Elderly Medical Notes
INSERT INTO Elderly_Medical_Notes (elderly_id, condition_note) VALUES
(1, 'Diagnosed with Type 2 Diabetes. Requires daily insulin monitoring.'),
(1, 'Mild hypertension. On medication - Amlodipine 5mg daily.'),
(2, 'Arthritis in both knees. Mobility assistance required.'),
(2, 'Cataracts in left eye. Scheduled for surgery next month.'),
(3, 'History of cardiac issues. Pacemaker implanted in 2019.'),
(3, 'Mild dementia. Requires supervision for daily activities.'),
(4, 'Osteoporosis. High fall risk. Requires walker support.'),
(5, 'Chronic kidney disease Stage 3. Bi-weekly dialysis required.');

-- Family Elderly Map (includes shared elderly case)
INSERT INTO Family_Elderly_Map (family_user_id, elderly_id, relation_type) VALUES
(2, 1, 'Daughter'),
(2, 3, 'Niece'),    -- Priya linked to two elderly
(3, 2, 'Son'),
(3, 4, 'Nephew'),   -- Rahul linked to two elderly
(4, 1, 'Granddaughter'), -- Shared: both Priya and Sneha linked to elderly_id=1
(4, 5, 'Daughter');

-- Emergency Contacts
INSERT INTO Emergency_Contacts (elderly_id, contact_name, contact_phone, relation) VALUES
(1, 'Priya Mehta', '9999000002', 'Daughter'),
(2, 'Rahul Gupta', '9999000003', 'Son'),
(3, 'Arjun Sharma', '9998765432', 'Nephew'),
(4, 'Sneha Patel', '9999000004', 'Niece'),
(5, 'Kavita Nair', '9999000008', 'Daughter'),
(5, 'Local Hospital', '1800123456', 'Medical Emergency');

-- Elderly Homes
INSERT INTO Elderly_Homes (home_name, registration_number, capacity, phone, email, location_id, status) VALUES
('Sunrise Senior Care', 'REG-MH-2020-001', 50, '9800000001', 'sunrise@care.com', 2, 'Active'),
('Golden Years Home', 'REG-KA-2019-045', 30, '9800000002', 'goldenyears@care.com', 3, 'Active'),
('Serenity Elder Home', 'REG-TN-2021-012', 40, '9800000003', 'serenity@care.com', 4, 'Inactive');

-- Home Networks
INSERT INTO Home_Networks (network_name, description, location_id) VALUES
('South India Elder Care Network', 'Network of elder care homes across South India providing coordinated services.', 3),
('Western India Senior Alliance', 'Alliance of premium senior living facilities in Maharashtra and Gujarat.', 2);

-- Home Network Map
INSERT INTO Home_Network_Map (home_id, network_id) VALUES
(1, 2), -- Sunrise in Western India Alliance
(2, 1), -- Golden Years in South India Network
(3, 1); -- Serenity in South India Network

-- Elderly Home Residents
INSERT INTO Elderly_Home_Residents (elderly_id, home_id, room_number, admission_date, discharge_date) VALUES
(2, 1, 'A-101', '2023-06-01', NULL),         -- Active resident
(4, 3, 'B-205', '2022-09-15', '2023-12-31'), -- Discharged
(2, 1, 'A-102', '2024-01-10', NULL),         -- Active (room change)
(4, 1, 'C-301', '2024-02-01', NULL);         -- Active resident

-- Tasks
INSERT INTO Tasks (elderly_id, requested_by, category_id, home_id, description, task_date, task_time, status) VALUES
(1, 2, 1, NULL, 'Weekly grocery shopping from nearby market. Includes vegetables, fruits, and medicines.', '2024-07-15', '10:00:00', 'Completed'),
(2, 3, 2, 1, 'Doctor appointment at City Hospital for monthly checkup.', '2024-07-20', '09:30:00', 'Assigned'),
(3, 2, 3, NULL, 'Companionship visit - chess and reading session.', '2024-07-22', '15:00:00', 'Pending'),
(4, 4, 4, 1, 'Collect medicines from pharmacy - prescription attached.', '2024-07-23', '11:00:00', 'Assigned'),
(5, 4, 6, NULL, 'Transportation to dialysis center and back.', '2024-07-25', '08:00:00', 'Completed'),
(1, 2, 5, NULL, 'Fix leaking tap in kitchen. Plumber coordination needed.', '2024-07-28', '14:00:00', 'Pending'),
(3, 3, 1, NULL, 'Grocery run for the week. List provided by family.', '2024-07-30', '10:00:00', 'Pending'),
(2, 4, 2, 1, 'Specialist consultation with cardiologist at Apollo Hospital.', '2024-08-02', '11:30:00', 'Pending');

-- Task Assignments
INSERT INTO Task_Assignments (task_id, volunteer_id, completion_status, completed_at) VALUES
(1, 5, 'Completed', '2024-07-15 12:30:00'),
(2, 6, 'In Progress', NULL),
(4, 7, 'Pending', NULL),
(5, 8, 'Completed', '2024-07-25 13:00:00');

-- Volunteer Verification
INSERT INTO Volunteer_Verification (volunteer_id, id_document_type, id_proof_number, background_check_status, verified_by, verified_at) VALUES
(5, 'Aadhaar Card', 'XXXX-XXXX-1234', 'Approved', 1, '2024-06-10 10:00:00'),
(6, 'PAN Card', 'ABCDE1234F', 'Approved', 1, '2024-06-12 11:00:00'),
(7, 'Passport', 'Z1234567', 'Pending', NULL, NULL),
(8, 'Driving License', 'TN-01-20230012345', 'Pending', NULL, NULL);

-- Availability Slots
INSERT INTO Availability_Slots (volunteer_id, available_date, start_time, end_time) VALUES
(5, '2024-07-20', '09:00:00', '13:00:00'),
(5, '2024-07-22', '14:00:00', '18:00:00'),
(6, '2024-07-20', '08:00:00', '12:00:00'),
(6, '2024-07-23', '10:00:00', '15:00:00'),
(7, '2024-07-28', '09:00:00', '17:00:00'),
(7, '2024-07-30', '10:00:00', '14:00:00'),
(8, '2024-07-25', '07:00:00', '14:00:00'),
(8, '2024-08-02', '10:00:00', '16:00:00');
