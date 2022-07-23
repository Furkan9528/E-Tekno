const LocalStrategy = require('passport-local').Strategy
const User = require('../models/user')
const bcrypt = require('bcrypt')
const req = require('express/lib/request')

function init(passport){
    passport.use(new LocalStrategy({ usernameField: 'email'}, async (email, password, done ) => {
            // Login
            // check if email exists
            const user = await User.findOne({ email: email })
            if(!user){
                return done(null, false, { message: 'Aucun utilisateur avec cet e-mail'})
            }

            bcrypt.compare(password, user.password).then(match => {
                if(match){
                    return done(null, user, { message: 'Vous vous êtes connecté avec succès'})
                }
                return done(null, false, {message: 'Mauvais utilisateur ou mot de passe'})
            }).catch(err => {
                return done(null, false, {message: "Quelque chose s'est mal passé"})
            })
        }))
        passport.serializeUser((user, done) => {
            done(null, user._id)
        })
        passport.deserializeUser((id, done) => {
            User.findById(id, (err, user) => {
                done(err, user)
            })
        })
}

module.exports  = init 