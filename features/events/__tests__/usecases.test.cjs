const assert = require('node:assert/strict')
const path = require('node:path')
const { beforeEach, describe, it } = require('node:test')

const projectRoot = path.resolve(__dirname, '../../..')
const { adminAuth } = require(path.join(projectRoot, 'tests/mocks/firebaseAdmin.cjs'))
const { adminDb } = require(path.join(projectRoot, 'tests/mocks/firebaseAdmin.cjs'))
const { CreateEvent } = require(path.join(projectRoot, 'features/events/domain/usecases/createEvent.ts'))
const { DeleteEvent } = require(path.join(projectRoot, 'features/events/domain/usecases/deleteEvent.ts'))
const { EventSignUp } = require(path.join(projectRoot, 'features/events/domain/usecases/EventSignUp.ts'))
const { GetEvents } = require(path.join(projectRoot, 'features/events/domain/usecases/getEvents.ts'))
const { GetMyEvents } = require(path.join(projectRoot, 'features/events/domain/usecases/getMyEvents.ts'))
const { EventApiClient } = require(path.join(projectRoot, 'features/events/domain/api/EventApi.ts'))

const jsonResponse = (status, body = {}) => new Response(JSON.stringify(body), {
  status,
  headers: { 'Content-Type': 'application/json' },
})

const mockRepository = () => ({
  createEvent: async (event) => jsonResponse(201, { success: true, body: event }),
  getEvents: async () => jsonResponse(200, { success: true, body: [] }),
  getMyEvents: async (ownerId) => jsonResponse(200, { success: true, body: { ownerId } }),
  deleteEvent: async (id, ownerId) => jsonResponse(200, { success: true, body: { id, ownerId } }),
  eventSignUp: async (eventId, user) => jsonResponse(200, { success: true, body: { eventId, user } }),
})

const authorizedRequest = (body, token = 'valid-token') => new Request('http://localhost/api/events', {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
})

const responseBody = (response) => response.json()

describe('Events use cases', () => {
  beforeEach(() => {
    adminAuth.verifyIdToken = async (token) => {
      if (token === 'invalid-token') throw new Error('Invalid token')
      return { uid: 'user-1' }
    }
  })

  describe('CreateEvent', () => {
    it('requires a bearer token', async () => {
      const response = await new CreateEvent(mockRepository()).execute(new Request('http://localhost/api/events', { method: 'POST' }))
      assert.equal(response.status, 401)
      assert.match((await responseBody(response)).error, /Missing token/)
    })

    it('rejects an invalid token', async () => {
      const response = await new CreateEvent(mockRepository()).execute(authorizedRequest({}, 'invalid-token'))
      assert.equal(response.status, 401)
      assert.match((await responseBody(response)).error, /Invalid token/)
    })

    it('rejects malformed JSON', async () => {
      const request = new Request('http://localhost/api/events', {
        method: 'POST',
        headers: { Authorization: 'Bearer valid-token', 'Content-Type': 'application/json' },
        body: '{',
      })
      const response = await new CreateEvent(mockRepository()).execute(request)
      assert.equal(response.status, 400)
    })

    it('requires a valid date, title, and description', async () => {
      const response = await new CreateEvent(mockRepository()).execute(authorizedRequest({ title: ' ', description: '', eventDate: 'not-a-date' }))
      assert.equal(response.status, 400)
    })

    it('rejects negative or non-numeric capacity and fee values', async () => {
      for (const invalidField of [{ capacity: -1 }, { capacity: 'many' }, { fee: -0.01 }, { fee: 'free-ish' }]) {
        let repositoryCalled = false
        const repository = { ...mockRepository(), createEvent: async () => { repositoryCalled = true; return jsonResponse(201) } }
        const response = await new CreateEvent(repository).execute(authorizedRequest({
          eventDate: '2026-12-01', title: 'Demo', description: 'Description', ...invalidField,
        }))

        assert.equal(response.status, 400)
        assert.equal(repositoryCalled, false)
      }
    })

    it('normalizes valid input and assigns ownership from the verified token', async () => {
      let created
      const repository = { ...mockRepository(), createEvent: async (event) => { created = event; return jsonResponse(201, { body: event }) } }
      const response = await new CreateEvent(repository).execute(authorizedRequest({
        eventDate: '2026-12-01', title: '  Demo  ', description: '  A description  ', atMun: true,
        capacity: '25', fee: '10.5', address: '  UC  ', room: '  Room 1  ', people: 'not-an-array',
      }))

      assert.equal(response.status, 201)
      assert.equal(created.ownerId, 'user-1')
      assert.equal(created.title, 'Demo')
      assert.equal(created.description, 'A description')
      assert.equal(created.eventDate, '2026-12-01T00:00:00.000Z')
      assert.equal(created.capacity, 25)
      assert.equal(created.fee, 10.5)
      assert.equal(created.address, 'UC')
      assert.equal(created.room, 'Room 1')
      assert.deepEqual(created.people, [])
      assert.deepEqual(created.volenteers, [])
    })
  })

  describe('GetEvents', () => {
    it('returns the repository response', async () => {
      const expected = jsonResponse(200, { success: true, body: [{ id: 'event-1' }] })
      const repository = { getEvents: async () => expected }
      const response = await new GetEvents(repository).execute(new Request('http://localhost/api/events'))
      assert.equal(response, expected)
    })
  })

  describe('GetMyEvents', () => {
    it('requires authentication', async () => {
      const response = await new GetMyEvents(mockRepository()).execute(new Request('http://localhost/api/events/my-events'))
      assert.equal(response.status, 401)
    })

    it('rejects invalid authentication', async () => {
      const response = await new GetMyEvents(mockRepository()).execute(new Request('http://localhost/api/events/my-events', {
        headers: { Authorization: 'Bearer invalid-token' },
      }))
      assert.equal(response.status, 401)
    })

    it('queries events for the authenticated user', async () => {
      let requestedOwner
      const repository = { ...mockRepository(), getMyEvents: async (ownerId) => { requestedOwner = ownerId; return jsonResponse(200) } }
      const response = await new GetMyEvents(repository).execute(new Request('http://localhost/api/events/my-events', {
        headers: { Authorization: 'Bearer valid-token' },
      }))
      assert.equal(response.status, 200)
      assert.equal(requestedOwner, 'user-1')
    })
  })

  describe('DeleteEvent', () => {
    it('rejects missing authentication and does not call the repository', async () => {
      let repositoryCalled = false
      const repository = { ...mockRepository(), deleteEvent: async () => { repositoryCalled = true; return jsonResponse(200) } }
      const response = await new DeleteEvent(repository).execute(new Request('http://localhost/api/events/event-1', { method: 'DELETE' }))
      assert.equal(response.status, 401)
      assert.equal(repositoryCalled, false)
    })

    it('validates the event id and passes the authenticated owner to the repository', async () => {
      let deleted
      const repository = { ...mockRepository(), deleteEvent: async (...args) => { deleted = args; return jsonResponse(200) } }
      const response = await new DeleteEvent(repository).execute(authorizedRequest({ id: ' event-1 ' }))
      assert.equal(response.status, 200)
      assert.deepEqual(deleted, ['event-1', 'user-1'])

      const invalid = await new DeleteEvent(repository).execute(authorizedRequest({ id: ' ' }))
      assert.equal(invalid.status, 400)
    })
  })

  describe('EventSignUp', () => {
    it('rejects a user id that does not match the authenticated account', async () => {
      let repositoryCalled = false
      const repository = { ...mockRepository(), eventSignUp: async () => { repositoryCalled = true; return jsonResponse(200) } }
      const response = await new EventSignUp(repository).execute(authorizedRequest({ eventId: 'event-1', user: { id: 'other-user' } }))
      assert.equal(response.status, 403)
      assert.equal(repositoryCalled, false)
    })

    it('validates input and forwards an authenticated signup', async () => {
      let signup
      const repository = { ...mockRepository(), eventSignUp: async (...args) => { signup = args; return jsonResponse(200) } }
      const missingId = await new EventSignUp(repository).execute(authorizedRequest({ eventId: ' ', user: { id: 'user-1' } }))
      assert.equal(missingId.status, 400)

      const response = await new EventSignUp(repository).execute(authorizedRequest({
        eventId: ' event-1 ', user: { id: 'user-1', username: 'demo', email: 'demo@example.com' },
      }))
      assert.equal(response.status, 200)
      assert.equal(signup[0], 'event-1')
      assert.equal(signup[1].id, 'user-1')
    })
  })
})

describe('EventApiClient Firestore behavior', () => {
  it('returns not found when deleting an event that does not exist', async () => {
    adminDb.collection = () => ({ doc: () => ({ get: async () => ({ exists: false }) }) })
    const response = await new EventApiClient().deleteEvent('missing-event', 'user-1')
    assert.equal(response.status, 404)
  })

  it('only allows the owner to delete an event', async () => {
    let deleted = false
    adminDb.collection = () => ({ doc: () => ({
      get: async () => ({ exists: true, get: () => 'owner-1' }),
      delete: async () => { deleted = true },
    }) })

    const forbidden = await new EventApiClient().deleteEvent('event-1', 'other-user')
    assert.equal(forbidden.status, 403)
    assert.equal(deleted, false)

    const allowed = await new EventApiClient().deleteEvent('event-1', 'owner-1')
    assert.equal(allowed.status, 200)
    assert.equal(deleted, true)
  })

  it('rejects a duplicate signup without updating the event', async () => {
    let updated = false
    const eventRef = { get: async () => ({
      exists: true,
      id: 'event-1',
      data: () => ({ people: [{ id: 'user-1' }], capacity: 10 }),
    }) }
    adminDb.collection = () => ({ doc: () => eventRef })
    adminDb.runTransaction = async (callback) => callback({
      get: async () => eventRef.get(),
      update: () => { updated = true },
    })

    const response = await new EventApiClient().eventSignUp('event-1', { id: 'user-1' })
    assert.equal(response.status, 409)
    assert.equal(updated, false)
  })

  it('rejects signup when capacity is full', async () => {
    let updated = false
    const eventRef = { get: async () => ({
      exists: true,
      id: 'event-1',
      data: () => ({ people: [{ id: 'user-2' }], capacity: 1 }),
    }) }
    adminDb.collection = () => ({ doc: () => eventRef })
    adminDb.runTransaction = async (callback) => callback({
      get: async () => eventRef.get(),
      update: () => { updated = true },
    })

    const response = await new EventApiClient().eventSignUp('event-1', { id: 'user-1' })
    assert.equal(response.status, 409)
    assert.equal(updated, false)
  })

  it('adds a signup transactionally when the event has space', async () => {
    let savedPeople
    const eventRef = { get: async () => ({
      exists: true,
      id: 'event-1',
      data: () => ({ people: [], capacity: 2 }),
    }) }
    adminDb.collection = () => ({ doc: () => eventRef })
    adminDb.runTransaction = async (callback) => callback({
      get: async () => eventRef.get(),
      update: (_ref, update) => { savedPeople = update.people },
    })

    const user = { id: 'user-1', username: 'demo', email: 'demo@example.com' }
    const response = await new EventApiClient().eventSignUp('event-1', user)
    assert.equal(response.status, 200)
    assert.deepEqual(savedPeople, [user])
    assert.deepEqual((await responseBody(response)).body.people, [user])
  })
})
