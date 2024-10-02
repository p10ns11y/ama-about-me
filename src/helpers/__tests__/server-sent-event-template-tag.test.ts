import { test, expect } from 'bun:test';

import { type Event, serverSentEvent } from '../server-sent-event-template-tag'

test('retutns SSE format', () => {
  // testing data
  let eventDetail = {
    name: 'testEvent', 
    type: 'data', 
    value: 'test event message',
  } as Event;

  let actualServerSentEvent = serverSentEvent`
      ${eventDetail}
  `

  let expectedServerSentEvent = `event: ${eventDetail.name}\ndata: ${eventDetail.value}\n\n`

  expect(actualServerSentEvent).toEqual(expectedServerSentEvent)

  // testing data chunks
  let eventDetailWithChunks = {
    name: 'testEvent', 
    type: 'chunks', 
    value: ['test event message one', 'test event message two'],
  } as Event;


  let actualServerSentEventWithChunks = serverSentEvent`
    this text will ignored and formatted to SSE with
    the following information available in eventDetailWithChunks
    ${eventDetailWithChunks}
  `

  let expectedServerSentEventWithChunks = `
event: ${eventDetailWithChunks.name}
data: ${eventDetailWithChunks.value[0]}
data: ${eventDetailWithChunks.value[1]}

`.trimStart()

  expect(actualServerSentEventWithChunks).toEqual(expectedServerSentEventWithChunks)
})