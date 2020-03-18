
exports.uploadLocation = (req, res) => {
  let token = req.query.token;
  let locationData = JSON.parse(req.body);

  res.header("Access-Control-Allow-Origin", "*"); 

  if (token == "test" && locationData.length > 0) {
    res.status(200).send(locationData.length+" received");
  } else {
    res.status(200).send('sorry');
  }

};