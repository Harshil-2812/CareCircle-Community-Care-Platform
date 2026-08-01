
SELECT 
    u.full_name AS family_member_name,
    ep.name AS elderly_name, 
    ep.date_of_birth, 
    fem.relation_type,
    loc.city
FROM Users u
INNER JOIN Family_Elderly_Map fem ON u.user_id = fem.family_user_id
INNER JOIN Elderly_Profiles ep ON fem.elderly_id = ep.elderly_id
LEFT JOIN Locations loc ON ep.location_id = loc.location_id
WHERE u.email = 'priya.mehta@email.com';

-- View 1.2: Volunteer Task Assignment Details
-- Purpose: View the exact task details, category, and the assigned volunteer
SELECT 
    vol.full_name AS volunteer_name,
    t.task_date,
    t.description,
    tc.category_name,
    ep.name AS elderly_recipient,
    ta.completion_status
FROM Task_Assignments ta
JOIN Users vol ON ta.volunteer_id = vol.user_id
JOIN Tasks t ON ta.task_id = t.task_id
JOIN Task_Categories tc ON t.category_id = tc.category_id
JOIN Elderly_Profiles ep ON t.elderly_id = ep.elderly_id
WHERE ta.completion_status = 'Pending';

-- View 1.3: Network to Resident Mapping
-- Purpose: See all residents within a specific Home Network (e.g., "Silver Age Network")
SELECT 
    hn.network_name,
    eh.home_name,
    ep.name AS resident_name,
    ehr.admission_date
FROM Home_Networks hn
JOIN Home_Network_Map hnm ON hn.network_id = hnm.network_id
JOIN Elderly_Homes eh ON hnm.home_id = eh.home_id
JOIN Elderly_Home_Residents ehr ON eh.home_id = ehr.home_id
JOIN Elderly_Profiles ep ON ehr.elderly_id = ep.elderly_id
WHERE ehr.discharge_date IS NULL;


-- ---------------------------------------------------------------------
-- 2. AGGREGATIONS & GROUP BY
-- ---------------------------------------------------------------------

-- View 2.1: Care Home Occupancy Report
-- Purpose: Count active residents currently living in each Care Home
SELECT 
    h.home_name, 
    COUNT(r.resident_id) AS current_residents,
    h.capacity,
    (h.capacity - COUNT(r.resident_id)) AS available_beds
FROM Elderly_Homes h
LEFT JOIN Elderly_Home_Residents r ON h.home_id = r.home_id AND r.discharge_date IS NULL
GROUP BY h.home_id, h.home_name, h.capacity
HAVING current_residents > 0
ORDER BY available_beds ASC;

-- View 2.2: Top Volunteer Leaderboard
-- Purpose: Find volunteers who have successfully completed the most tasks
SELECT 
    u.full_name AS volunteer_name,
    COUNT(ta.assignment_id) AS completed_tasks
FROM Users u
JOIN Task_Assignments ta ON u.user_id = ta.volunteer_id
WHERE ta.completion_status = 'Completed'
GROUP BY u.user_id, u.full_name
ORDER BY completed_tasks DESC
LIMIT 10;


-- ---------------------------------------------------------------------
-- 3. SELF JOINS & SUBQUERIES
-- ---------------------------------------------------------------------

-- View 3.1: Admin Verification Log
-- Purpose: See which admin verified which volunteer (Self-join on Users table)
SELECT 
    vol.full_name AS volunteer_target,
    v.id_document_type,
    v.background_check_status,
    admin.full_name AS verified_by_admin,
    v.verified_at
FROM Volunteer_Verification v
JOIN Users vol ON v.volunteer_id = vol.user_id
INNER JOIN Users admin ON v.verified_by = admin.user_id
WHERE v.background_check_status = 'Approved';

-- View 3.2: Urgent Tasks Pending
-- Purpose: Subquery to find tasks currently unassigned within the next 48 hours
SELECT task_id, description, task_date
FROM Tasks 
WHERE status = 'Pending' 
AND task_date <= DATE_ADD(CURDATE(), INTERVAL 2 DAY)
AND task_id NOT IN (
    SELECT task_id FROM Task_Assignments
);


-- ---------------------------------------------------------------------
-- 4. INSERT, UPDATE, DELETE (DML)
-- ---------------------------------------------------------------------

-- Note: Use transactions for data integrity when not using Prisma.

-- Complete a task and timestamp it
UPDATE Task_Assignments
SET completion_status = 'Completed', completed_at = NOW()
WHERE assignment_id = 12 AND completion_status = 'Pending';

-- Update the parent Tasks status
UPDATE Tasks
SET status = 'Completed'
WHERE task_id = (SELECT task_id FROM Task_Assignments WHERE assignment_id = 12);

-- Discharge an elderly resident from a care home
UPDATE Elderly_Home_Residents
SET discharge_date = CURDATE()
WHERE elderly_id = 4 AND home_id = 1 AND discharge_date IS NULL;

-- Log a new medical note
INSERT INTO Elderly_Medical_Notes (elderly_id, condition_note, noted_at)
VALUES (1, 'Patient complained of mild arthritis pain in the morning. Paracetamol administered.', NOW());
