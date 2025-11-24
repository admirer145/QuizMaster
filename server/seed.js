const db = require('./src/db');
const Quiz = require('./src/models/Quiz');

async function seed() {
    console.log('Seeding database...');

    // Wait for DB connection
    setTimeout(async () => {
        try {
            // Create Science Quiz
            const scienceQuiz = await Quiz.create('General Science', 'Science', 'Medium');
            console.log('Created Science Quiz:', scienceQuiz);

            await Quiz.addQuestion(scienceQuiz.id, {
                type: 'multiple_choice',
                text: 'What is the chemical symbol for Gold?',
                options: ['Ag', 'Au', 'Fe', 'Pb'],
                correctAnswer: 'Au'
            });

            await Quiz.addQuestion(scienceQuiz.id, {
                type: 'true_false',
                text: 'The Earth is flat.',
                correctAnswer: 'false'
            });

            await Quiz.addQuestion(scienceQuiz.id, {
                type: 'multiple_choice',
                text: 'Which planet is known as the Red Planet?',
                options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
                correctAnswer: 'Mars'
            });

            // Create History Quiz
            const historyQuiz = await Quiz.create('World History', 'History', 'Hard');
            console.log('Created History Quiz:', historyQuiz);

            await Quiz.addQuestion(historyQuiz.id, {
                type: 'multiple_choice',
                text: 'Who was the first President of the United States?',
                options: ['Thomas Jefferson', 'John Adams', 'George Washington', 'Benjamin Franklin'],
                correctAnswer: 'George Washington'
            });

            console.log('Seeding complete!');
            process.exit(0);
        } catch (err) {
            console.error('Error seeding:', err);
            process.exit(1);
        }
    }, 1000);
}

seed();
