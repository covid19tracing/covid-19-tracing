const {Storage} = require('@google-cloud/storage');

const globalToken = "test";
const bucketName = "location-history";

const storeData = function(token,data,dataWritten) {
  const storage = new Storage();
  const bucket = storage.bucket(bucketName);

  const filename = token + "_" + new Date().toISOString() + ".json";

  const blob = bucket.file(filename.toLowerCase().replace(/[^a-z0-9\._-]/g, '_'));
  const blobStream = blob.createWriteStream({resumable: false});

  blobStream.on('error', err => {
    console.log(err);
  });

  blobStream.on('finish', () => {
    dataWritten();
  });

  blobStream.end(data);
};

exports.uploadLocation = (req, res) => {
  let token = req.query.token;

  if (token === globalToken) {
    let locationData = req.body;

    if (locationData.length > 0) {
      storeData(
        token,locationData, function() {
          res.header("Access-Control-Allow-Origin", "*"); 
          res.status(200).send(locationData.length+" bytes received, thanks");
        }
      );
    } else {
      res.status(200).send('data invalid');
    }
  } else {
    res.status(200).send('sorry');
  }

};