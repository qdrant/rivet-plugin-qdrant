import type { RivetPlugin, RivetPluginInitializer } from "@ironclad/rivet-core";

import { listCollectionsNode } from "./nodes/ListCollectionsNode";
import { uploadPointNode } from "./nodes/UploadPointNode";
import { searchPointsNode } from "./nodes/SearchPointsNode";
import { deletePointNode } from "./nodes/DeleteCollectionNode";

const initializer: RivetPluginInitializer = (rivet) => {

  const plugin: RivetPlugin = {
    id: "qdrant",

    name: "Qdrant",

    configSpec: {
      qdrantApiKey: {
        type: 'secret',
        label: 'Qdrant API Key',
        description: 'The API key for the Qdrant service.',
        pullEnvironmentVariable: 'QDRANT_API_KEY',
        helperText: 'You may also set the QDRANT_API_KEY environment variable.',
      },
      qdrantUrl: {
        type: 'string',
        label: 'Qdrant REST URL',
        default: 'http://localhost:6333',
        description: 'The URL for the Qdrant service.',
        pullEnvironmentVariable: 'QDRANT_URL',
        helperText: 'You may also set the QDRANT_URL environment variable.',
      },
    },

    contextMenuGroups: [
      {
        id: "qdrant",
        label: "Qdrant",
      },
    ],

    register: (register) => {
      register(listCollectionsNode(rivet));
      register(uploadPointNode(rivet));
      register(searchPointsNode(rivet));
      register(deletePointNode(rivet));
    },
  };

  // Make sure to return your plugin definition.
  return plugin;
};

// Make sure to default export your plugin.
export default initializer;
