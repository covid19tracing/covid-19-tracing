from google.cloud import storage

target_blob_folder = "datafiles"
bucket_name = "covid-19-tracing-location-history"


def download_location_blobs():

    storage_client = storage.Client()

    bucket = storage_client.bucket(bucket_name)
    for blob in bucket.list_blobs():
        blob_name = blob.name
        destination_file_name = "{}/{}".format(target_blob_folder, blob_name)
        blob = bucket.blob(blob_name)
        blob.download_to_filename(destination_file_name)

        print(
            "Blob {} downloaded to {}.".format(
                blob_name, destination_file_name
            )
        )


if __name__ == '__main__':
    download_location_blobs()