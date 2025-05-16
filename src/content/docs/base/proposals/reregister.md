---
title: Re-register actions after a crash
---

When Neuro crashes and restarts, she may send this command:

```json
{
  "command": "actions/reregister_all"
}
```

Upon receipt of this command, all actions she had access to should be re-registered to her. You may also want to return context she had beforehand. <!-- TODO: wait for Vedal's response -->
