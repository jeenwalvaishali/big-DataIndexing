let authorization = {}
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const auth = require('basic-auth');
const { v4: uuidv4 } = require('uuid');

const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048, 
    publicKeyEncoding: {
        type: 'pkcs1',     
        format: 'pem'       
    },
    privateKeyEncoding: {
        type: 'pkcs1',     
        format: 'pem',     
    }
});

var name = uuidv4();
var issuedAt = Math.floor(Date.now() / 1000);
const EXPIRATION_TIME = 3600;
var expiresAt = issuedAt + (EXPIRATION_TIME * 1000);
console.log("exp", expiresAt)

authorization.generateToken = function(){
    var header = {
        "alg": "RS256",
        "typ": "JWT"
    };

      var payload = {
        name: name,
        iat: issuedAt,
        exp: expiresAt
      };

    var token = jwt.sign(payload, privateKey, { algorithm: 'RS256', header: header });
    return token;
};


authorization.authenticateToken = function(token){
    try {
        const decoded = jwt.verify(token, publicKey, { algorithms: ['RS256'] });
        console.log("decoded", decoded)
        return true;
    } catch (err) {
        console.log("errin authencation",err)
        return false;
    }
}


authorization.validateToken = function(req){
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        return this.authenticateToken(token);
    } else {
        console.log("authheader")
        return false; 
    }
}

authorization.auth = auth;
module.exports = authorization;