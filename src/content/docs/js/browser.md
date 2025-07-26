---
title: Browser usage
banner:
  content: |
    This site is under <b>heavy WIP</b>.
    You've most likely been pointed to this site to point towards a concept, or something.
    Either way, take at least some of the info on this page with a grain of salt.
---

In addition to being available as a module published on the npm registry, you can also get it by using `<script>` tags in your `<body>`.

Simply place this as a `<script>` tag somewhere in your body:

```html
<\!-- Using unpkg -\->
<script src="https://unpkg.com/neuro-game-sdk/dist/browser/neuro-game-sdk.min.js"></script>

<\!-- Using jsDelivr -\->
<script src="https://cdn.jsdelivr.net/npm/neuro-game-sdk/dist/browser/neuro-game-sdk.min.js"></script>
```

And congrats! You now have the Neuro Game SDK in your browser (loaded as `NeuroGameSdk`) that you can use.

```html
<script>
  const { NeuroClient } = NeuroGameSdk

  const NEURO_SERVER_URL = 'ws://localhost:8000'
  const GAME_NAME = 'Guess the Number'

  const neuroClient = new NeuroClient(NEURO_SERVER_URL, GAME_NAME, () => {
    neuroClient.registerActions([
    {
      name: 'guess_number',
      description: 'Guess the number between 1 and 10.',
      schema: {
        type: 'object',
        properties: {
          number: { type: 'integer', minimum: 1, maximum: 10 },
        },
        required: ['number'],
      },
    },
  ])

  let targetNumber = Math.floor(Math.random() * 10) + 1

  neuroClient.onAction(actionData => {
    if (actionData.name === 'guess_number') {
      const guessedNumber = actionData.params.number
      if (
        typeof guessedNumber !== 'number' ||
        guessedNumber < 1 ||
        guessedNumber > 10
      ) {
        neuroClient.sendActionResult(
          actionData.id,
          false,
          'Invalid number. Please guess a number between 1 and 10.'
        )
        return
      }

      if (guessedNumber === targetNumber) {
        neuroClient.sendActionResult(
          actionData.id,
          true,
          `Correct! The number was ${targetNumber}. Generating a new number.`
        )
        targetNumber = Math.floor(Math.random() * 10) + 1
        promptNeuroAction()
      } else {
        neuroClient.sendActionResult(
          actionData.id,
          true,
          `Incorrect. The number is ${
            guessedNumber < targetNumber ? 'higher' : 'lower'
          }. Try again.`
        )
        promptNeuroAction()
      }
    } else {
      neuroClient.sendActionResult(actionData.id, false, 'Unknown action.')
    }
  })

  neuroClient.sendContext(
    'Game started. I have picked a number between 1 and 10.',
    false
  )

  function promptNeuroAction() {
    const availableActions = ['guess_number']
    const query = 'Please guess a number between 1 and 10.'
    const state = 'Waiting for your guess.'
    neuroClient.forceActions(query, availableActions, state)
  }

  promptNeuroAction()
  })
</script>
```
