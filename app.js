const MongoClient = require('mongodb').MongoClient;

// Connection URL
const url = 'mongodb://localhost:27017';

// Database Name
const dbName = 'Local1';

// Use connect method to connect to the server
MongoClient.connect(url, { useUnifiedTopology: true }, async function(
  err,
  client
) {
  const db = client.db(dbName);
  const users = db.collection('users');
  const articles = db.collection('articles');
  const students = db.collection('students');

  const ratingScore = 50;

  const printData = arr => {
    arr.forEach(elem => {
      console.log(elem);
    });
  };

  // Find all students who have the worst score
  // for homework, sort by descent
  const worstHomeworkScores = await students
    .find({
      'scores.2.type': 'homework',
      'scores.2.score': { $lt: ratingScore }
    })
    .sort({ 'scores.2.score': -1 })
    .toArray();

  printData(worstHomeworkScores);

  // Find all students who have the best score
  // for quiz and the worst for homework, sort by ascending
  const bestQuizWorstExam = await students
    .find({
      $and: [
        { 'scores.1.type': 'quiz', 'scores.1.score': { $gt: ratingScore } },
        { 'scores.2.type': 'homework', 'scores.2.score': { $lt: ratingScore } }
      ]
    })
    .sort({ 'scores.1.score': 1 })
    .toArray();

  printData(bestQuizWorstExam);

  // Find all students who have best score
  // for quiz and exam
  const bestQuizBestExam = await students
    .find({
      $and: [
        { 'scores.1.type': 'quiz', 'scores.1.score': { $gt: ratingScore } },
        { 'scores.0.type': 'exam', 'scores.0.score': { $gt: ratingScore } }
      ]
    })
    .toArray();

  printData(bestQuizBestExam);

  // Calculate the average score for homework
  // for all students
  const averageHomeworkScore = await students
    .aggregate([
      { $unwind: '$scores' },
      { $match: { 'scores.type': 'homework' } },
      {
        $group: {
          _id: 'averageHomeworkScore',
          avgHWScore: { $avg: '$scores.score' }
        }
      }
    ])
    .next();

  console.log(averageHomeworkScore);

  // Delete all students that have homework score <= 60
  students.deleteMany({
    'scores.2.type': 'homework',
    'scores.2.score': { $lte: 60 }
  });

  client.close();
});
