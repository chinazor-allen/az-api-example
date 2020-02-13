var express = require('express');
var passport = require('passport')
var BearerStrategy = require('passport-azure-ad').BearerStrategy


let tenantID= `${process.env.tenantID}`
let clientID= `${process.env.clientID}`
let audience= `${process.env.audience}`

let options = {
    identityMetadata: `https://login.microsoftonline.com/${process.env.tenantID}/v2.0/well-known/openid-configuration'`,
    
    // Required, the client ID of your app in AAD
    clientID: `${process.env.clientID}`,

    // Required if you want to provide the issuer(s) you want to validate instead of using the issuer from metadata
    // issuer could be a string or an array of strings of the following form: 'https://sts.windows.net/<tenant_guid>/v2.0'
    issuer: `https://sts.windows.net/${process.env.tenantID}/`,

    // The additional scopes we want besides 'openid'.
    scope: ['user_impersonation'],

    // Optional, 'error', 'warn' or 'info'
    loggingLevel: 'info',
    passReqToCallback: false
}

let bearerStrategy = new BearerStrategy(options, (token, done) => {
    done(null, {}, token)
})

var app = express();
app.use(require('morgan')('combined'));
app.use(passport.initialize());
passport.use(bearerStrategy);

app.use((req, res, next) => {
    res.header('Access-Control-Allow-origin', '*');
    res.header(
        'Acess-Control-Allow-Headers',
        'Authorization, Origin, X-Requested-With, Content-Type, Accept'
    );
    next();
})


app.all(
    '/',
    passport.authenticate('oauth-bearer', { session: false}),
    (req, res) => {
        let claims = req.authinfo;
        console.log('User info: ', req.user);
        console.log('Validated claims: ', claims);
        res.status(200).json({ name: claims['name']});
    }
);

let port = process.env.port || 4000;
app.listen(port, () => {
    console.log(`listening on port ${port}` )
});