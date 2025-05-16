---
title: TypeScript support
---

The JavaScript SDK also has built-in support for TypeScript. TypeScript is a typed superset of JavaScript that brings stricter typing to JavaScript (a normally loosely typed language).

When using exported functions from the JavaScript/TypeScript SDK, compatible editors will warn about:

- Unexpected, missing or invalid props being passed to functions as inputs.
- Input/output types being different than specified.

## Types (TBD)

The SDK has the following developer-facing types:

### Action packets

When using `actions/register` the action details follow the below interface:

```ts
interface ActionDetails {
  name: string;
  description: string;
  schema?: any;
}
```

Which is then used in this packet:

```ts
interface ActionsRegister {
  command: "actions/register";
  game: string;
  data: {
    actions: ActionDetails[];
  };
}
```
