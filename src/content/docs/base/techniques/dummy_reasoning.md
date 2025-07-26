---
title: Dummy reasoning actions
banner:
  content: |
    This site is under <b>heavy WIP</b>.
    You've most likely been given access to this site to point towards a concept, or something.
    Either way, take some of the info on this page with a grain of salt.
---

Due to Neuro (at least, as observed) not using a reasoning model (l\*tency), she can have trouble remembering logical steps to something that is supposed to be in her memory. Dummy reasoning actions would allow her to write those down to the game so that she can reason somewhere without .

Take a game like 20 Questions. Neuro might forget her answer, and would therefore make up reasoning on the spot to justify her also newly made-up answer, which might be... less than sound logic.
You might want to register a dummy action like this:

```json
{
  "command": "actions/register",
  "game": "20 Questions",
  "data": {
    "actions": [
      {
        "name": "answer",
        "description": "Use this action to write your answer and reasoning that you will reveal later. Do not tell anyone the answer, you must keep it a secret until they guess it correctly, and you should use the reason to answer your partner's questions without giving away too much.",
        "schema": {
          "type": "object",
          "properties": {
            "answer": { "type": "string" },
            "reasoning": { "type": "string" }
          },
          "required": ["answer", "reasoning"]
        }
      }
    ]
  }
}
```

After Neuro executes this action, you might then want to send the stuff as context or action result to Neuro immediately after. Using our example:

```jsonc
{
    "command": "context",
    "game": "20 Questions",
    "data": {
        "message": "As a reminder, your chosen answer is (answer) and your reasoning for that is (reason).\nRemember, don't reveal the answer, and answer the questions!",
        "silent": true // in our example, let's hope this works
    }
}

// Or if you return it as an action result:
{
    "command": "action/result",
    "game": "20 Questions",
    "data": {
        "id": "action_id",
        "success": true,
        "message": "As a reminder, your chosen answer is (answer) and your reasoning for that is (reason).\nRemember, don't reveal the answer, and answer the questions!"
    }
}
```

This should theoretically allow Neuro to reason stuff with less reliance on her (admittedly sometimes goldfish) memory, similar to reasoning models.
There isn't really necessarily a name or description you should use, the point of the action is to allow Neuro to write stuff _somewhere_.
