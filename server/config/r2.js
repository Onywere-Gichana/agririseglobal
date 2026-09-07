const path = require('path');
const crypto = require('crypto');
const { S3Client } = require('@aws-sdk/client-s3');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const required = ['ACCESS_KEY_ID', 'SECRET_ACCESS_KEY', 'ACCOUNT_ID', 'BUCKET_NAME'];
const missing = required.filter((name) => !process.env[name]);
if (missing.length) throw new Error(`Missing R2 environment variables: ${missing.join(', ')}`);

const endpoint = `https://${process.env.ACCOUNT_ID}.r2.cloudflarestorage.com`;
const r2 = new S3Client({
  region: 'auto',
  endpoint,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
  },
});

const publicBaseUrl = (process.env.R2_PUBLIC_URL || '').replace(/\/$/, '');

function createObjectKey(originalName, prefix = 'uploads') {
  const extension = path.extname(originalName || '').toLowerCase();
  return `${prefix}/${Date.now()}-${crypto.randomBytes(8).toString('hex')}${extension}`;
}

function getObjectUrl(key, request) {
  if (publicBaseUrl) return `${publicBaseUrl}/${key}`;
  const baseUrl = process.env.SERVER_URL || `${request.protocol}://${request.get('host')}`;
  return `${baseUrl}/api/uploads/object/${key.split('/').map(encodeURIComponent).join('/')}`;
}

module.exports = { r2, bucketName: process.env.BUCKET_NAME, createObjectKey, getObjectUrl };