import { Router } from 'express';
import passport from 'passport';
import './auth';

export const router = Router();

router.get('/google', passport.authenticate('google', {
    scope: ['profile']
}));

router.get('/google/return', passport.authenticate('google', {
    successReturnToOrRedirect: '/',
    failureRedirect: '/auth/error'
}));
