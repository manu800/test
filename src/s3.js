const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
} = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  followRegionRedirects: true,
});

const Bucket = () => process.env.AWS_S3_BUCKET;

async function upload(key, buffer, mimetype) {
  await client.send(new PutObjectCommand({ Bucket: Bucket(), Key: key, Body: buffer, ContentType: mimetype }));
  return key;
}

async function getPresignedUrl(key, expiresIn = 3600) {
  return getSignedUrl(client, new GetObjectCommand({ Bucket: Bucket(), Key: key }), { expiresIn });
}

async function listFiles(prefix = '') {
  const res = await client.send(new ListObjectsV2Command({ Bucket: Bucket(), Prefix: prefix }));
  return (res.Contents || []).map(({ Key, Size, LastModified }) => ({ key: Key, size: Size, lastModified: LastModified }));
}

async function deleteFile(key) {
  await client.send(new DeleteObjectCommand({ Bucket: Bucket(), Key: key }));
}

module.exports = { upload, getPresignedUrl, listFiles, deleteFile };
