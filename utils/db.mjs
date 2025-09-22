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
            return await this.db.collection('users').countDocuments();
        }
        return 0;
    }

    async nbFiles() {
        if (this.db) {
            return await this.db.collection('files').countDocuments();
        }
        return 0;
    }
}

const dbClient = new DBClient();
export default dbClient;