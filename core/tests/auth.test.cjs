const assert = require('node:assert/strict')
const path = require('node:path')
const { beforeEach, describe, it } = require('node:test')

const projectRoot = path.resolve(__dirname, '../..')
const { adminAuth } = require(path.join(projectRoot, 'tests/mocks/firebaseAdmin.cjs'))
const { requireAuth } = require(path.join(projectRoot, 'core/auth.ts'))

const TOKENS = {
  'participant-token': { uid: 'user-1' },
  'organizer-token': { uid: 'org-1', role: 'ORGANIZER' },
}

const requestWith = (authorization) => new Request('http://localhost/api/test', {
  headers: authorization === undefined ? {} : { Authorization: authorization },
})

describe('requireAuth', () => {
  beforeEach(() => {
    adminAuth.verifyIdToken = async (token) => {
      if (!TOKENS[token]) throw new Error('Invalid token')
      return TOKENS[token]
    }
  })

  it('returns 401 when the token is missing', async () => {
    const result = await requireAuth(requestWith(undefined))
    assert.equal(result.status, 401)
  })

  it('returns 401 when the token is invalid', async () => {
    const result = await requireAuth(requestWith('Bearer invalid-token'))
    assert.equal(result.status, 401)
  })

  it('defaults a user with no role to PARTICIPANT', async () => {
    assert.deepEqual(await requireAuth(requestWith('Bearer participant-token')), { uid: 'user-1', role: 'PARTICIPANT' })
  })

  it('returns 403 when the role is not allowed', async () => {
    const result = await requireAuth(requestWith('Bearer organizer-token'), ['DEVELOPER'])
    assert.equal(result.status, 403)
  })

  it('returns the user when the role is allowed', async () => {
    assert.deepEqual(
      await requireAuth(requestWith('Bearer organizer-token'), ['DEVELOPER', 'ORGANIZER']),
      { uid: 'org-1', role: 'ORGANIZER' },
    )
  })
})
