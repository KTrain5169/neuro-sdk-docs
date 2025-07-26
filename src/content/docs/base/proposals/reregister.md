---
title: Re-register actions after a crash
banner:
  content: |
    This site is under <b>heavy WIP</b>.
    You've most likely been pointed to this site to point towards a concept, or something.
    Either way, take at least some of the info on this page with a grain of salt, and also don't expect much info since it's very incomplete on content.
---

When Neuro crashes and restarts, she may send this command:

```json
{
  "command": "actions/reregister_all"
}
```

Upon receipt of this command, all actions she had access to should be re-registered to her. You may also want to return context she had beforehand. <!-- TODO: wait for Vedal's response -->
