const passport = require('passport');
const { User } = require('../models');
const local = require('./localStrategy');
const redis = require('../models/redis');

const db = new redis();

module.exports = () => {
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            if(await db.users.exists(id)) {
                const user = await db.users.get(id);
                done(null, user);
            } else {
                const error = new Error(`${id} NOT EXISTS IN USER`);
                error.status = 404;
            }
        } catch(err) {
            done(err);
        }
    });
}