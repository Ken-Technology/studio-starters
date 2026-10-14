# Ken Studio starters

Starter templates for [Ken Studio](https://getken.ai): personalized pages and docs built from Liquid bundles. Copy a starter, edit it, and publish it from your workspace.

## What a Studio bundle is

A bundle is a folder that Studio renders into a page or doc for each recipient.

| File | Required | Purpose |
|---|---|---|
| `studio.json` | yes | Manifest: name, kind, the variables the template expects, and render settings |
| `template.liquid` | yes | The Liquid template, rendered once per recipient |
| `fallback.liquid` | no | Rendered when a required variable is missing for a recipient |
| `assets/` | no | Images, fonts and other static files the template references |
| `samples/` | no | Sample data (one JSON file per sample recipient) for previews and tests |

## Layout

Each starter lives in `starters/<slug>/` and is a complete bundle:

```
starters/
  <slug>/
    studio.json
    template.liquid
    fallback.liquid
    assets/
    samples/
```

`index.json` at the root lists every starter so tools can discover them:

```json
{ "kenStudio": "1", "starters": [] }
```

## Contributing

Add a folder under `starters/`, make sure it renders against its `samples/`, and add an entry to `index.json`.

## License

MIT. See [LICENSE](LICENSE).
