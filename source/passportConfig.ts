import bcrypt from 'bcrypt';
import User, { UserInterface } from './models/User';

// const LocalStrategy = passportLocal.Strategy;
const Web3Strategy = require('passport-web3');

module.exports = function (passport: any) {
    const onAuth = async (address: string, done: any) => {
        // optional additional validation. To deny auth:
        // done(new Error('User is not authorized.'));
        const hashedAddress = await bcrypt.hash(address, 10);
        User.findOne({ hashedAddress }, (err: Error, user: UserInterface) => done(err, user));
    };
    const web3Strategy = new Web3Strategy(onAuth);

    passport.use(web3Strategy);

    /** Auth with Passport js */
    // router.use(passport.initialize());
    // router.use(passport.session);
    // passport.use(new LocalStrategy((address, _, done) => {
    //     User.findOne({ walletAddress: address }, (err: Error, user: UserInterface) => {
    //         if (err) done(new Error('Internal error.'));
    //         if (!user) done(new Error('User is not authorized.'));
    //         bcrypt.compare(address, user.walletAddress, (err, result) => {
    //             if (result === true) {
    //                 return done(null, user);
    //             } else {
    //                 return done(null, false);
    //             }
    //         });
    //     });
    // }));
    // serialize and deserialize??

    passport.serializeUser((user: UserInterface, cb: any) => {
        cb(null, user.walletAddress);
    });

    passport.deserializeUser((id: any, cb: any) => {
        User.findOne({ _id: id }, (err: Error, user: UserInterface) => {
            cb(err, user);
        })
    })

}