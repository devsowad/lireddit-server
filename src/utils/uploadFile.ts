import cloudinary, { UploadApiResponse } from 'cloudinary';
import { FileUpload } from 'graphql-upload';

export const uploadFile = async (
  file: FileUpload,
  options?: cloudinary.UploadApiOptions | undefined
) => {
  const { createReadStream } = await file;
  const fileStream = createReadStream();

  return new Promise<UploadApiResponse>((resolve, reject) => {
    const cloudStream = cloudinary.v2.uploader.upload_stream(
      options,
      function (err, fileUploaded) {
        if (err) {
          reject(err);
        }

        if (fileUploaded) {
          resolve(fileUploaded);
        }
      }
    );

    fileStream.pipe(cloudStream);
  });
};
