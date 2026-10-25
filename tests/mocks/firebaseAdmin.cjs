const adminAuth = {
  async verifyIdToken(token) {
    if (token === 'invalid-token') throw new Error('Invalid token')
    return { uid: 'user-1' }
  },
<<<<<<< HEAD
  async getUser(uid) {
    return { uid, email: 'demo@example.com', displayName: 'demo', customClaims: {} }
  },
  async getUserByEmail() {
    throw new Error('User not found')
  },
  async setCustomUserClaims() {},
=======
>>>>>>> 8e462eb45d1de3c3d2039d8b9f4812f692a8f501
}

const adminDb = {}

module.exports = { adminAuth, adminDb }
