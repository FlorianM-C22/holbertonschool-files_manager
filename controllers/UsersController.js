import dbClient from '../utils/db';
import sha1 from 'sha1';

class UsersController {
    static async postNew(req, res) {
        const { email, password } = req.body;
        if (!email) {
            return res.status(400).json({ error: 'Missing email' });
        }
        if (!password) {
            return res.status(400).json({ error: 'Missing password' });
        }
        if (await dbClient.findUserByEmail(email)) {
            return res.status(400).json({ error: 'Already exist' });
        }
        const user = await dbClient.createUser(email, sha1(password));
        return res.status(201).json({ id: user._id, email });
    }
}

export default UsersController;
