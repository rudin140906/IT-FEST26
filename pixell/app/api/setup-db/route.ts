import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

export const dynamic = "force-static";

export async function GET() {
  try {
    const host = process.env.MYSQL_HOST || "127.0.0.1";
    const user = process.env.MYSQL_USER || "root";
    const password = process.env.MYSQL_PASSWORD || "";
    const port = Number(process.env.MYSQL_PORT) || 3306;

    // Connect to MySQL server without selecting a specific database first
    const connection = await mysql.createConnection({
      host,
      user,
      password,
      port,
    });

    // 1. Create database if not exists
    await connection.query("CREATE DATABASE IF NOT EXISTS `it_festival` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;");
    await connection.query("USE `it_festival`;");

    // 2. Create sponsors table if not exists
    await connection.query(`
      CREATE TABLE IF NOT EXISTS sponsors (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        logo_url VARCHAR(500) NOT NULL,
        website_url VARCHAR(500) DEFAULT NULL,
        is_visible TINYINT(1) NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    try {
      await connection.query("ALTER TABLE sponsors ADD COLUMN is_visible TINYINT(1) NOT NULL DEFAULT 1 AFTER website_url;");
    } catch {
      // Column already exists
    }
    await connection.query("UPDATE sponsors SET is_visible = 1 WHERE is_visible = 0;");

    // 3. Create media_partners table if not exists
    await connection.query(`
      CREATE TABLE IF NOT EXISTS media_partners (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        logo_url VARCHAR(500) NOT NULL,
        website_url VARCHAR(500) DEFAULT NULL,
        is_visible TINYINT(1) NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    try {
      await connection.query("ALTER TABLE media_partners ADD COLUMN is_visible TINYINT(1) NOT NULL DEFAULT 1 AFTER website_url;");
    } catch {
      // Column already exists
    }
    await connection.query("UPDATE media_partners SET is_visible = 1 WHERE is_visible = 0;");

    // 4. Create timeline table if not exists
    await connection.query(`
      CREATE TABLE IF NOT EXISTS timeline (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        date_string VARCHAR(255) NOT NULL,
        category VARCHAR(100) DEFAULT 'AGENDA',
        badge_color VARCHAR(20) DEFAULT 'pink',
        image_url VARCHAR(500) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    try {
      await connection.query("ALTER TABLE timeline ADD COLUMN image_url VARCHAR(500) DEFAULT NULL;");
    } catch {
      // Column already exists
    }

    // 5. Create events table if not exists
    await connection.query(`
      CREATE TABLE IF NOT EXISTS events (
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
    `);

    try {
      await connection.query("ALTER TABLE events ADD COLUMN mascot_url VARCHAR(500) DEFAULT NULL;");
    } catch {
      // Column already exists
    }

    // 6. Create speakers table if not exists
    await connection.query(`
      CREATE TABLE IF NOT EXISTS speakers (
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
    `);

    // Seed Sponsors if empty
    const [sponsorRows] = await connection.query("SELECT COUNT(*) as count FROM sponsors");
    const sponsorCount = (sponsorRows as unknown as { count: number }[])[0]?.count || 0;
    let sponsorsSeeded = false;

    if (sponsorCount === 0) {
      await connection.query(`
        INSERT INTO sponsors (name, logo_url) VALUES
        ('Sewa Kamera', '/logos/sponsors/sewa_kamera.svg'),
        ('Risa Florist & Co.', '/logos/sponsors/risa_florist.svg'),
        ('Syneps Academy', '/logos/sponsors/syneps.svg'),
        ('Cibubur IT Center', '/logos/sponsors/cibubur_it.svg'),
        ('Bank BRI', '/logos/sponsors/bri.svg'),
        ('Miss Bakers', '/logos/sponsors/miss_bakers.svg'),
        ('PUSRI', '/logos/sponsors/pusri.svg');
      `);
      sponsorsSeeded = true;
    }

    // Seed Media Partners if empty
    const [mediaRows] = await connection.query("SELECT COUNT(*) as count FROM media_partners");
    const mediaCount = (mediaRows as unknown as { count: number }[])[0]?.count || 0;
    let mediaSeeded = false;

    if (mediaCount === 0) {
      await connection.query(`
        INSERT INTO media_partners (name, logo_url) VALUES
        ('HIMA IF', '/logos/media_partners/hima_if.svg'),
        ('HMI', '/logos/media_partners/hmi.svg'),
        ('CMS', '/logos/media_partners/cms.svg'),
        ('HMJ AOK', '/logos/media_partners/hmj_aok.svg'),
        ('BNCC', '/logos/media_partners/bncc.svg'),
        ('HIMA ILKOM FMIPA UNNES', '/logos/media_partners/hima_ilkom.svg');
      `);
      mediaSeeded = true;
    }

    // Seed Timeline if empty or outdated (< 17 items)
    const [timelineRows] = await connection.query("SELECT COUNT(*) as count FROM timeline");
    const timelineCount = (timelineRows as unknown as { count: number }[])[0]?.count || 0;
    let timelineSeeded = false;

    if (timelineCount < 17) {
      await connection.query("TRUNCATE TABLE timeline;");
      await connection.query(`
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
      `);
      timelineSeeded = true;
    }

    // Seed Events if empty
    const [eventRows] = await connection.query("SELECT COUNT(*) as count FROM events");
    const eventCount = (eventRows as unknown as { count: number }[])[0]?.count || 0;
    let eventsSeeded = false;

    if (eventCount === 0) {
      await connection.query(`
        INSERT INTO events (id, title, category, category_label, description, icon_type, badge_color, gform_url, guidebook_url, mascot_url) VALUES
        ('ml', 'Mobile Legends', 'kompetisi', 'KOMPETISI', 'Buktikan skill dan kerja sama timmu di arena Mobile Legends, raih kemenangan demi kemenangan.', 'gamepad', 'cyan', 'https://forms.google.com/', '', '/maskot/mascot-ml.png'),
        ('ff', 'Free Fire', 'kompetisi', 'KOMPETISI', 'Turun ke medan pertempuran Free Fire, jadi yang terakhir bertahan dan raih Booyah!', 'flame', 'pink', 'https://forms.google.com/', '', '/maskot/mascot-ff.png'),
        ('vibe-coding-comp', 'Vibe Coding Competition', 'kompetisi', 'KOMPETISI', 'Bangun aplikasi atau produk digital secepat mungkin menggunakan bantuan AI, untuk menciptakan kreativitas.', 'code', 'yellow', 'https://forms.google.com/', '', '/maskot/mascot-vibe-coding.png'),
        ('ctf-comp', 'Capture The Flag Competition', 'kompetisi', 'KOMPETISI', 'Uji kemampuan hacking dan keamanan sibermu dengan memecahkan berbagai tantangan CTF dari level pemula hingga expert.', 'shield', 'cyan', 'https://forms.google.com/', '', '/maskot/mascot-ctf.png'),
        ('photography-comp', 'Photography Competition', 'kompetisi', 'KOMPETISI', 'Tunjukkan sudut pandang kreatifmu lewat lensa kamera dan abadikan momen terbaik dalam kompetisi fotografi ini.', 'camera', 'pink', 'https://forms.google.com/', '', '/maskot/mascot-photography.png'),
        ('vibe-coding-training', 'Vibe Coding', 'pelatihan', 'PELATIHAN', 'Belajar membangun aplikasi dan produk digital secara cepat dengan bantuan AI, dari ide sampai jadi produk nyata.', 'code', 'yellow', 'https://forms.google.com/', '', '/maskot/mascot-vibe-coding.png'),
        ('cyber-security-training', 'Cyber Security', 'pelatihan', 'PELATIHAN', 'Pelajari dasar-dasar keamanan siber, mulai dari deteksi celah keamanan hingga teknik perlindungan sistem.', 'shield', 'cyan', 'https://forms.google.com/', '', '/maskot/mascot-ctf.png'),
        ('seminar-itfest', 'Seminar IT-Festival 2026', 'seminar', 'SEMINAR', 'Ikuti seminar kami dan dapatkan wawasan berharga langsung dari para ahli di bidang teknologi.', 'mic', 'pink', 'https://forms.google.com/', '', '/maskot/mascot-vibe-coding.png');
      `);
      eventsSeeded = true;
    }

    // Seed Speakers if empty
    const [speakerRows] = await connection.query("SELECT COUNT(*) as count FROM speakers");
    const speakerCount = (speakerRows as unknown as { count: number }[])[0]?.count || 0;
    let speakersSeeded = false;

    if (speakerCount === 0) {
      await connection.query(`
        INSERT INTO speakers (id, name, role, category, photo, photo_position, cv, color) VALUES
        ('avip-syaifulloh', 'Avip Syaifulloh, S.T.', 'CEO WPU Course', 'guest-star', '/speakers/avip-syaifulloh.jpg', 'center 25%', '/speakers/cv-avip-syaifulloh.pdf', 'pink'),
        ('rahmi-liza', 'Rahmi Liza, S.Tr.Kom., M.Sc.', 'Software Engineer', 'speaker', '/speakers/rahmi-liza.jpg', 'center 60%', '/speakers/cv-rahmi-liza.pdf', 'cyan');
      `);
      speakersSeeded = true;
    }

    await connection.end();

    return NextResponse.json({
      success: true,
      message: "Database `it_festival` dan seluruh tabel (`sponsors`, `media_partners`, `timeline`, `events`, `speakers`) berhasil disiapkan!",
      database: "it_festival",
      sponsorsSeeded,
      mediaSeeded,
      timelineSeeded,
      eventsSeeded,
      speakersSeeded,
    });
  } catch (error) {
    console.error("Database setup error:", error);
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message,
        hint: "Pastikan MySQL di Laragon sudah dinyalakan (Status: ON) dan berjalan di port 3306.",
      },
      { status: 500 }
    );
  }
}
