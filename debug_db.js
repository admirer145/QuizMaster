const db = require('./server/src/db');

setTimeout(() => {
    console.log('--- Users ---');
    db.all('SELECT * FROM users', [], (err, rows) => {
        if (err) console.error(err);
        else console.table(rows);
    });

    console.log('--- Quizzes ---');
    db.all('SELECT * FROM quizzes', [], (err, rows) => {
        if (err) console.error(err);
        else console.table(rows);
    });

    console.log('--- Results ---');
    db.all('SELECT * FROM results', [], (err, rows) => {
        if (err) console.error(err);
        else console.table(rows);
    });
}, 1000);
