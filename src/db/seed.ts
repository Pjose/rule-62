import 'dotenv/config';
import { db, schema } from './index';

// Optional helper: creates a demo org you can sign into right after deploying.
// Run with: npm run db:seed
async function main() {
  const [org] = await db
    .insert(schema.orgs)
    .values({
      name: 'Demo Group',
      slug: 'demo-group',
      inviteCode: 'DEMO-1234',
    })
    .returning();

  console.log(`Created demo org "${org.name}" with invite code ${org.inviteCode}.`);
  console.log('Sign up at /signup to become its first admin, or /join with the invite code above.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => process.exit(0));
