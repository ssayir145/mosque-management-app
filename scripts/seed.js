// Dev seed: demo admin/caretaker users, sample households, a week of prayer
// times, and a couple of announcements. Safe to re-run (upserts by unique key).
require('dotenv').config();
const { Client } = require('pg');
const bcrypt = require('bcryptjs');

const DEMO_ADMIN_PASSWORD = 'Admin@123';
const DEMO_CARETAKER_PASSWORD = 'Caretaker@123';
const DEMO_RESIDENT_PASSWORD = 'Resident@123';

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL is not set. Copy .env.example to .env and fill it in.');
    process.exit(1);
  }

  const client = new Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });
  await client.connect();

  try {
    const adminHash = await bcrypt.hash(DEMO_ADMIN_PASSWORD, 10);
    const caretakerHash = await bcrypt.hash(DEMO_CARETAKER_PASSWORD, 10);
    const residentHash = await bcrypt.hash(DEMO_RESIDENT_PASSWORD, 10);

    await client.query(
      `INSERT INTO users (email, password_hash, role, full_name)
       VALUES ($1, $2, 'admin', 'Mosque Admin')
       ON CONFLICT (lower(email)) DO NOTHING`,
      ['admin@mosque.local', adminHash]
    );
    await client.query(
      `INSERT INTO users (email, password_hash, role, full_name)
       VALUES ($1, $2, 'caretaker', 'Mosque Caretaker')
       ON CONFLICT (lower(email)) DO NOTHING`,
      ['caretaker@mosque.local', caretakerHash]
    );

    const households = [
      { name: 'Rahman Household', contact: 'Yusuf Rahman', phone: '+15550001111', address: '12 Elm St', monthly: 50 },
      { name: 'Siddiqui Household', contact: 'Amina Siddiqui', phone: '+15550002222', address: '48 Oak Ave', monthly: 75 },
      { name: 'Khan Household', contact: 'Bilal Khan', phone: '+15550003333', address: '9 Maple Dr', monthly: 40 },
    ];

    const householdIds = [];
    for (const h of households) {
      const { rows } = await client.query(
        `INSERT INTO households (name, contact_person, phone, address, password_hash, monthly_contribution, next_due_date)
         VALUES ($1, $2, $3, $4, $5, $6, date_trunc('month', CURRENT_DATE) + interval '1 month')
         ON CONFLICT (phone) DO UPDATE SET name = EXCLUDED.name
         RETURNING id`,
        [h.name, h.contact, h.phone, h.address, residentHash, h.monthly]
      );
      householdIds.push(rows[0].id);
    }

    // Give two households an outstanding balance so the admin dashboard has data to show.
    if (householdIds[0]) {
      await client.query(
        `INSERT INTO charges (household_id, amount, charge_date) VALUES ($1, $2, date_trunc('month', CURRENT_DATE))`,
        [householdIds[0], 50]
      );
      await client.query(
        `UPDATE households SET current_balance = current_balance + 50, next_due_date = CURRENT_DATE - interval '10 days' WHERE id = $1`,
        [householdIds[0]]
      );
    }
    if (householdIds[1]) {
      await client.query(
        `INSERT INTO charges (household_id, amount, charge_date) VALUES ($1, $2, date_trunc('month', CURRENT_DATE))`,
        [householdIds[1], 75]
      );
      await client.query(
        `UPDATE households SET current_balance = current_balance + 75, next_due_date = CURRENT_DATE - interval '3 days' WHERE id = $1`,
        [householdIds[1]]
      );
    }

    // A week of prayer times, today +/- a few days.
    const prayerRows = [
      ['-1', '05:10', '13:00', '16:30', '19:45', '21:00'],
      ['0', '05:12', '13:00', '16:31', '19:44', '21:01'],
      ['1', '05:13', '13:00', '16:32', '19:43', '21:02'],
      ['2', '05:14', '13:00', '16:33', '19:42', '21:03'],
      ['3', '05:15', '13:00', '16:34', '19:41', '21:04'],
      ['4', '05:16', '13:00', '16:35', '19:40', '21:05'],
      ['5', '05:17', '13:00', '16:36', '19:39', '21:06'],
    ];
    for (const [offset, fajr, zuhr, asr, maghrib, isha] of prayerRows) {
      await client.query(
        `INSERT INTO prayer_times (date, fajr, zuhr, asr, maghrib, isha)
         VALUES (CURRENT_DATE + $1::int, $2, $3, $4, $5, $6)
         ON CONFLICT (date) DO UPDATE SET fajr = EXCLUDED.fajr, zuhr = EXCLUDED.zuhr, asr = EXCLUDED.asr, maghrib = EXCLUDED.maghrib, isha = EXCLUDED.isha`,
        [offset, fajr, zuhr, asr, maghrib, isha]
      );
    }

    await client.query(
      `INSERT INTO announcements (title, content, category, active)
       SELECT 'Jummah Reminder', 'Jummah prayer starts at 1:15 PM this Friday. Please arrive early for parking.', 'general', TRUE
       WHERE NOT EXISTS (SELECT 1 FROM announcements WHERE title = 'Jummah Reminder')`
    );
    await client.query(
      `INSERT INTO announcements (title, content, category, active)
       SELECT 'Roof Repair Completed', 'Alhamdulillah, the roof repair project funded by the community has been completed.', 'maintenance', TRUE
       WHERE NOT EXISTS (SELECT 1 FROM announcements WHERE title = 'Roof Repair Completed')`
    );

    console.log('Seed complete.');
    console.log('Demo logins:');
    console.log(`  Admin:      admin@mosque.local / ${DEMO_ADMIN_PASSWORD}`);
    console.log(`  Caretaker:  caretaker@mosque.local / ${DEMO_CARETAKER_PASSWORD}`);
    console.log(`  Resident:   +15550001111 / ${DEMO_RESIDENT_PASSWORD}`);
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
