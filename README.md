![68747470733a2f2f72697665742e69726f6e636c61646170702e636f6d2f696d672f6c6f676f2d62616e6e65722d776964652e706e67](https://github.com/Anush008/fastembed-rs/assets/46051506/450c8ccb-8d1e-4c04-94e7-b39cc27705ea)

# Rivet Qdrant Plugin

A plugin to add support for using [Qdrant](https://qdrant.tech) in [Rivet](https://rivet.ironcladapp.com/).

> [!IMPORTANT]  
> You must use the [Node Executor](https://rivet.ironcladapp.com/docs/user-guide/executors#node) with this plugin.

## Using the plugin

### In Rivet

To use this plugin in Rivet:

1. Open the plugins overlay at the top of the screen.
2. Search for "rivet-plugin-qdrant".
3. Click the "Install" button to install the plugin in your current project.

### In the SDK

1. Import the plugin and Rivet into your project:

   ```ts
   import * as Rivet from "@ironclad/rivet";
   import RivetPluginQdrant from "rivet-plugin-qdrant";
   ```

2. Initialize the plugin and register the nodes with the `globalRivetNodeRegistry`:

   ```ts
   Rivet.globalRivetNodeRegistry.registerPlugin(RivetPluginQdrant(Rivet));
   ```

   (You may also use your own node registry if you wish, instead of the global one.)

3. The nodes will now work when run with `runGraphInFile` or `createProcessor`.

## Configuration

### In Rivet

By default, the plugin will attempt to connect to a Qdrant instance at `http://localhost:6333`. To configure this value, you can open the Settings window, navigate to the Plugins area, and configure the `Database URL` value. There's also an option to set an optional API key.

### In the SDK

Using `createProcessor` or `runGraphInFile`, pass in via `pluginSettings` in `RunGraphOptions`:

```ts
await createProcessor(project, {
  ...etc,
  pluginSettings: {
    qdrant: {
      qdrantUrl: "http://localhost:6333",
    },
  },
});
```
