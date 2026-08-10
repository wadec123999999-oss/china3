# Shanghai field records

These are real-world release records, not research notes. Copy an example, rename it to the correct `SHRUNxxx.json`, replace every example value with real evidence, then run:

```bash
node bin/validate-field-record.mjs field-records/SHRUN001.json
node bin/field-progress.mjs
```

Six launch checks must pass before their associated route/experience becomes `field_verified`. `SHRUN006` is stricter: all seven Tai Chi supplier gates must be `pass` before the product can be offered for booking or payment.
