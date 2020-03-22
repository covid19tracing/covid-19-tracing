# covid-19-tracing

## Static Website

## Uplaod Function

The upload mechanism is based on Google Cloud Functions and stores the uploaded files to a secured Google Cloud Storage Bucket. The cloud function gets create permissions only and can't read the bucket. This ensures full decoupling and high security of all stored location data.