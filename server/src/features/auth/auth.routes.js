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

router.get('/google/callback', (req, res, next) => {
  passport.authenticate('google', { session: false }, (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      const reason = info?.message === 'not_authorized' ? 'not_authorized' : 'oauth';
      return res.redirect(`${env.CLIENT_URL}/login?error=${reason}`);
    }
    req.user = user;
    return googleCallback(req, res);
  })(req, res, next);
});

router.get('/me', requireAuth, me);
router.delete('/me', requireAuth, removeMe);
router.post('/logout', logout);

module.exports = router;
