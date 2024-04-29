// src/nodes/ListCollectionsNode.ts
function listCollectionsNode(rivet) {
  const impl = {
    create() {
      const node = {
        id: rivet.newId(),
        data: {},
        title: "List Collections",
        type: "listCollections",
        visualData: {
          x: 0,
          y: 0,
          width: 200
        }
      };
      return node;
    },
    getInputDefinitions() {
      return [];
    },
    getOutputDefinitions() {
      return [
        {
          id: "collectionNames",
          dataType: "string[]",
          title: "Collection Names",
          defaultValue: []
        }
      ];
    },
    getBody() {
      return "";
    },
    getEditors() {
      return [];
    },
    getUIData() {
      return {
        contextMenuTitle: "List Collections",
        group: "Qdrant",
        infoBoxBody: "This node lists all the collections in the Qdrant service as string[].",
        infoBoxTitle: "List Collections"
      };
    },
    async process(_data, _inputData, context) {
      if (context.executor !== "nodejs") {
        throw new Error("This node can only be run using a nodejs executor.");
      }
      const { listCollections } = await import("../dist/nodeEntry.cjs");
      const collections = await listCollections(
        context.getPluginConfig("qdrantUrl"),
        context.getPluginConfig("qdrantApiKey")
      );
      return {
        ["collectionNames"]: {
          type: "string[]",
          value: collections
        }
      };
    }
  };
  return rivet.pluginNodeDefinition(impl, "List Collections");
}

// src/nodes/UploadPointNode.ts
function uploadPointNode(rivet) {
  const impl = {
    create() {
      const node = {
        id: rivet.newId(),
        data: {
          collectionName: "",
          useCollectionNameInput: false,
          useIdInput: true,
          payload: {},
          usePayloadInput: false
        },
        title: "Upload Point",
        type: "uploadPoint",
        visualData: {
          x: 0,
          y: 0,
          width: 200
        }
      };
      return node;
    },
    getInputDefinitions(data) {
      const inputs = [];
      if (data.useCollectionNameInput) {
        inputs.push({
          id: "collectionName",
          dataType: "string",
          title: "Collection Name"
        });
      }
      if (data.useIdInput) {
        inputs.push({
          id: "id",
          dataType: "string",
          title: "ID"
        });
      }
      inputs.push({
        id: "embedding",
        dataType: "vector",
        title: "Embedding"
      });
      if (data.usePayloadInput) {
        inputs.push({
          id: "payload",
          dataType: "object",
          title: "Payload"
        });
      }
      return inputs;
    },
    getOutputDefinitions() {
      return [
        {
          id: "status",
          dataType: "string",
          title: "Status"
        }
      ];
    },
    getBody(data) {
      return rivet.dedent`
              Collection: ${data.useCollectionNameInput ? "(From Input)" : data.collectionName}
            `;
    },
    getEditors(data) {
      return [
        {
          type: "string",
          label: "Collection Name",
          dataKey: "collectionName",
          useInputToggleDataKey: "useCollectionNameInput",
          helperMessage: "The collection to add the item to."
        },
        {
          type: "string",
          dataKey: "id",
          label: "ID",
          useInputToggleDataKey: "useIdInput",
          placeholder: "ID"
        },
        {
          type: "string",
          dataKey: "vectorName",
          label: "Vector Name.",
          helperMessage: "The name of the vector. Uses the default unnamed('') vector if not provided."
        },
        {
          type: "anyData",
          dataKey: "payload",
          label: "Payload",
          useInputToggleDataKey: "usePayloadInput",
          helperMessage: "Payload of the point.",
          keyPlaceholder: "Key",
          valuePlaceholder: "Value"
        }
      ];
    },
    getUIData() {
      return {
        contextMenuTitle: "Upsert",
        infoBoxTitle: "Upsert Node",
        infoBoxBody: "Adds a point to a Qdrant collection.",
        group: "Qdrant"
      };
    },
    async process(data, inputData, context) {
      if (context.executor !== "nodejs") {
        throw new Error("This node can only be run using a nodejs executor.");
      }
      const collectionName = rivet.getInputOrData(
        data,
        inputData,
        "collectionName"
      );
      let id = rivet.getInputOrData(data, inputData, "id");
      if (id) {
        if (!isNaN(Number(id))) {
          id = Number(id);
        }
      }
      const embedding = rivet.coerceType(
        inputData["embedding"],
        "vector"
      );
      const payload = JSON.parse(rivet.getInputOrData(data, inputData, "payload")) || {};
      const { upsertPoint } = await import("../dist/nodeEntry.cjs");
      const status = await upsertPoint(
        context.getPluginConfig("qdrantUrl"),
        collectionName,
        id,
        embedding,
        payload,
        data.vectorName,
        context.getPluginConfig("qdrantApiKey")
      );
      return {
        ["status"]: {
          type: "string",
          value: status
        }
      };
    }
  };
  return rivet.pluginNodeDefinition(impl, "Upload Point");
}

// src/nodes/SearchPointsNode.ts
function searchPointsNode(rivet) {
  const impl = {
    create() {
      const node = {
        id: rivet.newId(),
        data: {
          collectionName: "",
          useCollectionNameInput: false,
          filter: {},
          useFilterInput: false
        },
        title: "Search Points",
        type: "searchPoints",
        visualData: {
          x: 0,
          y: 0,
          width: 200
        }
      };
      return node;
    },
    getInputDefinitions(data) {
      const inputs = [];
      if (data.useCollectionNameInput) {
        inputs.push({
          id: "collectionName",
          dataType: "string",
          title: "Collection Name"
        });
      }
      inputs.push({
        id: "embedding",
        dataType: "vector",
        title: "Embedding"
      });
      if (data.useFilterInput) {
        inputs.push({
          id: "filter",
          dataType: "object",
          title: "Search Filter"
        });
      }
      return inputs;
    },
    getOutputDefinitions() {
      return [
        {
          id: "status",
          dataType: "string",
          title: "Status"
        }
      ];
    },
    getBody(data) {
      return rivet.dedent`
              Collection: ${data.useCollectionNameInput ? "(From Input)" : data.collectionName}
            `;
    },
    getEditors(data) {
      return [
        {
          type: "string",
          label: "Collection Name",
          dataKey: "collectionName",
          useInputToggleDataKey: "useCollectionNameInput",
          helperMessage: "The collection to add the item to."
        },
        {
          type: "string",
          dataKey: "vectorName",
          label: "Vector Name",
          helperMessage: "The name of the vector. Uses the default unnamed('') vector if not provided."
        },
        {
          type: "number",
          dataKey: "limit",
          label: "Number of Results",
          helperMessage: "The number of results to return. Defaults to 10."
        },
        {
          type: "number",
          dataKey: "scoreThreshold",
          label: "Score Threshold",
          helperMessage: "The minimum score for a result to be returned. Defaults to 0"
        },
        {
          type: "anyData",
          dataKey: "filter",
          label: "Search Filter",
          useInputToggleDataKey: "useFilterInput",
          helperMessage: "Filter to apply during search."
        }
      ];
    },
    getUIData() {
      return {
        contextMenuTitle: "Search",
        infoBoxTitle: "Search",
        infoBoxBody: "Search for points in a Qdrant collection.",
        group: "Qdrant"
      };
    },
    async process(data, inputData, context) {
      if (context.executor !== "nodejs") {
        throw new Error("This node can only be run using a nodejs executor.");
      }
      const collectionName = rivet.getInputOrData(
        data,
        inputData,
        "collectionName"
      );
      const embedding = rivet.coerceType(
        inputData["embedding"],
        "vector"
      );
      const filter = JSON.parse(rivet.getInputOrData(data, inputData, "filter")) || {};
      const { searchPoints } = await import("../dist/nodeEntry.cjs");
      const results = await searchPoints(
        context.getPluginConfig("qdrantUrl"),
        collectionName,
        embedding,
        filter,
        data.limit,
        data.scoreThreshold,
        data.vectorName,
        context.getPluginConfig("qdrantApiKey")
      ) || [];
      return {
        ["points"]: {
          type: "object[]",
          value: results
        }
      };
    }
  };
  return rivet.pluginNodeDefinition(impl, "Upload Point");
}

// src/nodes/DeleteCollectionNode.ts
function deletePointNode(rivet) {
  const impl = {
    create() {
      const node = {
        id: rivet.newId(),
        data: {
          collectionName: "",
          useCollectionNameInput: false
        },
        title: "Delete Collection",
        type: "deleteCollection",
        visualData: {
          x: 0,
          y: 0,
          width: 200
        }
      };
      return node;
    },
    getInputDefinitions(data) {
      const inputs = [];
      if (data.useCollectionNameInput) {
        inputs.push({
          id: "collectionName",
          dataType: "string",
          title: "Collection Name"
        });
      }
      return inputs;
    },
    getOutputDefinitions() {
      return [
        {
          id: "status",
          dataType: "boolean",
          title: "Status"
        }
      ];
    },
    getBody(data) {
      return rivet.dedent`
              Collection: ${data.useCollectionNameInput ? "(From Input)" : data.collectionName}
            `;
    },
    getEditors(data) {
      return [
        {
          type: "string",
          label: "Collection Name",
          dataKey: "collectionName",
          useInputToggleDataKey: "useCollectionNameInput",
          helperMessage: "The name of the collection to delete."
        }
      ];
    },
    getUIData() {
      return {
        contextMenuTitle: "Delete Collection",
        infoBoxTitle: "Delete Collection Node",
        infoBoxBody: "Deletes a Qdrant collection",
        group: "Qdrant"
      };
    },
    async process(data, inputData, context) {
      if (context.executor !== "nodejs") {
        throw new Error("This node can only be run using a nodejs executor.");
      }
      const collectionName = rivet.getInputOrData(
        data,
        inputData,
        "collectionName"
      );
      const { deleteCollection } = await import("../dist/nodeEntry.cjs");
      const status = await deleteCollection(
        context.getPluginConfig("qdrantUrl"),
        collectionName,
        context.getPluginConfig("qdrantApiKey")
      );
      return {
        ["status"]: {
          type: "boolean",
          value: status
        }
      };
    }
  };
  return rivet.pluginNodeDefinition(impl, "Delete Collection");
}

// src/index.ts
var initializer = (rivet) => {
  const plugin = {
    id: "qdrant",
    name: "Qdrant",
    configSpec: {
      qdrantApiKey: {
        type: "secret",
        label: "Qdrant API Key",
        description: "The API key for the Qdrant service.",
        pullEnvironmentVariable: "QDRANT_API_KEY",
        helperText: "You may also set the QDRANT_API_KEY environment variable."
      },
      qdrantUrl: {
        type: "string",
        label: "Qdrant REST URL",
        default: "http://localhost:6333",
        description: "The URL for the Qdrant service.",
        pullEnvironmentVariable: "QDRANT_URL",
        helperText: "You may also set the QDRANT_URL environment variable."
      }
    },
    contextMenuGroups: [
      {
        id: "qdrant",
        label: "Qdrant"
      }
    ],
    register: (register) => {
      register(listCollectionsNode(rivet));
      register(uploadPointNode(rivet));
      register(searchPointsNode(rivet));
      register(deletePointNode(rivet));
    }
  };
  return plugin;
};
var src_default = initializer;
export {
  src_default as default
};
