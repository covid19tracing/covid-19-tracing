const {Storage} = require('@google-cloud/storage');

const locationTokensBucketName = "covid-19-tracing-tokens";

const storage = new Storage();
const bucket = storage.bucket(locationTokensBucketName);

let tokens = [];

const loadTokens = function() {
    return new Promise(function(resolve, reject) {
        bucket.file('tokens.json').download(function(err, contents) {
            if (err) {
                reject(err);
            } else {
                tokens = JSON.parse(contents);
                resolve();
            }
       }); 
    });
};

const getTokens = function() {
    return new Promise(function(resolve, reject) {
        if (tokens.length > 0) {
            resolve(tokens);
        } else {
            loadTokens().then(function() {
                resolve(tokens);
            }, reject);
        }
    });
}

exports.isValid = function(token) {
    return new Promise(function(resolve, reject) {
        getTokens().then(tokens => {
            if (tokens[token] !== undefined) {
                resolve();
            } else {
                reject();
            }
        }, err => {
            console.log(err);
        });
      });      
};
