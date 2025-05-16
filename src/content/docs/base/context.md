---
title: Context for Neuro
---

To send Neuro new context regarding your game, send Neuro this packet:

```ts
{
    "command": "context",
    "game": string,
    "data": {
        "message": string,
        "silent": boolean
    }
}
```

## Parameters

- `message` - The context message Neuro will keep.
- `silent` - Whether or not Neuro will be prompted to vocally react to the command. Note that `true` doesn't mean she'll always be silent about it (such as if the context message was an error message), and that `false` doesn't mean she'll always react to it (she might be busy talking to chat or someone else).

## Techniques in conjunction with this packet

- [Asynchronous action results](/base/techniques/async_action_results)
