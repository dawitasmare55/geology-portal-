// db/seed.js
const bcrypt = require('bcryptjs');
const pool = require('./database');

const staff = [
  { name: "Amare Getaneh", rank: "MSc.", spec: "Hydrogeology", gender: "M", email: "amagetch@gmail.com" },
  { name: "Amare Kassie", rank: "PhD.", spec: "Economic Geology", gender: "M", email: "kassieamare7@gmail.com" },
  { name: "Belay Fentahun", rank: "MSc.", spec: "Economic Geology", gender: "M", email: "belfenn21@gmail.com" },
  { name: "Dawit Asmare", rank: "Assistant Professor", spec: "Engineering Geology", gender: "M", email: "dawitasmare55@gmail.com" },
  { name: "Siham Adem", rank: "MSc.", spec: "Petrology", gender: "F", email: "sihamadem33@gmail.com" },
  { name: "Yaregal Bayih", rank: "MSc.", spec: "Petrology", gender: "M", email: "yaregalbayih081@gmail.com" },
  { name: "Yohannes Gashu", rank: "MSc.", spec: "Hydrogeology", gender: "M", email: "yonaskalu21@gmail.com" },
  { name: "Biniyam Fentie", rank: "MSc.", spec: "Petrology", gender: "M", email: "biniamfentie@gmail.com" },
  { name: "Abraham Mulualem", rank: "MSc.", spec: "Geophysics", gender: "M", email: "muluabr2901@gmail.com" },
  { name: "Ajebush Wuletaw", rank: "MSc.", spec: "Economic Geology", gender: "F", email: "ajebushwuletaw21@gmail.com" },
  { name: "Temesgen Kinde", rank: "MSc.", spec: "Structural Geology", gender: "M", email: "temesgengeol87@gmail.com" },
  { name: "Bishaw Mihret", rank: "MSc.", spec: "Structural Geology", gender: "M", email: "bishawmihret2022@gmail.com" },
  { name: "Abraham Nigusie", rank: "BSc.", spec: "Paleontology", gender: "M", email: "abrham1914@gmail.com" },
  { name: "Birtukan Yalew", rank: "BSc.", spec: "Paleontology", gender: "F", email: "birtukanyalewu@gmail.com" },
  { name: "Likinaw Mengstie", rank: "MSc.", spec: "GIS and Remote Sensing", gender: "M", email: "liknawmengstie@gmail.com" },
  { name: "Birhane Girm", rank: "MSc.", spec: "Geochemistry", gender: "F", email: "birhanegiru80@gmail.com" },
  { name: "Birkitu Alemayehu", rank: "MSc.", spec: "Geochemistry", gender: "F", email: "birkitualemayehu3@gmail.com" },
  { name: "Yalemtsehay Tesfaw", rank: "TA", spec: "Technical Assistant", gender: "F", email: "muluabr2901@gmail.com" }
];

const students = [
  { name: "Asefa Yimenu", year: 2, id: "DMU-GEO-0201", username: "asefa.y" },
  { name: "Bageru Minalu", year: 2, id: "DMU-GEO-0202", username: "bageru.m" },
  { name: "Balemlay Teshome", year: 2, id: "DMU-GEO-0203", username: "balemlay.t" },
  { name: "Habtamu Zelalem", year: 2, id: "DMU-GEO-0204", username: "habtamu.z" },
  { name: "Manaye Kassa", year: 2, id: "DMU-GEO-0205", username: "manaye.k" },
  { name: "Samuel Yeshambel", year: 2, id: "DMU-GEO-0206", username: "samuel.y" },
  { name: "Solomon Teferi", year: 2, id: "DMU-GEO-0207", username: "solomon.t" },
  { name: "Tadele Delie", year: 2, id: "DMU-GEO-0208", username: "tadele.d" },
  { name: "Tiruneh Andualema", year: 2, id: "DMU-GEO-0209", username: "tiruneh.a" },
  { name: "Wondmne Getaye", year: 2, id: "DMU-GEO-0210", username: "wondmne.g" },
  { name: "Yibeltal Birhanu", year: 2, id: "DMU-GEO-0211", username: "yibeltal.b" },
  { name: "Ykeber Dagnaw", year: 2, id: "DMU-GEO-0212", username: "ykeber.d" },
  { name: "Yohannis Yenew", year: 2, id: "DMU-GEO-0213", username: "yohannis.y" },
  { name: "Yoseph Litgeb", year: 2, id: "DMU-GEO-0214", username: "yoseph.l" },
  { name: "Abebe Zewdu", year: 3, id: "DMU-GEO-0301", username: "abebe.z" },
  { name: "Alem Aschale", year: 3, id: "DMU-GEO-0302", username: "alem.a" },
  { name: "Anduamlak Yismaw", year: 3, id: "DMU-GEO-0303", username: "anduamlak.y" },
  { name: "Beireket Molla", year: 3, id: "DMU-GEO-0304", username: "beireket.m" },
  { name: "Belayneh Ewnetu", year: 3, id: "DMU-GEO-0305", username: "belayneh.e" },
  { name: "Fentahun Eshetie", year: 3, id: "DMU-GEO-0306", username: "fentahun.e" },
  { name: "Friezer Akemach", year: 3, id: "DMU-GEO-0307", username: "friezer.a" },
  { name: "Genet Endawoke", year: 3, id: "DMU-GEO-0308", username: "genet.e" },
  { name: "Gzachew Gucho", year: 3, id: "DMU-GEO-0309", username: "gzachew.g" },
  { name: "Kibru Gashew", year: 3, id: "DMU-GEO-0310", username: "kibru.g" },
  { name: "Molla Wubet", year: 3, id: "DMU-GEO-0311", username: "molla.w" },
  { name: "Simegnew Tadlo", year: 3, id: "DMU-GEO-0312", username: "simegnew.t" },
  { name: "Surafiel Tadele", year: 3, id: "DMU-GEO-0313", username: "surafiel.t" },
  { name: "Tesfaye Getachew", year: 3, id: "DMU-GEO-0314", username: "tesfaye.g" },
  { name: "Teshome Mengst", year: 3, id: "DMU-GEO-0315", username: "teshome.m" },
  { name: "Tilahun Dessie", year: 3, id: "DMU-GEO-0316", username: "tilahun.d" },
  { name: "Yalew Gedie", year: 3, id: "DMU-GEO-0317", username: "yalew.g" },
  { name: "Yibeltal Adamu", year: 3, id: "DMU-GEO-0318", username: "yibeltal.a" },
  { name: "Yichalal Tesfa", year: 3, id: "DMU-GEO-0319", username: "yichalal.t" },
  { name: "Yohannes Ayalew", year: 3, id: "DMU-GEO-0320", username: "yohannes.a" },
  { name: "Yohannis Getaw", year: 3, id: "DMU-GEO-0321", username: "yohannis.g" },
  { name: "Baynesagn Dessie", year: 4, id: "DMU-GEO-0401", username: "baynesagn.d" },
  { name: "Bimrew Ayele", year: 4, id: "DMU-GEO-0402", username: "bimrew.a" },
  { name: "Chale Shitu", year: 4, id: "DMU-GEO-0403", username: "chale.s" },
  { name: "Dessie Bialfew", year: 4, id: "DMU-GEO-0404", username: "dessie.b" },
  { name: "Matiwos Eshete", year: 4, id: "DMU-GEO-0405", username: "matiwos.e" },
  { name: "Simegnew Mekonen", year: 4, id: "DMU-GEO-0406", username: "simegnew.m" },
  { name: "Tegegne Tienaw", year: 4, id: "DMU-GEO-0407", username: "tegegne.t" }
];

async function seed() {
  try {
    console.log('🌱 Starting database seed...\n');

    // Hash passwords ONCE (same hash for all default passwords)
    const staffHash = await bcrypt.hash('staff123', 10);
    const studentHash = await bcrypt.hash('student123', 10);

    console.log('👨‍🏫 Adding staff...');
    for (const s of staff) {
      await pool.query(
        `INSERT INTO users (email, password_hash, full_name, role, rank, specialization, gender, needs_password_change)
         VALUES ($1, $2, $3, 'staff', $4, $5, $6, true)
         ON CONFLICT (email) DO NOTHING`,
        [s.email, staffHash, s.name, s.rank, s.spec, s.gender]
      );
    }
    console.log(`✅ ${staff.length} staff members added\n`);

    console.log('🎓 Adding students...');
    for (const s of students) {
      await pool.query(
        `INSERT INTO users (username, password_hash, full_name, role, student_id, year, needs_password_change)
         VALUES ($1, $2, $3, 'student', $4, $5, true)
         ON CONFLICT (username) DO NOTHING`,
        [s.username, studentHash, s.name, s.id, s.year]
      );
    }
    console.log(`✅ ${students.length} students added\n`);

    // Verify count
    const result = await pool.query('SELECT role, COUNT(*) FROM users GROUP BY role');
    console.log('📊 Total users in database:');
    result.rows.forEach(row => {
      console.log(`   ${row.role}: ${row.count}`);
    });

    console.log('\n🎉 Seed complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
}

seed();