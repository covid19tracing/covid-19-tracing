const {Storage} = require('@google-cloud/storage');
const Token = require('./token');

const locationHistoryBucketName = "covid-19-tracing-location-history";

const storage = new Storage();
const bucket = storage.bucket(locationHistoryBucketName);

const generateFileToken = function() {
  let chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let tokenlen = 6;
  return Array(tokenlen).fill(chars).map(function(x) { return x[Math.floor(Math.random() * x.length)] }).join('');
};

const storeData = function(data,dataWritten) {
  
  const fileToken = data.Token ? data.Token : generateFileToken();
  const filename = fileToken + "_" + new Date().toISOString() + ".json";

  const blob = bucket.file(filename.toLowerCase().replace(/[^a-z0-9\._-]/g, '_'));
  const blobStream = blob.createWriteStream({resumable: false});

  blobStream.on('error', err => {
    console.log(err);
  });

  blobStream.on('finish', () => {
    dataWritten(fileToken);
  });

  blobStream.end(data);
};

exports.uploadLocation = (req, res) => {
  res.header("Access-Control-Allow-Origin", "*"); 

  let locationData = req.body;

  if (locationData.length > 0) {
    storeData(
      locationData, function(fileToken) {
        res.status(200).send({
          "datareceived" : locationData.length,
          "filetoken" : fileToken
        });
      }
    );
  } else {
    res.status(400).send('data invalid');
  }

};