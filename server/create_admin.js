const db = require('./src/db');
const User = require('./src/models/User');

async function createAdmin() {
    try {
        const adminUser = await User.findByUsername('admin');
        if (adminUser) {
            console.log('Admin user already exists.');
            return;
        }

        await User.create('admin', 'admin123', 'admin');
        console.log('Admin user created successfully.');
    } catch (err) {
        console.error('Error creating admin user:', err);
    }
}

// Wait for DB connection
setTimeout(createAdmin, 1000);
