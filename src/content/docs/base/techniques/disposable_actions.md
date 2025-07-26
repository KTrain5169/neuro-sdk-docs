---
title: Disposable actions
description: Allow Neuro to only use an action once during an action force.
banner:
  content: |
    This site is under <b>heavy WIP</b>, so contributions on GitHub are much appreciated!
    You've most likely been pointed to this site to point towards a concept, or something.
    Either way, take at least some of the info on this page with a grain of salt, and also don't expect much info since it's very incomplete on content.
---

Disposable actions are used to refer to actions that can be used a certain amount of time before being unregistered.
This technique is often used in conjunction with [action forces](/neuro-sdk-docs/base/actions/force) to, for example, only allow Neuro to do actions during her turn.
It's a safer way to force an action from Neuro without running the risk of race conditions higher.

## Making a disposable action

Suppose you're making a Tic Tac Toe game with Neuro as the opponent. You could register all actions and only actually affect the game when it's Neuro's turn. But, it would be better (and perhaps more timely) to use disposable actions instead.

In this example game, when it is Neuro's turn, you'll want to send an actions register packet first:

```json
{
  "command": "actions/register",
  "game": "Tic Tac Toe vs Neuro",
  "data": {
    "actions": [
      {
        "name": "play_a1",
        "description": "Play in square a1"
      },
      {
        "name": "play_a2",
        "description": "Play in square a2"
      },
      {
        "name": "play_a3",
        "description": "Play in square a3"
      },
      {
        "name": "play_a4",
        "description": "Play in square a4"
      },
      {
        "name": "play_a5",
        "description": "Play in square a5"
      },
      {
        "name": "play_a6",
        "description": "Play in square a6"
      },
      {
        "name": "play_a7",
        "description": "Play in square a7"
      },
      {
        "name": "play_a8",
        "description": "Play in square a8"
      },
      {
        "name": "play_a9",
        "description": "Play in square a9"
      }
    ]
  }
}
```

Then, send an actions force command:

```json
{
  "command": "actions/force",
  "game": "Tic Tac Toe vs Neuro",
  "data": {
    "state": "The game has started and you were chosen to go first. You are X, your opponent is O.",
    "query": "It is now your turn. Please select a square to place an X in.",
    "ephemeral_context": true,
    "action_names": [
      "play_a1",
      "play_a2",
      "play_a3",
      "play_a4",
      "play_a5",
      "play_a6",
      "play_a7",
      "play_a8",
      "play_a9"
    ]
  }
}
```

Once Neuro sends an action command back, then unregister the actions _before_ an action result is sent:

```json
{
  "command": "actions/unregister",
  "game": "Tic Tac Toe vs Neuro",
  "data": {
    "actions": [
      "play_a1",
      "play_a2",
      "play_a3",
      "play_a4",
      "play_a5",
      "play_a6",
      "play_a7",
      "play_a8",
      "play_a9"
    ]
  }
}

// afterwards

{
  "command": "action/result",
  "game": "Tic Tac Toe vs Neuro",
  "data": {
    "id": "action_1",
    "success": true,
    "message": "Successfully placed O."
  }
}
```

This disposes the action before Neuro sends another action, preventing potential race conditions from happening.

## Unsuccessful actions

If the `actions/force` fails, you _should not_ unregister the actions, and instead, send back an unsuccessful action result so Neuro can retry it.

In our example, this might happen if Neuro tries to place on an already occupied square. In that case, instead of sending the above unregister packet, we send the following action result packet:

```json
// Do not unregister actions!

{
  "command": "action/result",
  "game": "Tic Tac Toe vs Neuro",
  "data": {
    "id": "action_id",
    "success": false,
    "message": "There is already an O or X placed there."
  }
}
```

As stated on the [action result page](/neuro-sdk-docs/base/actions/result), if Neuro receives an unsuccessful result, she will immediately retry it, and if there are no valid actions that Neuro can execute and is part of the action force, [the action force will be ignored](/neuro-sdk-docs/base/actions/force). If you're not careful, this can enter a softlocked state within your game due to your game expecting Neuro to send an action that she won't send (and won't know how to send).
