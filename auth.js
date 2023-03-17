let authorization = {}
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const auth = require('basic-auth');
var privKey = crypto.randomBytes(64).toString('hex');

authorization.keygen = function(){
    var ACCESS_TOKEN_SECRET = crypto.randomBytes(64).toString('hex');
    var token = jwt.sign({data:ACCESS_TOKEN_SECRET}, privKey,{ expiresIn: '1h'});
    return token;
};

authorization.authenticate = function(token){
    try {
        const verified = jwt.verify(token, privKey);
        if(verified){
            return true;
        }
    } catch (error) {
        // Access Denied
        return false;
    }
};

authorization.validateToken = function(req){
    try{
        this.authenticate(req.headers.authorization.split(" ")[1]);
    }catch(err){
        return false;
    }
    return true;
}

authorization.auth = auth;
module.exports = authorization;