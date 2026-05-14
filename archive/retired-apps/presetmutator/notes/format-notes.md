# Format Notes

Use this file to track:

- target plugin / synth
- preset file extension
- whether the app can parse/export without the plugin installed
- known header bytes
- checksum or size fields
- parameter block offsets
- known semantic parameters
- risky parameter groups
- fields that must not be mutated

## Vital

- preset file extension: `.vital`
- bank file extension: `.vitalbank`
- parse/export without plugin installed: likely yes
- current working assumption: `.vital` is structured text data and should be treated as semantic-first
- current v1 export target: individual `.vital` files, not banks
- see [notes/vital-adapter.md](/Users/andreiolaru/Library/CloudStorage/Dropbox/Collections/Kreativ%20Sound%20Collection/Experimental/PRESETMUTATOR/notes/vital-adapter.md)
