-- ==============================================================================
-- LOST1S PET SHELTER MANAGEMENT SYSTEM - DATABASE QUERIES
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- PART 1: TABLE CREATION QUERIES (DDL)
-- These queries define the structure of the database based on the Prisma schema.
-- ------------------------------------------------------------------------------

-- Create the Pet table to store animal information
CREATE TABLE `Pet` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `species` varchar(191) NOT NULL,
  `breed` varchar(191) DEFAULT NULL,
  `age` int NOT NULL,
  `vaccinated` boolean NOT NULL DEFAULT FALSE,
  `spayed` boolean NOT NULL DEFAULT FALSE,
  `status` varchar(191) NOT NULL DEFAULT 'AVAILABLE',
  `intakeDate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `imageUrl` text DEFAULT NULL,
  `description` text DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL,
  PRIMARY KEY (`id`)
);

-- Create the Admin table for system administrators
CREATE TABLE `Admin` (
  `id` varchar(191) NOT NULL,
  `username` varchar(191) NOT NULL UNIQUE,
  `password` varchar(191) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

-- Create the User table for Adopters, Staff, and Donors
CREATE TABLE `User` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `email` varchar(191) NOT NULL UNIQUE,
  `password` varchar(191) NOT NULL,
  `role` varchar(191) NOT NULL DEFAULT 'ADOPTER',
  `additionalRole` varchar(191) DEFAULT NULL,
  `isBlacklisted` boolean NOT NULL DEFAULT FALSE,
  `bannedById` varchar(191) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`bannedById`) REFERENCES `Admin`(`id`) ON DELETE SET NULL
);

-- Create the Application table for adoption requests
CREATE TABLE `Application` (
  `id` varchar(191) NOT NULL,
  `petId` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `reason` text NOT NULL,
  `experience` text NOT NULL,
  `housingType` varchar(191) NOT NULL,
  `hasYard` boolean NOT NULL,
  `status` varchar(191) NOT NULL DEFAULT 'REVIEW',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`petId`) REFERENCES `Pet`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE
);

-- Create the Schedule table for appointments (e.g., to visit a pet)
CREATE TABLE `Schedule` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `petId` varchar(191) NOT NULL,
  `date` timestamp NOT NULL,
  `timeSlot` varchar(191) NOT NULL,
  `location` varchar(191) NOT NULL,
  `notes` text DEFAULT NULL,
  `status` varchar(191) NOT NULL DEFAULT 'PENDING',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`petId`) REFERENCES `Pet`(`id`) ON DELETE CASCADE,
  UNIQUE (`date`, `timeSlot`, `location`)
);

-- Create the Donation table to track financial contributions
CREATE TABLE `Donation` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `amount` float NOT NULL,
  `type` varchar(191) NOT NULL,
  `frequency` varchar(191) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE
);

-- Create the SecurityLog table to audit events
CREATE TABLE `SecurityLog` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `incident` text NOT NULL,
  `action` text NOT NULL,
  `status` varchar(191) NOT NULL DEFAULT 'OPEN',
  `resolvedAt` timestamp DEFAULT NULL,
  `resolverId` varchar(191) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`resolverId`) REFERENCES `Admin`(`id`) ON DELETE SET NULL
);

-- ------------------------------------------------------------------------------
-- PART 2: OPERATION QUERIES (DML)
-- These queries correspond to specific user actions and application features.
-- ------------------------------------------------------------------------------

-- 1. Read Profile in Adopter & Donor Profile
-- Retrieves user information for their profile page.
SELECT 
  `id`, `name`, `email`, `role`, `additionalRole`, `createdAt`
FROM `User`
WHERE `id` = 'user_id_here';

-- 2. Enable Duo Profile
-- Updates an existing Adopter’s profile to include the Donor role.
UPDATE `User`
SET `additionalRole` = 'DONOR', `updatedAt` = CURRENT_TIMESTAMP
WHERE `id` = 'user_id_here';

-- 3. Make Donation
-- Inserts a new donation record linked to the user.
INSERT INTO `Donation` 
  (`id`, `userId`, `amount`, `type`, `frequency`, `createdAt`)
VALUES 
  ('new_donation_id', 'user_id_here', 50.00, 'FOOD', 'ONE_TIME', CURRENT_TIMESTAMP);

-- 4. Manage Schedule in Staff Portal (Read)
-- Retrieves schedules with related Adopter and Pet information.
SELECT 
  s.`id`, s.`date`, s.`timeSlot`, s.`location`, s.`status`, s.`notes`,
  u.`name` AS `adopterName`, u.`email` AS `adopterEmail`,
  p.`name` AS `petName`, p.`species` AS `petSpecies`
FROM `Schedule` s
JOIN `User` u ON s.`userId` = u.`id`
JOIN `Pet` p ON s.`petId` = p.`id`
ORDER BY s.`date` DESC, s.`timeSlot` ASC;

-- 5. Manage Schedule in Staff Portal (Update)
-- Updates the status of a specific schedule (e.g., CONFIRMED, COMPLETED, CANCELLED).
UPDATE `Schedule`
SET `status` = 'CONFIRMED', `updatedAt` = CURRENT_TIMESTAMP
WHERE `id` = 'schedule_id_here';

-- 6. Read Pet in Manage Pet in Staff Portal
-- Retrieves all pets for the staff dashboard, ordered by intake date.
SELECT 
  `id`, `name`, `species`, `breed`, `age`, `vaccinated`, `spayed`, `status`, `intakeDate`
FROM `Pet`
ORDER BY `intakeDate` DESC;

-- 7. User Management in Admin Portal (Read)
-- Retrieves all users (excluding Admins) for the admin dashboard.
SELECT 
  `id`, `name`, `email`, `role`, `additionalRole`, `isBlacklisted`, `createdAt`
FROM `User`
ORDER BY `createdAt` DESC;

-- 8. User Management in Admin Portal (Update)
-- Blacklists a user and logs the Admin who performed the action.
UPDATE `User`
SET `isBlacklisted` = TRUE, `bannedById` = 'admin_id_here', `updatedAt` = CURRENT_TIMESTAMP
WHERE `id` = 'user_id_here';

-- 9. Review Application in Staff Portal (Read)
-- Retrieves adoption applications with related Pet and User info.
SELECT 
  a.`id`, a.`reason`, a.`experience`, a.`housingType`, a.`hasYard`, a.`status`, a.`createdAt`,
  u.`name` AS `adopterName`, u.`email` AS `adopterEmail`,
  p.`name` AS `petName`, p.`species` AS `petSpecies`
FROM `Application` a
JOIN `User` u ON a.`userId` = u.`id`
JOIN `Pet` p ON a.`petId` = p.`id`
ORDER BY a.`createdAt` ASC;

-- 10. Review Application in Staff Portal (Update)
-- Updates the status of an adoption application (e.g., APPROVED, REJECTED).
UPDATE `Application`
SET `status` = 'APPROVED', `updatedAt` = CURRENT_TIMESTAMP
WHERE `id` = 'application_id_here';

-- 11. Read Security Logs in Admin Console
-- Retrieves security logs with related User and Admin (Resolver) details.
SELECT 
  s.`id`, s.`incident`, s.`action`, s.`status`, s.`createdAt`, s.`resolvedAt`,
  u.`name` AS `userName`, u.`email` AS `userEmail`,
  a.`username` AS `resolverName`
FROM `SecurityLog` s
JOIN `User` u ON s.`userId` = u.`id`
LEFT JOIN `Admin` a ON s.`resolverId` = a.`id`
ORDER BY s.`createdAt` DESC;

-- 12. Resolve Security Log in Admin Console
-- Marks a security log as resolved by an Admin.
UPDATE `SecurityLog`
SET `status` = 'RESOLVED', `resolvedAt` = CURRENT_TIMESTAMP, `resolverId` = 'admin_id_here'
WHERE `id` = 'log_id_here';

-- 13. Admin Dashboard (Summary Count: Total Users)
-- Counts all users across all roles.
SELECT COUNT(*) AS `totalUsers`
FROM `User`;

-- 14. Admin Dashboard (Summary Count: Total Logs)
-- Counts all generated security logs.
SELECT COUNT(*) AS `totalLogs`
FROM `SecurityLog`;

-- 15. Admin Dashboard (Summary Count: Open Logs)
-- Counts only the unresolved/open security logs.
SELECT COUNT(*) AS `openLogs`
FROM `SecurityLog`
WHERE `status` = 'OPEN';

-- ------------------------------------------------------------------------------
-- PART 3: ADDITIONAL QUERIES FROM SQL REPORT
-- These queries represent other key workflows in the application.
-- ------------------------------------------------------------------------------

-- 16. Register New User
-- User signs up for an account.
INSERT INTO `User` (`id`, `name`, `email`, `password`, `role`, `createdAt`, `updatedAt`)
VALUES ('exclude-cuid', 'John Doe', 'john@example.com', '$2b$10$hashedpassword...', 'ADOPTER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 17. User Login (Find by Email)
-- System checks if user exists and retrieves hash for password verification.
SELECT `id`, `name`, `email`, `password`, `role`, `isBlacklisted`
FROM `User`
WHERE `email` = 'john@example.com'
LIMIT 1;

-- 18. View All Available Pets (Adopter/Visitor)
-- Displaying pets on the "Discover" page.
SELECT * FROM `Pet`
WHERE `status` = 'AVAILABLE'
ORDER BY `createdAt` DESC;

-- 19. Filter Pets by Species
-- Filtering for just "Dogs".
SELECT * FROM `Pet`
WHERE `status` = 'AVAILABLE' 
AND `species` = 'DOG'
ORDER BY `createdAt` DESC;

-- 20. Get Pet Details
-- Clicking on a specific pet card.
SELECT * FROM `Pet`
WHERE `id` = 'pet-uuid-123'
LIMIT 1;

-- 21. Add New Pet (Staff Only)
-- Staff adds a new pet to the system.
INSERT INTO `Pet` (`id`, `name`, `species`, `breed`, `age`, `vaccinated`, `spayed`, `imageUrl`, `description`, `status`, `createdAt`, `updatedAt`)
VALUES ('pet-uuid-new', 'Bella', 'CAT', 'Siamese', 2, true, true, 'https://...', 'Lovely cat', 'AVAILABLE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 22. Check Availability (Prevent Double Booking)
-- Before creating a schedule, ensure the slot is free.
SELECT COUNT(*) 
FROM `Schedule`
WHERE `date` = '2023-10-27' 
AND `timeSlot` = '10:00 AM' 
AND `location` = 'Main Hall';

-- 23. Create Schedule
-- User books a visit.
INSERT INTO `Schedule` (`id`, `userId`, `petId`, `date`, `timeSlot`, `location`, `status`, `createdAt`, `updatedAt`)
VALUES ('sched-uuid-001', 'user-uuid-123', 'pet-uuid-123', '2023-10-27', '10:00 AM', 'Main Hall', 'PENDING', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 24. View User's Schedules
-- Adopter viewing their "My Schedules" page.
SELECT S.*, P.`name` as `petName`, P.`imageUrl`
FROM `Schedule` S
JOIN `Pet` P ON S.`petId` = P.`id`
WHERE S.`userId` = 'user-uuid-123'
ORDER BY S.`date` DESC;

-- 25. Cancel Schedule
-- User or Staff cancels an appointment.
UPDATE `Schedule`
SET `status` = 'CANCELLED', `updatedAt` = CURRENT_TIMESTAMP
WHERE `id` = 'sched-uuid-456';

-- 26. Check Pre-requisite (Total Participation Rule)
-- System verifies user has a confirmed/completed meeting before allowing application.
SELECT * FROM `Schedule`
WHERE `userId` = 'user-uuid-123'
AND `petId` = 'pet-uuid-123'
AND `status` IN ('CONFIRMED', 'COMPLETED')
LIMIT 1;

-- 27. Submit Application
-- Creating the application.
INSERT INTO `Application` (`id`, `userId`, `petId`, `reason`, `housingType`, `hasYard`, `status`, `createdAt`, `updatedAt`)
VALUES ('app-uuid-001', 'user-uuid-123', 'pet-uuid-123', 'I love dogs', 'HOUSE', true, 'REVIEW', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 28. Dashboard Statistics (Staff)
-- Aggregating counts for the staff dashboard.
SELECT COUNT(*) AS `totalPets` FROM `Pet`;
SELECT COUNT(*) AS `pendingApps` FROM `Application` WHERE `status` = 'REVIEW';
SELECT COUNT(*) AS `pendingHchedules` FROM `Schedule` WHERE `status` = 'PENDING';

-- 29. Log Failed Login Attempt
-- User enters wrong password.
INSERT INTO `SecurityLog` (`id`, `userId`, `incident`, `status`, `createdAt`)
VALUES ('log-uuid-999', 'user-uuid-123', 'LOGIN_FAILURE', 'OPEN', CURRENT_TIMESTAMP);

-- 30. Delete User Account (Weak Entity Cascade)
-- User deletes their account. This triggers a cascade delete of all related records.
DELETE FROM `User`
WHERE `id` = 'user-uuid-123';

-- 31. Donation Leaderboard
-- Displaying top donors.
SELECT U.`name`, SUM(D.`amount`) as `totalDonated`
FROM `Donation` D
JOIN `User` U ON D.`userId` = U.`id`
GROUP BY U.`id`, U.`name`
ORDER BY `totalDonated` DESC
LIMIT 10;
