import mongo from 'mongodb';

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'files_manager';
    const url = `mongodb://${host}:${port}/`;
    this.client = new mongo.MongoClient(url);
    this.db = null;

    this.client.connect((error, client) => {
      if (error) {
        console.log('Error connecting to MongoDB:', error);
      } else {
        console.log('Connected to MongoDB');
        this.db = client.db(database);
      }
    });
  }

  isAlive() {
    return this.client.isConnected();
  }

  async nbUsers() {
    if (this.db) {
      return this.db.collection('users').countDocuments();
    }
    return 0;
  }

  async nbFiles() {
    if (this.db) {
      return this.db.collection('files').countDocuments();
    }
    return 0;
  }

  async findUserByEmail(email) {
    if (this.db) {
      return this.db.collection('users').findOne({ email });
    }
    return null;
  }
  
  async createUser(email, password) {
    if (this.db) {
      const result = await this.db.collection('users').insertOne({ email, password });
      return { _id: result.insertedId, email, password };
    }
    return null;
  }

  async findUserById(id) {
    if (this.db) {
      return this.db.collection('users').findOne({ _id: new mongo.ObjectId(id) });
    }
    return null;
  }

  async createFile(name, type, parentId, isPublic, data, userId) {
    if (this.db) {
      const file = {
        userId: new mongo.ObjectId(userId),
        name,
        type,
        isPublic: isPublic || false,
        parentId: parentId || 0,
        localPath: null
      };
      
      if (type !== 'folder') {
        const fs = require('fs');
        const path = require('path');
        const { v4: uuidv4 } = require('uuid');
        
        const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
        const fileName = uuidv4();
        const localPath = path.resolve(folderPath, fileName);
        
        if (!fs.existsSync(folderPath)) {
          fs.mkdirSync(folderPath, { recursive: true });
        }
        
        const fileData = Buffer.from(data, 'base64');
        fs.writeFileSync(localPath, fileData);
        
        file.localPath = localPath;
      }

      const result = await this.db.collection('files').insertOne(file);
      return { ...file, _id: result.insertedId };
    }
    return null;
  }

  async findFileById(id) {
    if (this.db) {
      return this.db.collection('files').findOne({ _id: new mongo.ObjectId(id) });
    }
    return null;
  }
}

const dbClient = new DBClient();
export default dbClient;
