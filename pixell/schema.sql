-- ===================================================
-- DATABASE SCHEMA FOR IT-FESTIVAL SPONSORS & MEDIA PARTNERS
-- ===================================================
-- 1. Impor file ini ke MySQL / phpMyAdmin / MySQL Workbench
-- 2. Konfigurasi kredensial MySQL di file .env.local:
--    MYSQL_HOST=127.0.0.1
--    MYSQL_USER=root
--    MYSQL_PASSWORD=
--    MYSQL_DATABASE=it_festival
--    MYSQL_PORT=3306
-- ===================================================

CREATE DATABASE IF NOT EXISTS it_festival CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE it_festival;

DROP TABLE IF EXISTS partners;

CREATE TABLE partners (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  logo_url VARCHAR(500) NOT NULL,
  type ENUM('sponsor', 'media_partner') NOT NULL DEFAULT 'sponsor',
  website_url VARCHAR(500) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===================================================
-- SEED DATA (SPONSORS & MEDIA PARTNERS)
-- ===================================================

INSERT INTO partners (name, logo_url, type) VALUES
-- SPONSORS
('Sewa Kamera', '/logos/sponsors/sewa_kamera.svg', 'sponsor'),
('Risa Florist & Co.', '/logos/sponsors/risa_florist.svg', 'sponsor'),
('Syneps Academy', '/logos/sponsors/syneps.svg', 'sponsor'),
('Cibubur IT Center', '/logos/sponsors/cibubur_it.svg', 'sponsor'),
('Bank BRI', '/logos/sponsors/bri.svg', 'sponsor'),
('Miss Bakers', '/logos/sponsors/miss_bakers.svg', 'sponsor'),
('PUSRI', '/logos/sponsors/pusri.svg', 'sponsor'),

-- MEDIA PARTNERS
('HIMA IF', '/logos/media_partners/hima_if.svg', 'media_partner'),
('HMI', '/logos/media_partners/hmi.svg', 'media_partner'),
('CMS', '/logos/media_partners/cms.svg', 'media_partner'),
('HMJ AOK', '/logos/media_partners/hmj_aok.svg', 'media_partner'),
('BNCC', '/logos/media_partners/bncc.svg', 'media_partner'),
('HIMA ILKOM FMIPA UNNES', '/logos/media_partners/hima_ilkom.svg', 'media_partner');
