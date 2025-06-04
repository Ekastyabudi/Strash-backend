const leaderboardController = require('../controllers/leaderboardController');

module.exports = [
  {
    method: 'GET',
    path: '/api/leaderboard',
    handler: leaderboardController.getLeaderboard
  }
]; 