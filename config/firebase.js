const admin = require("firebase-admin");
require("dotenv").config();

// Ambil string JSON dari variabel lingkungan
const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

// Pastikan variabel lingkungan ada
if (!serviceAccountString) {
  console.error(
    "Kesalahan: Variabel lingkungan FIREBASE_SERVICE_ACCOUNT_KEY tidak ditemukan."
  );
  process.exit(1);
}

try {
  // Parse string JSON ke objek JavaScript
  const serviceAccount = JSON.parse(serviceAccountString);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    // databaseURL: "https://klasifikasi-sampah-e3c61.firebaseio.com" // Jika Anda menggunakan Realtime Database
  });

  console.log("Firebase Admin SDK berhasil diinisialisasi.");
} catch (error) {
  console.error("Kesalahan saat menginisialisasi Firebase Admin SDK:", error);
  console.error(
    "Pastikan format FIREBASE_SERVICE_ACCOUNT_KEY di .env adalah JSON yang valid."
  );
  process.exit(1);
}

const db = admin.firestore();
db.settings({ timestampsInSnapshots: true });

module.exports = { admin, db };
