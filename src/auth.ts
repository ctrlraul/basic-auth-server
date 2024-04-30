import * as passport from 'passport';
import { Strategy as GoogleStrategy, VerifyFunctionWithRequest } from 'passport-google-oauth2';
import { env } from './env';
import { database } from './database';


const googleAuthCallback: VerifyFunctionWithRequest = async (request, accessToken, refreshToken, profile, done) => {

    try
    {
        let user = await database.getUserForGoogleId(profile.id);

        if (user == null) {
            console.log("Creating user...");
            await database.createUserForGoogleId(profile.id);
            user = await database.getUserForGoogleId(profile.id);
        } else {
            console.log("User exists!");
        }

        console.log('User:', user?.displayName);
        done(null, user);
    }
    catch(e: any)
    {
        console.error(e);
        done(e.message, null);
    }

};


passport.use(
    new GoogleStrategy({
        clientID: env('GOOGLE_AUTH_APP_ID'),
        clientSecret: env('GOOGLE_AUTH_KEY'),
        callbackURL: '/auth/google/return',
        passReqToCallback: true
    }, googleAuthCallback)
);

passport.serializeUser((user: any, done) => {
    console.log("serializeUser:", user ? user.displayName : null);
    done(null, user.id);
});

passport.deserializeUser(async (userId: any, done) => {
    const user = await database.getUserForId(userId);
    console.log("deserializeUser:", user?.displayName);
    done(null, user);
});
