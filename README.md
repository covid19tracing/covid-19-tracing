# covid-19-tracing

# This project is discontinued. Feel free to use it and drop us a message in case you have a question or comment.

## Static Website

Based on hugo, hosted on netlify. go to `website-hugo` and run the following commands:

- `make build` to build the website using hugo in a docker
- `make watch` to work in dev mode (hugo docker is started, changes are detected and rebuild is triggered automatically)

In dev mode the website is available at http://localhost:1313

### Deployment of the website

Is triggered automatically with every push to master. Netlify builds the website (using hugo) and deploys it automatically after ever push.

## Uplaod Function

The upload mechanism is based on Google Cloud Functions and stores the uploaded files to a secured Google Cloud Storage Bucket. The cloud function gets create permissions only and can't read the bucket. This ensures full decoupling and high security of all stored location data.

## Generation of tokens

go to `upload/src/covid-19-tracing-upload-function` and execute `make pwgen` (pwgen is required on the system). 1000 tokens are written to `tokens.json` which has to be uploaded to the tokens bucket in Google Cloud. The function is fetching the tokens file while starting.

## Data Handling

- `make datasync` downloads all json files from the gcp bucket (gcp access and gcloud utils required)
- `make map` runs the python file to generate the heatmap based on the json files in dir `datafiles`
- to adapt the python file run `jupiter notebook` and adapt the jupiter file. after that run `make jupiter2python` to generate the raw python file for command line execution

## More information and authors

- Tiago Ferreira
- Wolfgang Gassler
- more on https://covid19tracing.org/about

