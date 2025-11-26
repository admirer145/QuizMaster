const db = require('../db');
const bcrypt = require('bcrypt');

class User {
    static async create(username, password, role = 'user') {
        const hashedPassword = await bcrypt.hash(password, 10);
        return new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
                [username, hashedPassword, role],
                function (err) {
                    if (err) return reject(err);
                    resolve({ id: this.lastID, username, role });
                }
            );
        });
    }

    static findByUsername(username) {
        return new Promise((resolve, reject) => {
            db.get(
                'SELECT * FROM users WHERE username = ?',
                [username],
                (err, row) => {
                    if (err) return reject(err);
                    resolve(row);
                }
            );
        });
    }

    static async validatePassword(user, password) {
        return await bcrypt.compare(password, user.password);
    }
}

module.exports = User;
