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
    ${{
      type: 'data',
      value: 'another event message with event name'
    }}
    ${{
      type: 'chunks',
      value: [
        'another event data chunk message one with event name', 
        'another event data chunk message two with event name'
      ]
    }}
    ${{
      name: 'anotherTestEvent',
      type: 'data',
      value: 'another event message with event name'
    }}
  `

  // ${{
  //   name: 'html-content',
  //   type: 'data',
  //   value: `
  //     <p style="color: blueviolet">Question: <span>input</span></p>
  //     <p style="color: olive">Answer: <span>answer</span></p>
  //   `.trim()
  // }}

  let expectedServerSentEventWithChunks = `
event: ${eventDetailWithChunks.name}
data: ${eventDetailWithChunks.value[0]}
data: ${eventDetailWithChunks.value[1]}

data: another event message with event name

data: another event data chunk message one with event name
data: another event data chunk message two with event name

event: anotherTestEvent
data: another event message with event name

`.trimStart()

  expect(actualServerSentEventWithChunks).toEqual(expectedServerSentEventWithChunks)

  
})