const Hapi = require("@hapi/hapi");
const routes = require("./routes");
const { admin } = require("./config/firebase");

const init = async () => {
  try {
    const server = Hapi.server({
      port: process.env.PORT || 3005,
      host: "0.0.0.0",
      routes: {
        cors: {
          origin: ["*"],
          headers: ["Accept", "Content-Type", "Authorization"],
          additionalHeaders: ["X-Requested-With"],
          credentials: true,
        },
      },
    });

    server.route(routes);

    await server.start();
    console.log(`Server running on ${server.info.uri}`);
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
};

process.on("unhandledRejection", (err) => {
  console.error(err);
  process.exit(1);
});

init();
