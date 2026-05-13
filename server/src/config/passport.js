const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');

const env = require('./env');
const User = require('../features/users/user.model');

const allowedEmails = new Set(
  env.ALLOWED_EMAILS.split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
);

passport.use(
  new GoogleStrategy(
    {
      clientID: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/auth/google/callback',
      scope: ['profile', 'email'],
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value?.toLowerCase();
        if (!email) return done(new Error('Google profile missing email'));

        if (allowedEmails.size > 0 && !allowedEmails.has(email)) {
          return done(null, false, { message: 'not_authorized' });
        }

        const user = await User.findOneAndUpdate(
          { googleId: profile.id },
          {
            $set: {
              email,
              name: profile.displayName,
              avatarUrl: profile.photos?.[0]?.value,
            },
            $setOnInsert: { googleId: profile.id },
          },
          { new: true, upsert: true }
        );

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

module.exports = passport;
