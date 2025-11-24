const { MultipleChoiceQuestion, TrueFalseQuestion } = require('./src/models/Question');

console.log('Verifying OOP Implementation...');

const mcq = new MultipleChoiceQuestion(1, 'Test MCQ', ['A', 'B'], 'A');
const tfq = new TrueFalseQuestion(2, 'Test TF', 'true');

console.log('Testing MultipleChoiceQuestion polymorphism:');
console.log(`MCQ validate('A') (Expected: true): ${mcq.validateAnswer('A')}`);
console.log(`MCQ validate('B') (Expected: false): ${mcq.validateAnswer('B')}`);

console.log('\nTesting TrueFalseQuestion polymorphism:');
console.log(`TFQ validate('true') (Expected: true): ${tfq.validateAnswer('true')}`);
console.log(`TFQ validate('false') (Expected: false): ${tfq.validateAnswer('false')}`);

if (mcq.validateAnswer('A') && !mcq.validateAnswer('B') && tfq.validateAnswer('true')) {
    console.log('\nOOP Verification PASSED ✅');
} else {
    console.error('\nOOP Verification FAILED ❌');
    process.exit(1);
}
