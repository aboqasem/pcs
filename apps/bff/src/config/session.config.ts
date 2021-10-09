import connectPg from 'connect-pg-simple';
import expressSession from 'express-session';
import { config } from './config';
import { ormConfig } from './orm.config';

const PgStore = connectPg(expressSession);

export const session = expressSession({
  secret: config.COOKIE_SECRET,
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    secure: config.COOKIE_SECURE,
    maxAge: config.SHORT_COOKIE_MAX_AGE,
    sameSite: config.COOKIE_SAME_SITE,
    domain: config.COOKIE_DOMAIN,
  },
  store: new PgStore({
    conObject: {
      connectionString: ormConfig.url,
      ssl: ormConfig.ssl as any,
    },
    createTableIfMissing: true,
  }),
});
