const assert = require('node:assert/strict')
const path = require('node:path')
const { beforeEach, describe, it } = require('node:test')

const projectRoot = path.resolve(__dirname, '../../..')
const { adminAuth } = require(path.join(projectRoot, 'tests/mocks/firebaseAdmin.cjs'))
const { adminDb } = require(path.join(projectRoot, 'tests/mocks/firebaseAdmin.cjs'))
const { CreateEvent } = require(path.join(projectRoot, 'features/events/domain/usecases/createEvent.ts'))
const { DeleteEvent } = require(path.join(projectRoot, 'features/events/domain/usecases/deleteEvent.ts'))
const { GetEvents } = require(path.join(projectRoot, 'features/events/domain/usecases/getEvents.ts'))
const { GetMyEvents } = require(path.join(projectRoot, 'features/events/domain/usecases/getMyEvents.ts'))
const { EventApiClient } = require(path.join(projectRoot, 'features/events/domain/api/EventApi.ts'))

const TOKENS = {
  'valid-token': { uid: 'user-1', role: 'ORGANIZER' },
  'participant-token': { uid: 'user-1' },
}

const jsonResponse = (status, body = {}) => new Response(JSON.stringify(body), {
  status,
  headers: { 'Content-Type': 'application/json' },
})

const mockRepository = () => ({
  createEvent: async (event) => jsonResponse(201, { success: true, body: event }),
  getEvents: async () => jsonResponse(200, { success: true, body: [] }),
  getMyEvents: async (ownerId) => jsonResponse(200, { success: true, body: { ownerId } }),
  deleteEvent: async (id, requester) => jsonResponse(200, { success: true, body: { id, requester } }),
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
      if (!TOKENS[token]) throw new Error('Invalid token')
      return TOKENS[token]
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

    it('allows authenticated participants to create events', async () => {
      let created

      const repository = {
        ...mockRepository(),
        createEvent: async (event) => {
          created = event
          return jsonResponse(201, { success: true, body: event })
        }
      }

      const response = await new CreateEvent(repository).execute(
        authorizedRequest({
          eventDate: '2026-12-01',
          title: 'Demo',
          description: 'Description',
          category: 'b4000',
        }, 'participant-token')
      )

      assert.equal(response.status, 201)
      assert.equal(created.ownerId, 'user-1')
      assert.deepEqual(created.organizerIds, ['user-1'])
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
        eventDate: '2026-12-01', title: '  Demo  ', description: '  A description  ', category: 'b4000', atMun: true,
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
      const expectedBody = await expected.clone().json()
      const repository = { getEvents: async () => expected }
      const response = await new GetEvents(repository).execute(new Request('http://localhost/api/events', {
        headers: { Authorization: 'Bearer valid-token' },
      }))
      assert.equal(response.status, expected.status)
      assert.deepEqual(await response.json(), expectedBody)
    })

    it('parses repeated keywords, category, and date range from the search URL', async () => {
      let receivedParams
      const repository = {
        getEvents: async (params) => {
          receivedParams = params
          return jsonResponse(200, { success: true, body: [] })
        },
      }
      const response = await new GetEvents(repository).execute(new Request(
        'http://localhost/api/events?keywords=board&keywords=games&category=b4000&dateRange%5Bmin%5D=2026-12-01&dateRange%5Bmax%5D=2026-12-31',
        { headers: { Authorization: 'Bearer valid-token' } },
      ))

      assert.equal(response.status, 200)
      assert.deepEqual(receivedParams, {
        keywords: ['board', 'games'],
        category: 'b4000',
        dateRange: { min: '2026-12-01', max: '2026-12-31' },
      })
    })

    it('accepts the legacy capitalized search parameter names', async () => {
      let receivedParams
      const repository = {
        getEvents: async (params) => {
          receivedParams = params
          return jsonResponse(200)
        },
      }
      await new GetEvents(repository).execute(new Request(
        'http://localhost/api/events?Keywords=holiday&Category=b1000&DateRange%5Bmin%5D=2026-12-01',
        { headers: { Authorization: 'Bearer valid-token' } },
      ))

      assert.deepEqual(receivedParams, {
        keywords: ['holiday'],
        category: 'b1000',
        dateRange: { min: '2026-12-01' },
      })
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

    it('validates the event id and passes the authenticated user to the repository', async () => {
      let deleted
      const repository = { ...mockRepository(), deleteEvent: async (...args) => { deleted = args; return jsonResponse(200) } }
      const response = await new DeleteEvent(repository).execute(authorizedRequest({ id: ' event-1 ' }))
      assert.equal(response.status, 200)
      assert.deepEqual(deleted, ['event-1', { uid: 'user-1', role: 'ORGANIZER' }])

      const invalid = await new DeleteEvent(repository).execute(authorizedRequest({ id: ' ' }))
      assert.equal(invalid.status, 400)
    })
  })
})

describe('EventApiClient Firestore behavior', () => {
  function mockEventsQuery(documents) {
    const filters = []
    let orderBy
    const query = {
      where(field, operator, value) {
        filters.push({ field, operator, value })
        return query
      },
      orderBy(field, direction) {
        orderBy = { field, direction }
        return query
      },
      async get() {
        const matchedDocuments = documents.filter((document) => filters.every(({ field, operator, value }) => {
          const fieldValue = document[field]
          if (operator === 'in') return value.includes(fieldValue)
          if (operator === '>=') return fieldValue >= value
          if (operator === '<=') return fieldValue <= value
          return fieldValue === value
        }))
        return { docs: matchedDocuments.map(({ id, ...data }) => ({ id, data: () => data })) }
      },
    }
    adminDb.collection = (name) => {
      assert.equal(name, 'events')
      return query
    }
    return { filters, getOrderBy: () => orderBy }
  }

  it('searches titles and descriptions case-insensitively, requiring every keyword', async () => {
    const query = mockEventsQuery([
      { id: 'match', title: 'Winter Celebration', description: 'Student gathering', category: 'b1100', eventDate: '2099-12-01T12:00:00.000Z' },
      { id: 'one-term', title: 'Winter party', description: 'Student social', category: 'b1100', eventDate: '2099-12-02T12:00:00.000Z' },
      { id: 'wrong-category', title: 'Winter Celebration', description: 'Student gathering', category: 'b4100', eventDate: '2099-12-03T12:00:00.000Z' },
    ])

    const response = await new EventApiClient().getEvents({ keywords: [' WINTER, celebration '], category: 'b1000' })
    assert.equal(response.status, 200)
    assert.deepEqual((await response.json()).body.map((event) => event.id), ['match'])
    assert.deepEqual(query.filters[0], { field: 'category', operator: 'in', value: ['b1000', 'b1100', 'b1200'] })
  })

  it('applies inclusive minimum and date-only maximum filters to the Firestore query', async () => {
    const query = mockEventsQuery([])
    const response = await new EventApiClient().getEvents({ dateRange: { min: '2026-12-01', max: '2026-12-31' } })

    assert.equal(response.status, 200)
    assert.deepEqual(query.filters, [
      { field: 'eventDate', operator: '>=', value: '2026-12-01' },
      { field: 'eventDate', operator: '<=', value: '2026-12-31T23:59:59.999Z' },
    ])
    assert.deepEqual(query.getOrderBy(), { field: 'eventDate', direction: 'asc' })
  })

  it('uses the supplied upper date bound when no minimum is set', async () => {
    const query = mockEventsQuery([])
    await new EventApiClient().getEvents({ dateRange: { max: '2026-12-31' } })

    assert.deepEqual(query.filters, [
      { field: 'eventDate', operator: '<=', value: '2026-12-31T23:59:59.999Z' },
    ])
  })

  it('returns not found when deleting an event that does not exist', async () => {
    adminDb.collection = () => ({ doc: () => ({ get: async () => ({ exists: false }) }) })
    const response = await new EventApiClient().deleteEvent('missing-event', { uid: 'user-1', role: 'ORGANIZER' })
    assert.equal(response.status, 404)
  })

  it('only allows the owner to delete an event', async () => {
    let deleted = false
    adminDb.collection = () => ({ doc: () => ({
      get: async () => ({ exists: true, get: () => 'owner-1' }),
      delete: async () => { deleted = true },
    }) })

    const forbidden = await new EventApiClient().deleteEvent('event-1', { uid: 'other-user', role: 'PARTICIPANT' })
    assert.equal(forbidden.status, 403)
    assert.equal(deleted, false)

    const allowed = await new EventApiClient().deleteEvent('event-1', { uid: 'owner-1', role: 'ORGANIZER' })
    assert.equal(allowed.status, 200)
    assert.equal(deleted, true)
  })

  it('prevents developers from deleting events they do not own', async () => {
    let deleted = false
  
    adminDb.collection = () => ({
      doc: () => ({
        get: async () => ({
          exists: true,
          get: () => 'owner-1'
        }),
        delete: async () => { deleted = true }
      })
    })
  
    const response = await new EventApiClient().deleteEvent(
      'event-1',
      { uid: 'dev-1', role: 'DEVELOPER' }
    )
  
    assert.equal(response.status, 403)
    assert.equal(deleted, false)
  })
})
