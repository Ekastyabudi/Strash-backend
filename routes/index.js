const scanRoutes = require("./scanRoutes");
const leaderboardRoutes = require("./leaderboardRoutes");

const routes = [...scanRoutes, ...leaderboardRoutes];

module.exports = routes;
