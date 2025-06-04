const { db } = require('../config/firebase');

exports.getLeaderboard = async (request, h) => {
  try {
    const userRef = db.collection('users');
    const snapshot = await userRef.orderBy('points', 'desc').limit(10).get();
    const leaderboard = [];
    snapshot.forEach(doc => {
      leaderboard.push({
        id: doc.id,
        ...doc.data()
      });
    });
    return h.response(leaderboard).code(200);
  } catch (error) {
    return h.response({ error: error.message }).code(500);
  }
}; 