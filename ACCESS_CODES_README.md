# Access Codes Management

## Setup Instructions

1. **Copy the example file:**

   ```bash
   cp config/access-codes-example.json config/access-codes.json
   ```

2. **Edit your access codes:**
   Open `config/access-codes.json` and modify the `accessCodes` array:
   ```json
   {
     "accessCodes": [
       "your-secret-code",
       "admin2024",
       "restaurant-manager",
       "settings-access"
     ],
     "enableDynamicCode": true,
     "dynamicCodePrefix": "day"
   }
   ```

## Configuration Options

### `accessCodes` (array)

- List of valid access codes
- Case-insensitive matching
- Add or remove codes as needed

### `enableDynamicCode` (boolean)

- `true`: Enables daily-changing dynamic codes
- `false`: Disables dynamic codes
- Default: `true`

### `dynamicCodePrefix` (string)

- Prefix for dynamic codes
- Dynamic codes follow pattern: `[prefix][dayOfYear]`
- Example: `day342` (day 342 of the year)
- Default: `"day"`

## Security Best Practices

1. **Keep codes private**: Never commit `access-codes.json` to version control
2. **Use strong codes**: Avoid simple words or predictable patterns
3. **Regular rotation**: Change codes periodically
4. **Limit access**: Only share codes with authorized personnel

## Dynamic Codes

Dynamic codes change daily based on the day of the year:

- January 1st = `day1`
- December 31st = `day365` (or `day366` in leap years)

You can change the prefix by modifying `dynamicCodePrefix`:

```json
{
  "dynamicCodePrefix": "menu"
  // This would generate codes like "menu342"
}
```

## Adding New Codes

Simply edit the JSON file and add new codes to the array:

```json
{
  "accessCodes": ["existing-code", "new-code-here", "another-new-code"]
}
```

Changes take effect immediately when the page is refreshed.

## Troubleshooting

- **Config not loading**: Check file path is `config/access-codes.json`
- **Codes not working**: Verify JSON syntax is valid
- **Dynamic codes disabled**: Check `enableDynamicCode` is `true`
- **Fallback codes**: System uses built-in fallbacks if config fails to load
