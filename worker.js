import { ObjectId } from 'mongodb';
import Bull from 'bull';
import fs from 'fs';
import imageThumbnail from 'image-thumbnail';
import dbClient from './utils/db';

const fileQueue = new Bull('fileQueue', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
  },
});

fileQueue.process('generateThumbnail', async (job) => {
  const { fileId, userId } = job.data;

  if (!fileId) {
    throw new Error('Missing fileId');
  }

  if (!userId) {
    throw new Error('Missing userId');
  }

  const file = await dbClient.db.collection('files').findOne({
    _id: new ObjectId(fileId),
    userId: new ObjectId(userId),
  });

  if (!file) {
    throw new Error('File not found');
  }

  if (!file.localPath || !fs.existsSync(file.localPath)) {
    throw new Error('Local file not found');
  }

  const thumbnailSizes = [500, 250, 100];

  const thumbnailPromises = thumbnailSizes.map(async (size) => {
    try {
      const thumbnail = await imageThumbnail(file.localPath, { width: size });
      const thumbnailPath = `${file.localPath}_${size}`;
      fs.writeFileSync(thumbnailPath, thumbnail);
    } catch (error) {
      console.error(`Error generating thumbnail for size ${size}:`, error);
    }
  });

  await Promise.all(thumbnailPromises);
});

console.log('Worker listening for thumbnail generation jobs...');
