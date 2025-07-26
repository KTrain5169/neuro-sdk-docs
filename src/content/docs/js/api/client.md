---
title: NeuroClient
---

To start a connection, initialise the `NeuroClient` class:

```ts
import { NeuroClient } from 'neuro-game-sdk'

const client = new NeuroClient(WEBSOCKET_URL, "neuro-game-api", () => {
    // onConnected function - functions runs after connecting
    console.log("Neuro API connection initialised!")
})
```

You can then use this constant to do actions with Neuro.

```ts
client.sendContext("Welcome to the staging area!")
```

If you want, you can also choose to handle WS closed/error events like so:

```ts
// Inside the onConnected function
client.onClose = () => {
    console.warn("Connection to Neuro closed.")
}
client.onError = (error: any) => {
    console.error(`NeuroClient error: ${error}`)
}
```

Lastly, you may wish to assert that the client exists within the function that runs on connection to Neuro. This avoids errors with TypeScript since it wouldn't know that the connection exists.

```ts
import assert from 'node:assert'

// Inside the onConnected function
assert(client instanceof NeuroClient)
```
