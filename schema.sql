-- ===================================================
-- DATABASE SCHEMA FOR IT-FESTIVAL 2026
-- ===================================================
-- Versi aman untuk cPanel / phpMyAdmin
-- Buat database dulu lewat MySQL Database Wizard,
-- lalu import file ini ke database yang sudah dibuat.
-- ===================================================

DROP TABLE IF EXISTS sponsors;
DROP TABLE IF EXISTS media_partners;
DROP TABLE IF EXISTS timeline;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS speakers;

-- 1. TABEL SPONSORS
CREATE TABLE sponsors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  logo_url VARCHAR(500) NOT NULL,
  website_url VARCHAR(500) DEFAULT NULL,
  is_visible TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABEL MEDIA PARTNERS
CREATE TABLE media_partners (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  logo_url VARCHAR(500) NOT NULL,
  website_url VARCHAR(500) DEFAULT NULL,
  is_visible TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. TABEL TIMELINE AGENDA
CREATE TABLE timeline (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  date_string VARCHAR(255) NOT NULL,
  category VARCHAR(100) DEFAULT 'AGENDA',
  badge_color VARCHAR(20) DEFAULT 'pink',
  image_url VARCHAR(500) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. TABEL EVENTS (LINK DAFTAR, GUIDEBOOK & MASKOT CARD)
CREATE TABLE events (
  id VARCHAR(100) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
  category_label VARCHAR(100) NOT NULL,
  description TEXT,
  icon_type VARCHAR(50) DEFAULT 'code',
  badge_color VARCHAR(20) DEFAULT 'cyan',
  gform_url VARCHAR(500) DEFAULT 'https://forms.google.com/',
  guidebook_url VARCHAR(500) DEFAULT '',
  mascot_url VARCHAR(500) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. TABEL SPEAKERS (PEMATERI & CV PDF)
CREATE TABLE speakers (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'speaker',
  photo VARCHAR(500) DEFAULT NULL,
  photo_position VARCHAR(100) DEFAULT 'center',
  cv VARCHAR(500) DEFAULT NULL,
  color VARCHAR(20) DEFAULT 'pink',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SEED DATA SPONSORS
INSERT INTO sponsors (name, logo_url) VALUES
('Sewa Kamera', 'logos/sponsors/sewa_kamera.svg'),
('Risa Florist & Co.', 'logos/sponsors/risa_florist.svg'),
('Syneps Academy', 'logos/sponsors/syneps.svg'),
('Cibubur IT Center', 'logos/sponsors/cibubur_it.svg'),
('Bank BRI', 'logos/sponsors/bri.svg'),
('Miss Bakers', 'logos/sponsors/miss_bakers.svg'),
('PUSRI', 'logos/sponsors/pusri.svg');

-- SEED DATA MEDIA PARTNERS
INSERT INTO media_partners (name, logo_url) VALUES
('HIMA IF', 'logos/media_partners/hima_if.svg'),
('HMI', 'logos/media_partners/hmi.svg'),
('CMS', 'logos/media_partners/cms.svg'),
('HMJ AOK', 'logos/media_partners/hmj_aok.svg'),
('BNCC', 'logos/media_partners/bncc.svg'),
('HIMA ILKOM FMIPA UNNES', 'logos/media_partners/hima_ilkom.svg');

-- SEED DATA TIMELINE AGENDA (ALL 17 ITEMS)
INSERT INTO timeline (id, title, date_string, category, badge_color) VALUES
(1, 'OPEN REGISTRATION SEMINAR, PERLOMBAAN DAN PELATIHAN (CYBER & WEB)', 'Senin, 10 Agustus 2026', 'REGISTRASI', 'pink'),
(2, 'Close Registration Pelatihan dan Seminar', 'Rabu, 9 September 2026', 'CLOSE REG', 'cyan'),
(3, 'Opening Ceremony IT Festival 2026', 'Rabu, 16 September 2026', 'OPENING', 'yellow'),
(4, 'Pelaksanaan Seminar & Talkshow', 'Rabu, 16 September 2026', 'SEMINAR', 'pink'),
(5, 'Pelatihan vibe Coding', '17-18 September, 21-22 September 2026', 'PELATIHAN', 'cyan'),
(6, 'Pelatihan Cyber', '23-25 September, 28 September 2026', 'PELATIHAN', 'yellow'),
(7, 'Close Registration Lomba Mobile legends & Free Fire', 'Kamis, 1 Oktober 2026', 'CLOSE REG', 'pink'),
(8, 'Pelaksanaan Technical Meeting Lomba Mobile Legends', 'Jum’at, 2 Oktober 2026', 'TM', 'cyan'),
(9, 'Pelaksanaan Lomba Mobile Legends', 'Sabtu, 3 Oktober 2026 (Online) – Minggu, 4 Oktober 2026 (Ofline)', 'LOMBA', 'yellow'),
(10, 'Pelaksanaan Technical Meeting Lomba Free Fire', 'Jum’at, 9 Oktober 2026', 'TM', 'pink'),
(11, 'Pelaksanaan Lomba Free Fire', 'Sabtu, 10 Oktober 2026 (Online) – Minggu, 11 Oktober 2026 (Ofline)', 'LOMBA', 'cyan'),
(12, 'Close Registration Lomba Vibe Coding , Capture the flag , Fotografi', 'Minggu, 11 Oktober 2026', 'CLOSE REG', 'pink'),
(13, 'Technical Meeting Vibe Coding , Capture the flag , Fotografi', 'Senin, 12 Oktober 2026', 'TM', 'yellow'),
(14, 'Pelaksaan Lomba Capture The Flag', 'Sabtu, 17 Oktober 2026', 'LOMBA', 'cyan'),
(15, 'Batas Pengumpulan Karya Vibe Coding dan Fotografi', 'Jum’at, 23 Oktober 2026', 'DEADLINE', 'pink'),
(16, 'Penjurian Lomba Vibe Coding Dan Fotografi', 'Jum’at 24 – 30 Oktober 2026', 'PENJURIAN', 'yellow'),
(17, 'Closing Ceremony IT Festival 2026 & Pengumuman Pemenang', 'Senin, 2 November 2026', 'CLOSING', 'cyan');

-- SEED DATA EVENTS
INSERT INTO events (id, title, category, category_label, description, icon_type, badge_color, gform_url, guidebook_url, mascot_url) VALUES
('ml', 'Mobile Legends', 'kompetisi', 'KOMPETISI', 'Buktikan skill dan kerja sama timmu di arena Mobile Legends, raih kemenangan demi kemenangan.', 'gamepad', 'cyan', 'https://bit.ly/PendaftaranLombaMobileLegendsITFestival2026', '', '/maskot/mascot-ml.png'),
('ff', 'Free Fire', 'kompetisi', 'KOMPETISI', 'Turun ke medan pertempuran Free Fire, jadi yang terakhir bertahan dan raih Booyah!', 'flame', 'pink', 'https://bit.ly/PendaftaranLombaFreeFireITFestival2026', '', '/maskot/mascot-ff.png'),
('vibe-coding-comp', 'Vibe Coding Competition', 'kompetisi', 'KOMPETISI', 'Bangun aplikasi atau produk digital secepat mungkin menggunakan bantuan AI, untuk menciptakan kreativitas.', 'code', 'yellow', 'https://bit.ly/PendaftaranLombaVibeCodingITFestival2026', '', '/maskot/mascot-vibe-coding.png'),
('ctf-comp', 'Capture The Flag Competition', 'kompetisi', 'KOMPETISI', 'Uji kemampuan hacking dan keamanan sibermu dengan memecahkan berbagai tantangan CTF dari level pemula hingga expert.', 'shield', 'cyan', 'https://bit.ly/PendaftranLombaCaptureTheFlagITFestival2026', '', '/maskot/mascot-ctf.png'),
('photography-comp', 'Photography Competition', 'kompetisi', 'KOMPETISI', 'Tunjukkan sudut pandang kreatifmu lewat lensa kamera dan abadikan momen terbaik dalam kompetisi fotografi ini.', 'camera', 'pink', 'https://bit.ly/PendaftaranLombaPromtographyITFestival2026', '', '/maskot/mascot-photography.png'),
('vibe-coding-training', 'Vibe Coding', 'pelatihan', 'PELATIHAN', 'Belajar membangun aplikasi dan produk digital secara cepat dengan bantuan AI, dari ide sampai jadi produk nyata.', 'code', 'yellow', 'http://bit.ly/PendaftaranPelatihanVibeCodingITFestival2026', '', '/maskot/mascot-vibe-coding.png'),
('cyber-security-training', 'Cyber Security', 'pelatihan', 'PELATIHAN', 'Pelajari dasar-dasar keamanan siber, mulai dari deteksi celah keamanan hingga teknik perlindungan sistem.', 'shield', 'cyan', 'https://bit.ly/PendaftaranPelatihanCybersecurityITFestival2026', '', '/maskot/mascot-ctf.png'),
('seminar-itfest', 'Seminar IT-Festival 2026', 'seminar', 'SEMINAR', 'Ikuti seminar kami dan dapatkan wawasan berharga langsung dari para ahli di bidang teknologi.', 'mic', 'pink', 'https://bit.ly/PendaftaranSeminarITFestival2026', '', '/maskot/mascot-vibe-coding.png');

-- SEED DATA SPEAKERS
INSERT INTO speakers (id, name, role, category, photo, photo_position, cv, color) VALUES
('avip-syaifulloh', 'Avip Syaifulloh, S.T.', 'CEO WPU Course', 'guest-star', '/speakers/avip-syaifulloh.jpg', 'center 25%', '/speakers/cv-avip-syaifulloh.pdf', 'pink'),
('rahmi-liza', 'Rahmi Liza, S.Tr.Kom., M.Sc.', 'Software Engineer', 'speaker', '/speakers/rahmi-liza.jpg', 'center 60%', '/speakers/cv-rahmi-liza.pdf', 'cyan');
