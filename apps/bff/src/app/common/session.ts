import connectPg from 'connect-pg-simple';
import session from 'express-session';
import config, { NodeEnv } from '../config/config';

const PgSession = connectPg(session);

export default session({
  secret: config.COOKIE_SECRET,
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    secure: config.NODE_ENV === NodeEnv.PRODUCTION,
    maxAge: config.SHORT_COOKIE_MAX_AGE,
    sameSite: config.COOKIE_SAME_SITE,
  },
  store: new PgSession({ conString: config.DB_URL() }),
});
