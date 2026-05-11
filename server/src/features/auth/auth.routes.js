const { Router } = require('express');
const passport = require('../../config/passport');

const env = require('../../config/env');
const requireAuth = require('../../middleware/requireAuth');
const { googleCallback, me, logout, removeMe } = require('./auth.controller');

const router = Router();

router.get(
  '/google',
  passport.authenticate('google', { session: false, scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${env.CLIENT_URL}/login?error=oauth`,
  }),
  googleCallback
);

router.get('/me', requireAuth, me);
router.delete('/me', requireAuth, removeMe);
router.post('/logout', logout);

module.exports = router;
