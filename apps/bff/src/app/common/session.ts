import connectPg from 'connect-pg-simple';
import session from 'express-session';
import config from '../config/config';
import ormConfig from '../config/orm.config';

const PgSession = connectPg(session);

export default session({
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
  store: new PgSession({
    conObject: {
      connectionString: ormConfig.url,
      ssl: ormConfig.ssl as any,
    },
    createTableIfMissing: true,
  }),
});
