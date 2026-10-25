const adminAuth = {
  async verifyIdToken(token) {
    if (token === 'invalid-token') throw new Error('Invalid token')
    return { uid: 'user-1' }
  },

  async getUser(uid) {
    return { uid, email: 'demo@example.com', displayName: 'demo', customClaims: {} }
  },
  async getUserByEmail() {
    throw new Error('User not found')
  },
  async setCustomUserClaims() {},
}

const adminDb = {}

module.exports = { adminAuth, adminDb }
