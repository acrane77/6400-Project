const adminAuth = {
  async verifyIdToken(token) {
    if (token === 'invalid-token') throw new Error('Invalid token')
    return { uid: 'user-1' }
  },
}

const adminDb = {}

module.exports = { adminAuth, adminDb }
