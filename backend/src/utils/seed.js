require('dotenv').config();

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Review = require('../models/Review');

const SAMPLE_CODE = `function getUser(db, id) {
  const query = "SELECT * FROM users WHERE id = " + id;
  return db.exec(query);
}`;

async function seed() {
  await connectDB();
  await Promise.all([User.deleteMany({}), Review.deleteMany({})]);

  const passwordHash = await User.hashPassword('Password123!');
  const [demo, admin] = await User.create([
    { name: 'Demo Developer', email: 'demo@codesense.ai', passwordHash, role: 'user' },
    { name: 'Admin', email: 'admin@codesense.ai', passwordHash, role: 'admin' },
  ]);

  await Review.create([
    {
      userId: demo._id,
      title: 'User lookup query',
      language: 'javascript',
      code: SAMPLE_CODE,
      status: 'completed',
      result: {
        overallScore: 6.3,
        summary: 'Functional but contains a critical SQL injection vulnerability.',
        issues: [
          {
            severity: 'critical',
            line: 2,
            message: 'SQL injection risk: user input concatenated into the query string.',
            suggestion: 'Use a parameterised query: db.exec("SELECT * FROM users WHERE id = ?", [id]).',
          },
          {
            severity: 'warning',
            line: 1,
            message: 'No input validation on the id parameter.',
            suggestion: 'Validate that id is a positive integer before querying.',
          },
        ],
        improvements: [
          {
            title: 'Parameterise the query',
            description: 'Prevents injection and lets the driver cache the query plan.',
            codeSnippet: 'return db.exec("SELECT * FROM users WHERE id = ?", [id]);',
          },
        ],
        strengths: ['Small, single-purpose function', 'Clear naming'],
      },
    },
    {
      userId: demo._id,
      title: 'Async fetch helper',
      language: 'typescript',
      code: 'export const fetchJson = async (u: string) => (await fetch(u)).json();',
      status: 'completed',
      result: {
        overallScore: 7.8,
        summary: 'Concise helper, but missing error handling for non-2xx responses.',
        issues: [
          {
            severity: 'warning',
            line: 1,
            message: 'Response status is never checked before parsing JSON.',
            suggestion: 'Throw when !res.ok so callers can handle failures.',
          },
        ],
        improvements: [],
        strengths: ['Terse and readable', 'Properly typed input'],
      },
    },
  ]);

  console.log('Seed complete.');
  console.log('  demo@codesense.ai / Password123!');
  console.log('  admin@codesense.ai / Password123!');
  await mongoose.disconnect();
}

seed().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect();
  process.exit(1);
});
