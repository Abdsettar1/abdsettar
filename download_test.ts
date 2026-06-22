import fs from 'fs';
import https from 'https';

const url = 'https://drive.google.com/uc?export=download&id=1LPtzR65NazpV5FnVXjaLFLCJyHMqIm8V';
const dest = './drive_file.zip';

function downloadFile(fileUrl: string, fileDest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    https.get(fileUrl, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        // Handle redirect
        const redirectUrl = response.headers.location;
        if (redirectUrl) {
          downloadFile(redirectUrl, fileDest).then(resolve).catch(reject);
          return;
        }
      }

      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download file, status code: ${response.statusCode}`));
        return;
      }

      const fileStream = fs.createWriteStream(fileDest);
      response.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        console.log('Download complete!');
        resolve();
      });

      fileStream.on('error', (err) => {
        fs.unlink(fileDest, () => {});
        reject(err);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

downloadFile(url, dest)
  .then(() => {
    const stats = fs.statSync(dest);
    console.log(`Downloaded file size: ${stats.size} bytes`);
  })
  .catch((err) => {
    console.error('Error downloading file:', err);
  });
