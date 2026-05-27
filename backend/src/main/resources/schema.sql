-- =====================================================
-- BloodLink Database Schema
-- MySQL 8.x
-- =====================================================

CREATE DATABASE IF NOT EXISTS bloodlink;
USE bloodlink;

-- Users table (Single Table Inheritance for Donor/Patient)
CREATE TABLE IF NOT EXISTS users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    role ENUM('DONOR', 'PATIENT', 'ADMIN') NOT NULL,
    gender ENUM('MALE', 'FEMALE', 'OTHER'),
    age INT,
    current_location VARCHAR(255),
    full_address TEXT,
    profile_photo LONGTEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    dtype VARCHAR(20) NOT NULL,

    -- Donor-specific fields
    blood_group ENUM('A_POS', 'A_NEG', 'B_POS', 'B_NEG', 'AB_POS', 'AB_NEG', 'O_POS', 'O_NEG'),
    available_donation_area VARCHAR(255),
    last_donation_date DATE,
    donation_count INT DEFAULT 0,
    medical_history TEXT,
    diseases_restrictions TEXT,
    emergency_available BOOLEAN DEFAULT FALSE,
    availability_status ENUM('AVAILABLE', 'UNAVAILABLE') DEFAULT 'AVAILABLE',

    -- Patient-specific fields
    medical_condition TEXT,
    required_blood_group ENUM('A_POS', 'A_NEG', 'B_POS', 'B_NEG', 'AB_POS', 'AB_NEG', 'O_POS', 'O_NEG'),
    hospital_name VARCHAR(255),
    emergency_level ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'),
    required_date DATE,

    INDEX idx_blood_group (blood_group),
    INDEX idx_availability (availability_status),
    INDEX idx_location (current_location),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Blood Requests table
CREATE TABLE IF NOT EXISTS blood_requests (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    patient_id BIGINT NOT NULL,
    donor_id BIGINT NOT NULL,
    blood_group ENUM('A_POS', 'A_NEG', 'B_POS', 'B_NEG', 'AB_POS', 'AB_NEG', 'O_POS', 'O_NEG') NOT NULL,
    units_required INT DEFAULT 1,
    hospital_name VARCHAR(255),
    hospital_address TEXT,
    emergency_level ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') DEFAULT 'MEDIUM',
    required_date DATE,
    status ENUM('PENDING', 'ACCEPTED', 'DECLINED', 'COMPLETED', 'CANCELLED') DEFAULT 'PENDING',
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES users(id),
    FOREIGN KEY (donor_id) REFERENCES users(id),
    INDEX idx_status (status),
    INDEX idx_patient (patient_id),
    INDEX idx_donor (donor_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Chats table
CREATE TABLE IF NOT EXISTS chats (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    participant1_id BIGINT NOT NULL,
    participant2_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_message_at TIMESTAMP NULL,
    UNIQUE KEY unique_chat (participant1_id, participant2_id),
    FOREIGN KEY (participant1_id) REFERENCES users(id),
    FOREIGN KEY (participant2_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    chat_id BIGINT NOT NULL,
    sender_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id),
    INDEX idx_chat (chat_id),
    INDEX idx_sender (sender_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    related_request_id BIGINT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_user (user_id),
    INDEX idx_unread (user_id, is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Donation History table
CREATE TABLE IF NOT EXISTS donation_history (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    donor_id BIGINT NOT NULL,
    patient_id BIGINT,
    request_id BIGINT,
    donation_date DATE NOT NULL,
    blood_group ENUM('A_POS', 'A_NEG', 'B_POS', 'B_NEG', 'AB_POS', 'AB_NEG', 'O_POS', 'O_NEG') NOT NULL,
    units_donated INT DEFAULT 1,
    hospital_name VARCHAR(255),
    notes TEXT,
    FOREIGN KEY (donor_id) REFERENCES users(id),
    FOREIGN KEY (patient_id) REFERENCES users(id),
    FOREIGN KEY (request_id) REFERENCES blood_requests(id),
    INDEX idx_donor_history (donor_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Medical Records table
CREATE TABLE IF NOT EXISTS medical_records (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    record_type VARCHAR(100) NOT NULL,
    description TEXT,
    diagnosis_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_user_records (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Sample Data Insertion
-- =====================================================

-- Sample Donors
INSERT INTO users (email, password, full_name, phone_number, role, gender, age, current_location, full_address, profile_photo, latitude, longitude, dtype, blood_group, available_donation_area, last_donation_date, donation_count, medical_history, diseases_restrictions, emergency_available, availability_status)
VALUES
('john.donor@email.com', '$2a$12$8.UnVuG9HHgffUDAlk8GP.3q3gOP3T0t7K7Y3gp281gxGs.Y33.GW', 'John Mitchell', '+1-555-0101', 'DONOR', 'MALE', 28, 'New York, NY', '123 Main St, New York, NY', '/avatar-male.jpg', 40.7128, -74.0060, 'DONOR', 'O_NEG', 'Manhattan, Brooklyn', '2024-11-01', 12, 'Healthy, no chronic conditions', 'None', TRUE, 'AVAILABLE'),
('sarah.blood@email.com', '$2a$12$8.UnVuG9HHgffUDAlk8GP.3q3gOP3T0t7K7Y3gp281gxGs.Y33.GW', 'Sarah Chen', '+1-555-0102', 'DONOR', 'FEMALE', 32, 'Los Angeles, CA', '456 Sunset Blvd, Los Angeles, CA', '/avatar-female.jpg', 34.0522, -118.2437, 'DONOR', 'A_POS', 'Downtown LA, Hollywood', '2024-12-01', 8, 'Healthy', 'None', TRUE, 'AVAILABLE'),
('mike.giver@email.com', '$2a$12$8.UnVuG9HHgffUDAlk8GP.3q3gOP3T0t7K7Y3gp281gxGs.Y33.GW', 'Michael Rodriguez', '+1-555-0103', 'DONOR', 'MALE', 25, 'Chicago, IL', '789 Michigan Ave, Chicago, IL', '/avatar-male.jpg', 41.8781, -87.6298, 'DONOR', 'B_POS', 'Chicago Metro', '2025-01-10', 5, 'Healthy', 'None', FALSE, 'AVAILABLE'),
('emma.life@email.com', '$2a$12$8.UnVuG9HHgffUDAlk8GP.3q3gOP3T0t7K7Y3gp281gxGs.Y33.GW', 'Emma Watson', '+1-555-0104', 'DONOR', 'FEMALE', 29, 'Houston, TX', '321 Texas Ave, Houston, TX', '/avatar-female.jpg', 29.7604, -95.3698, 'DONOR', 'AB_NEG', 'Houston Medical Center', '2024-10-15', 15, 'Healthy', 'None', TRUE, 'AVAILABLE'),
('david.help@email.com', '$2a$12$8.UnVuG9HHgffUDAlk8GP.3q3gOP3T0t7K7Y3gp281gxGs.Y33.GW', 'David Park', '+1-555-0105', 'DONOR', 'MALE', 35, 'Phoenix, AZ', '654 Desert Rd, Phoenix, AZ', '/avatar-male.jpg', 33.4484, -112.0740, 'DONOR', 'O_POS', 'Phoenix Metro', '2024-12-20', 20, 'Healthy', 'None', TRUE, 'AVAILABLE');

-- Sample Patients
INSERT INTO users (email, password, full_name, phone_number, role, gender, age, current_location, full_address, profile_photo, latitude, longitude, dtype, medical_condition, required_blood_group, hospital_name, emergency_level, required_date)
VALUES
('alice.need@email.com', '$2a$12$8.UnVuG9HHgffUDAlk8GP.3q3gOP3T0t7K7Y3gp281gxGs.Y33.GW', 'Alice Johnson', '+1-555-0201', 'PATIENT', 'FEMALE', 45, 'New York, NY', '789 Broadway, New York, NY', '/avatar-female.jpg', 40.7589, -73.9851, 'PATIENT', 'Surgery scheduled - needs blood transfusion', 'O_NEG', 'Mount Sinai Hospital', 'HIGH', '2025-02-15'),
('bob.emergency@email.com', '$2a$12$8.UnVuG9HHgffUDAlk8GP.3q3gOP3T0t7K7Y3gp281gxGs.Y33.GW', 'Robert Williams', '+1-555-0202', 'PATIENT', 'MALE', 60, 'Los Angeles, CA', '321 Hollywood Blvd, Los Angeles, CA', '/avatar-male.jpg', 34.0928, -118.3287, 'PATIENT', 'Accident victim - urgent blood needed', 'A_POS', 'Cedars-Sinai Medical Center', 'CRITICAL', '2025-01-25');


-- Sample Blood Requests
INSERT INTO blood_requests (patient_id, donor_id, blood_group, units_required, hospital_name, hospital_address, emergency_level, required_date, status, message)
VALUES
(6, 1, 'O_NEG', 2, 'Mount Sinai Hospital', '1468 Madison Ave, New York, NY', 'HIGH', '2025-02-15', 'PENDING', 'Urgent need for O- blood for scheduled surgery'),
(7, 2, 'A_POS', 3, 'Cedars-Sinai Medical Center', '8700 Beverly Blvd, Los Angeles, CA', 'CRITICAL', '2025-01-25', 'ACCEPTED', 'Critical - accident victim needs A+ blood immediately');

-- Sample Chats
INSERT INTO chats (participant1_id, participant2_id, created_at, last_message_at)
VALUES (6, 1, '2025-01-20T10:00:00', '2025-01-21T15:30:00');

-- Sample Messages
INSERT INTO messages (chat_id, sender_id, content, timestamp, is_read)
VALUES
(1, 6, 'Hello, I urgently need O- blood for my surgery. Can you help?', '2025-01-20T10:00:00', TRUE),
(1, 1, 'Hi Alice, I\'m O- and available. I\'d be happy to help. Where is the hospital?', '2025-01-20T10:05:00', TRUE),
(1, 6, 'Mount Sinai Hospital, 1468 Madison Ave. The surgery is scheduled for Feb 15th.', '2025-01-20T10:10:00', TRUE),
(1, 1, 'That works for me. I\'ll accept your request and we can coordinate the details.', '2025-01-20T10:15:00', TRUE),
(1, 6, 'Thank you so much for accepting my request!', '2025-01-21T15:30:00', FALSE);

-- Sample Notifications
INSERT INTO notifications (user_id, type, title, message, related_request_id, is_read, created_at)
VALUES
(1, 'REQUEST', 'New Blood Request', 'Alice Johnson sent you a blood request', 1, FALSE, '2025-01-20T10:00:00'),
(6, 'ACCEPTED', 'Request Accepted', 'John Mitchell accepted your blood request', 1, FALSE, '2025-01-20T14:00:00');
