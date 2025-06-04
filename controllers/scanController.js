const { db, admin } = require('../config/firebase');

exports.getUserScans = async (request, h) => {
  try {
    const { userId } = request.params;
    
    // Verifikasi userId dari token jika ada
    if (request.auth && request.auth.credentials) {
      const tokenUserId = request.auth.credentials.uid;
      if (userId !== tokenUserId) {
        return h.response({ error: 'Unauthorized access' }).code(403);
      }
    }
    
    // Cek apakah collection 'scans' ada
    const collections = await db.listCollections();
    
    const scanRef = db.collection('scans');
    
    const snapshot = await scanRef.where('userId', '==', userId).get();
    
    if (snapshot.empty) {
      return h.response([]).code(200);
    }
    
    const scans = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      scans.push({
        id: doc.id,
        ...data
      });
    });
    
    return h.response(scans).code(200);
  } catch (error) {
    return h.response({ 
      error: 'Gagal mengambil data scan',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }).code(500);
  }
};

exports.createScan = async (request, h) => {
  try {
    const { userId, classification, confidence } = request.payload;

    // Validasi payload
    if (!userId || !classification || typeof confidence !== 'number') {
      return h.response({ 
        error: 'Invalid payload',
        message: 'Data yang dikirim tidak valid'
      }).code(400);
    }

    // Verifikasi userId dari token
    if (request.auth && request.auth.credentials) {
      const tokenUserId = request.auth.credentials.uid;
      if (userId !== tokenUserId) {
        return h.response({ 
          error: 'Unauthorized access',
          message: 'Anda tidak memiliki akses untuk menyimpan data ini'
        }).code(403);
      }
    }

    // Tambahkan scan baru
    let scanDoc;
    try {
      const scanRef = db.collection('scans');
      const newScan = {
        userId,
        classification,
        confidence,
        timestamp: new Date()
      };
      scanDoc = await scanRef.add(newScan);
    } catch (err) {
      return h.response({ 
        error: 'Failed to add scan',
        message: 'Gagal menyimpan hasil klasifikasi',
        details: err.message
      }).code(500);
    }

    // Update scanCount dan points user
    const userRef = db.collection('users').doc(userId);
    let pointsAdded = 5; // Default points untuk setiap scan
    try {
      const userDoc = await userRef.get();
      if (!userDoc.exists) {
        await userRef.set({
          scanCount: 1,
          points: pointsAdded,
          createdAt: new Date()
        });
      } else {
        await userRef.update({
          scanCount: admin.firestore.FieldValue.increment(1),
          points: admin.firestore.FieldValue.increment(pointsAdded)
        });
      }
    } catch (err) {
      return h.response({ 
        error: 'Failed to update user data',
        message: 'Gagal memperbarui data pengguna',
        details: err.message
      }).code(500);
    }

    // Kirim response dengan pointsAdded
    return h.response({ 
      message: 'Scan recorded successfully',
      scanId: scanDoc.id,
      pointsAdded: pointsAdded
    }).code(201);
  } catch (error) {
    return h.response({ 
      error: 'Gagal menyimpan scan',
      message: 'Terjadi kesalahan saat menyimpan hasil klasifikasi',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }).code(500);
  }
}; 