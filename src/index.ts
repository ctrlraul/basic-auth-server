import express from 'express';
import expressSession from 'express-session';
import passport from 'passport';
import Knex from 'knex';
import connectSessionStore from 'connect-session-knex';
import { env } from './env';
import { database } from './database';
import { Strategy as GoogleStrategy, VerifyFunctionWithRequest } from 'passport-google-oauth2';


const KnexSessionStore = connectSessionStore(expressSession);
const PORT = env('PORT');
const app = express();
const knex = Knex({
    client: 'sqlite3',
    connection: {
        filename: 'sessions.db',
    },
    useNullAsDefault: false // Just hides a warning
});


app.use(expressSession({
	secret: 'kitkatthebestkindakat',
	resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
    },
    store: new KnexSessionStore({ knex }),
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(passport.authenticate('session'));

app.get('/', (req, res) => {
    res.json({
        user: req.user ? req.user : '<not authenticated>',
        headers: req.headers
    });
});

app.get('/auth/google', passport.authenticate('google', { scope: ['profile'] }));

app.get('/auth/google/callback', 
    passport.authenticate('google', { failureRedirect: '/login' }),
    function(req, res) {
        // Successful authentication, redirect home.
        res.redirect('/');
    }
);

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});


passport.serializeUser((user: any, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id: any, done) => {
    try {
        const user = await database.getUserForId(id)
        done(null, user);
    }
    catch (e) {
        done(e, null);
    }
});

passport.use(new GoogleStrategy({
    clientID: env('GOOGLE_AUTH_APP_ID'),
    clientSecret: env('GOOGLE_AUTH_KEY'),
    callbackURL: '/auth/google/callback',
    passReqToCallback: true
},
    async function(request, accessToken, refreshToken, profile, done) {

        try
        {
            let user = await database.getUserForGoogleId(profile.id);

            if (user == null) {
                await database.createUserForGoogleId(profile.id);
                user = await database.getUserForGoogleId(profile.id);
            }

            done(null, user);
        }
        catch(e: any)
        {
            done(e, null);
        }

    } as VerifyFunctionWithRequest
));
