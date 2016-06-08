var ms = require('ms');


module.exports = {

    port: 8000,

    database: {
        connection: 'mongodb://localhost:27017/starter_kit'
    },

    auth: {
        activationTokenExpiresIn: ms('1d'),
        resetPasswordTokenExpiresIn: ms('1d'),
    },

    jwt: {
        secret: process.env.TOKEN_SECRET || 'some jwt secret',
        algorithm: process.env.TOKEN_ALGORITHM || 'HS256',
        issuer: process.env.TOKEN_ISSUER || 'vobi',
        audience: process.env.TOKEN_AUDIENCE || 'vobi',
        expiresIn: process.env.TOKEN_EXPIRES || ms('1d')
    },
    
    mailService: require('../api/services/consoleMailService'),
    systemEmail: 'giga.chkhikvadze@gmail.com'
};