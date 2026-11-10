CREATE DATABASE IF NOT EXISTS plmun_clinic;
USE plmun_clinic;

-- Patients Table
CREATE TABLE IF NOT EXISTS patients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_number VARCHAR(20) UNIQUE NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  birthdate DATE,
  sex VARCHAR(20),
  course VARCHAR(50),
  year_level VARCHAR(20),
  blood_type VARCHAR(10),
  allergies TEXT,
  medical_conditions TEXT,
  emergency_contact VARCHAR(100),
  contact_number VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Clinic Visits Table
CREATE TABLE IF NOT EXISTS clinic_visits (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_number VARCHAR(20) NOT NULL,
  visit_date DATE NOT NULL,
  checkup_type VARCHAR(50),
  chief_complaint TEXT,
  medical_assessment TEXT,
  treatment_given TEXT,
  symptoms TEXT,
  medication TEXT,
  remarks TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_number) REFERENCES patients(student_number) ON DELETE CASCADE
);