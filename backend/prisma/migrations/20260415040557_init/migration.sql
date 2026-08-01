-- CreateTable
CREATE TABLE `Roles` (
    `role_id` INTEGER NOT NULL AUTO_INCREMENT,
    `role_name` VARCHAR(50) NOT NULL,

    UNIQUE INDEX `Roles_role_name_key`(`role_name`),
    PRIMARY KEY (`role_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Users` (
    `user_id` INTEGER NOT NULL AUTO_INCREMENT,
    `full_name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `phone` VARCHAR(15) NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'Active',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Users_email_key`(`email`),
    UNIQUE INDEX `Users_phone_key`(`phone`),
    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User_Roles` (
    `user_role_id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `role_id` INTEGER NOT NULL,

    UNIQUE INDEX `User_Roles_user_id_role_id_key`(`user_id`, `role_id`),
    PRIMARY KEY (`user_role_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Postal_Codes` (
    `pincode` VARCHAR(10) NOT NULL,
    `city` VARCHAR(50) NOT NULL,
    `state` VARCHAR(50) NOT NULL,

    PRIMARY KEY (`pincode`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Locations` (
    `location_id` INTEGER NOT NULL AUTO_INCREMENT,
    `address_line` VARCHAR(255) NULL,
    `pincode` VARCHAR(10) NOT NULL,

    PRIMARY KEY (`location_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Task_Categories` (
    `category_id` INTEGER NOT NULL AUTO_INCREMENT,
    `category_name` VARCHAR(50) NOT NULL,

    UNIQUE INDEX `Task_Categories_category_name_key`(`category_name`),
    PRIMARY KEY (`category_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Elderly_Profiles` (
    `elderly_id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `date_of_birth` DATE NOT NULL,
    `gender` VARCHAR(10) NULL,
    `living_type` VARCHAR(20) NOT NULL,
    `location_id` INTEGER NULL,

    PRIMARY KEY (`elderly_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Elderly_Medical_Notes` (
    `note_id` INTEGER NOT NULL AUTO_INCREMENT,
    `elderly_id` INTEGER NOT NULL,
    `condition_note` TEXT NOT NULL,
    `noted_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`note_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Family_Elderly_Map` (
    `map_id` INTEGER NOT NULL AUTO_INCREMENT,
    `family_user_id` INTEGER NOT NULL,
    `elderly_id` INTEGER NOT NULL,
    `relation_type` VARCHAR(50) NULL,

    UNIQUE INDEX `Family_Elderly_Map_family_user_id_elderly_id_key`(`family_user_id`, `elderly_id`),
    PRIMARY KEY (`map_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Emergency_Contacts` (
    `contact_id` INTEGER NOT NULL AUTO_INCREMENT,
    `elderly_id` INTEGER NOT NULL,
    `contact_name` VARCHAR(100) NOT NULL,
    `contact_phone` VARCHAR(15) NOT NULL,
    `relation` VARCHAR(50) NULL,

    PRIMARY KEY (`contact_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Elderly_Homes` (
    `home_id` INTEGER NOT NULL AUTO_INCREMENT,
    `home_name` VARCHAR(150) NOT NULL,
    `registration_number` VARCHAR(100) NULL,
    `capacity` INTEGER NOT NULL,
    `phone` VARCHAR(15) NULL,
    `email` VARCHAR(100) NULL,
    `location_id` INTEGER NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'Active',

    UNIQUE INDEX `Elderly_Homes_registration_number_key`(`registration_number`),
    PRIMARY KEY (`home_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Home_Networks` (
    `network_id` INTEGER NOT NULL AUTO_INCREMENT,
    `network_name` VARCHAR(150) NOT NULL,
    `description` TEXT NULL,
    `location_id` INTEGER NULL,

    UNIQUE INDEX `Home_Networks_network_name_key`(`network_name`),
    PRIMARY KEY (`network_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Home_Network_Map` (
    `map_id` INTEGER NOT NULL AUTO_INCREMENT,
    `home_id` INTEGER NOT NULL,
    `network_id` INTEGER NOT NULL,

    UNIQUE INDEX `Home_Network_Map_home_id_network_id_key`(`home_id`, `network_id`),
    PRIMARY KEY (`map_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Elderly_Home_Residents` (
    `resident_id` INTEGER NOT NULL AUTO_INCREMENT,
    `elderly_id` INTEGER NOT NULL,
    `home_id` INTEGER NOT NULL,
    `room_number` VARCHAR(20) NULL,
    `admission_date` DATE NOT NULL,
    `discharge_date` DATE NULL,

    PRIMARY KEY (`resident_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Tasks` (
    `task_id` INTEGER NOT NULL AUTO_INCREMENT,
    `elderly_id` INTEGER NOT NULL,
    `requested_by` INTEGER NOT NULL,
    `category_id` INTEGER NOT NULL,
    `home_id` INTEGER NULL,
    `description` TEXT NULL,
    `task_date` DATE NOT NULL,
    `task_time` TIME NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'Pending',

    PRIMARY KEY (`task_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Task_Assignments` (
    `assignment_id` INTEGER NOT NULL AUTO_INCREMENT,
    `task_id` INTEGER NOT NULL,
    `volunteer_id` INTEGER NOT NULL,
    `assigned_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `completion_status` VARCHAR(20) NOT NULL DEFAULT 'Pending',
    `completed_at` DATETIME(3) NULL,

    UNIQUE INDEX `Task_Assignments_task_id_key`(`task_id`),
    PRIMARY KEY (`assignment_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Volunteer_Verification` (
    `verification_id` INTEGER NOT NULL AUTO_INCREMENT,
    `volunteer_id` INTEGER NOT NULL,
    `id_document_type` VARCHAR(50) NULL,
    `id_proof_number` VARCHAR(100) NULL,
    `background_check_status` VARCHAR(20) NOT NULL DEFAULT 'Pending',
    `verified_by` INTEGER NULL,
    `verified_at` DATETIME(3) NULL,

    PRIMARY KEY (`verification_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Availability_Slots` (
    `slot_id` INTEGER NOT NULL AUTO_INCREMENT,
    `volunteer_id` INTEGER NOT NULL,
    `available_date` DATE NOT NULL,
    `start_time` TIME NOT NULL,
    `end_time` TIME NOT NULL,

    PRIMARY KEY (`slot_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `User_Roles` ADD CONSTRAINT `User_Roles_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `Users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User_Roles` ADD CONSTRAINT `User_Roles_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `Roles`(`role_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Locations` ADD CONSTRAINT `Locations_pincode_fkey` FOREIGN KEY (`pincode`) REFERENCES `Postal_Codes`(`pincode`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Elderly_Profiles` ADD CONSTRAINT `Elderly_Profiles_location_id_fkey` FOREIGN KEY (`location_id`) REFERENCES `Locations`(`location_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Elderly_Medical_Notes` ADD CONSTRAINT `Elderly_Medical_Notes_elderly_id_fkey` FOREIGN KEY (`elderly_id`) REFERENCES `Elderly_Profiles`(`elderly_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Family_Elderly_Map` ADD CONSTRAINT `Family_Elderly_Map_family_user_id_fkey` FOREIGN KEY (`family_user_id`) REFERENCES `Users`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Family_Elderly_Map` ADD CONSTRAINT `Family_Elderly_Map_elderly_id_fkey` FOREIGN KEY (`elderly_id`) REFERENCES `Elderly_Profiles`(`elderly_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Emergency_Contacts` ADD CONSTRAINT `Emergency_Contacts_elderly_id_fkey` FOREIGN KEY (`elderly_id`) REFERENCES `Elderly_Profiles`(`elderly_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Elderly_Homes` ADD CONSTRAINT `Elderly_Homes_location_id_fkey` FOREIGN KEY (`location_id`) REFERENCES `Locations`(`location_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Home_Networks` ADD CONSTRAINT `Home_Networks_location_id_fkey` FOREIGN KEY (`location_id`) REFERENCES `Locations`(`location_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Home_Network_Map` ADD CONSTRAINT `Home_Network_Map_home_id_fkey` FOREIGN KEY (`home_id`) REFERENCES `Elderly_Homes`(`home_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Home_Network_Map` ADD CONSTRAINT `Home_Network_Map_network_id_fkey` FOREIGN KEY (`network_id`) REFERENCES `Home_Networks`(`network_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Elderly_Home_Residents` ADD CONSTRAINT `Elderly_Home_Residents_elderly_id_fkey` FOREIGN KEY (`elderly_id`) REFERENCES `Elderly_Profiles`(`elderly_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Elderly_Home_Residents` ADD CONSTRAINT `Elderly_Home_Residents_home_id_fkey` FOREIGN KEY (`home_id`) REFERENCES `Elderly_Homes`(`home_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Tasks` ADD CONSTRAINT `Tasks_elderly_id_fkey` FOREIGN KEY (`elderly_id`) REFERENCES `Elderly_Profiles`(`elderly_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Tasks` ADD CONSTRAINT `Tasks_requested_by_fkey` FOREIGN KEY (`requested_by`) REFERENCES `Users`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Tasks` ADD CONSTRAINT `Tasks_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `Task_Categories`(`category_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Tasks` ADD CONSTRAINT `Tasks_home_id_fkey` FOREIGN KEY (`home_id`) REFERENCES `Elderly_Homes`(`home_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Task_Assignments` ADD CONSTRAINT `Task_Assignments_task_id_fkey` FOREIGN KEY (`task_id`) REFERENCES `Tasks`(`task_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Task_Assignments` ADD CONSTRAINT `Task_Assignments_volunteer_id_fkey` FOREIGN KEY (`volunteer_id`) REFERENCES `Users`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Volunteer_Verification` ADD CONSTRAINT `Volunteer_Verification_volunteer_id_fkey` FOREIGN KEY (`volunteer_id`) REFERENCES `Users`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Volunteer_Verification` ADD CONSTRAINT `Volunteer_Verification_verified_by_fkey` FOREIGN KEY (`verified_by`) REFERENCES `Users`(`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Availability_Slots` ADD CONSTRAINT `Availability_Slots_volunteer_id_fkey` FOREIGN KEY (`volunteer_id`) REFERENCES `Users`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
