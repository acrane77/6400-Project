const assert = require('node:assert/strict')
const path = require('node:path')
const { beforeEach, describe, it } = require('node:test')

const projectRoot = path.resolve(__dirname, '../../..')
const { adminAuth, adminDb } = require(path.join(projectRoot, 'tests/mocks/firebaseAdmin.cjs'))
const { POST: registerAccount } = require(path.join(projectRoot, 'app/api/account/route.ts'))
const { PATCH: changeRole } = require(path.join(projectRoot, 'app/api/account/role/route.ts'))

const TOKENS = {
  'participant-token': { uid: 'user-1' },
  'organizer-token': { uid: 'org-1', role: 'ORGANIZER' },
  'dev-token': { uid: 'dev-1', role: 'DEVELOPER' },
}

const request = (url, method, token, body) => new Request(`http://localhost${url}`, {
  method,
  headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
})
const register = (token, body) => registerAccount(request('/api/account', 'POST', token, body))
const setRole = (token, body) => changeRole(request('/api/account/role', 'PATCH', token, body))

let claimsSet

beforeEach(() => {
  claimsSet = []
  adminAuth.verifyIdToken = async (token) => {
    if (!TOKENS[token]) throw new Error('Invalid token')
    return TOKENS[token]
  }
  adminAuth.getUser = async (uid) => ({ uid, email: 'demo@example.com', displayName: 'demo', customClaims: {} })
  adminAuth.getUserByEmail = async (email) => ({ uid: 'user-1', email, customClaims: { role: 'PARTICIPANT' } })
  adminAuth.setCustomUserClaims = async (uid, claims) => { claimsSet.push([uid, claims]) }
  adminDb.collection = () => ({ doc: () => ({ set: async () => {} }) })
})

describe('POST /api/account', () => {
  it('gives a new user the PARTICIPANT role', async () => {
    const response = await register('participant-token', { username: 'demo' })
    assert.equal(response.status, 200)
    assert.deepEqual(claimsSet, [['user-1', { role: 'PARTICIPANT' }]])
  })

  it('ignores a role sent by the client', async () => {
    await register('participant-token', { username: 'demo', role: 'DEVELOPER' })
    assert.deepEqual(claimsSet, [['user-1', { role: 'PARTICIPANT' }]])
  })

  it('does not reset an existing role', async () => {
    adminAuth.getUser = async (uid) => ({ uid, email: 'org@example.com', customClaims: { role: 'ORGANIZER' } })
    await register('organizer-token', { username: 'org' })
    assert.deepEqual(claimsSet, [])
  })
})

describe('PATCH /api/account/role', () => {
  it('rejects non-developers', async () => {
    const response = await setRole('organizer-token', { email: 'user@example.com', role: 'DEVELOPER' })
    assert.equal(response.status, 403)
    assert.deepEqual(claimsSet, [])
  })

  it('lets a developer change a user\'s role', async () => {
    const response = await setRole('dev-token', { email: 'user@example.com', role: 'ORGANIZER' })
    assert.equal(response.status, 200)
    assert.deepEqual(claimsSet, [['user-1', { role: 'ORGANIZER' }]])
  })
})
