const Hapi = require('@hapi/hapi');
const Inert = require('@hapi/inert'); 
const routes = require('./routes');
const { admin } = require('./config/firebase');

const init = async () => {
  try {
    const server = Hapi.server({
      port: process.env.PORT || 3005,
      host: 'localhost',
      routes: {
        cors: {
          origin: ['*'],
          headers: ['Accept', 'Content-Type', 'Authorization'],
          additionalHeaders: ['X-Requested-With'],
          credentials: true
        }
      }
    });

    await server.register(Inert); // <== Daftarkan Inert

    // Route untuk file statis model tfjs
    server.route({
      method: 'GET',
      path: '/model/{param*}',
      handler: {
        directory: {
          path: 'public/model',
          redirectToSlash: true,
          index: false
        }
      }
    });

    // Middleware verifikasi token Firebase (dibiarkan)
    server.ext('onPreHandler', async (request, h) => {
      if (request.path === '/api/health' || request.path === '/api/status') {
        return h.continue;
      }

      const authHeader = request.headers.authorization;
      if (!authHeader) {
        return h.response({ 
          error: 'Token tidak ditemukan',
          message: 'Anda perlu login terlebih dahulu'
        }).code(401);
      }

      const token = authHeader.split(' ')[1];
      try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        request.auth = { credentials: decodedToken };
        return h.continue;
      } catch (error) {
        return h.response({ 
          error: 'Token tidak valid',
          message: 'Sesi login Anda telah berakhir. Silakan login kembali'
        }).code(401);
      }
    });

    server.route(routes);

    await server.start();
    console.log(`Server running on ${server.info.uri}`);
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
};

process.on('unhandledRejection', (err) => {
  process.exit(1);
});

init();
