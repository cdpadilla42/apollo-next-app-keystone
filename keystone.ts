import { config } from '@keystone-next/keystone/schema';
import {
  statelessSessions,
  withItemData,
} from '@keystone-next/keystone/session';
import { createAuth } from '@keystone-next/auth';

import { lists } from './schema';

let sessionSecret = process.env.SESSION_SECRET;

if (!sessionSecret) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'The SESSION_SECRET environment variable must be set in production'
    );
  } else {
    sessionSecret = 'JX8kC1xPZNuvJrabr4DXIP5cYLT43nRBzy0YSJTX';
  }
}

let sessionMaxAge = 60 * 60 * 24 * 360; // 1 year

const auth = createAuth({
  listKey: 'User',
  identityField: 'email',
  secretField: 'password',
  initFirstItem: {
    fields: ['name', 'email', 'password'],
    // TODO Add initial roles
  },
  // TODO add password reset link
});

export default auth.withAuth(
  config({
    server: {
      cors: {
        origin: [process.env.FRONTEND_URL as string],
        credentials: true,
      },
    },
    db: {
      adapter: 'mongoose',
      url: process.env.DATABASE_URL as string,
      onConnect: async (keystone) => {
        console.log('🍃 Connecting to DB');
        if (process.argv.includes('--seed-data')) {
          // TODO await insertSeedData(keystone);
        }
      },
    },
    ui: {
      // TODO: Tighten up with roles
      isAccessAllowed: (context) => !!context.session?.data,
    },
    lists,
    session: withItemData(
      statelessSessions({
        maxAge: sessionMaxAge,
        secret: sessionSecret,
      }),
      // TODO Add permisionsList to user session
      { User: 'name id email' }
    ),
  })
);
