import type {
    ChartNode,
    NodeInputDefinition,
    NodeOutputDefinition,
    PluginNodeImpl,
    PortId,
    Rivet,
    NodeId,
} from "@ironclad/rivet-core";

export type UploadPointNode = ChartNode<"uploadPoint", {
    id?: string;
    useIdInput?: boolean;

    collectionName: string;
    useCollectionNameInput?: boolean;

    vectorName?: string;

    payload: Record<string, string>;
    usePayloadInput?: boolean;
}>;

export function uploadPointNode(rivet: typeof Rivet) {
    const impl: PluginNodeImpl<UploadPointNode> = {
        create(): UploadPointNode {
            const node: UploadPointNode = {
                id: rivet.newId<NodeId>(),
                data: {
                    collectionName: "",
                    useCollectionNameInput: false,
                    useIdInput: true,
                    payload: {},
                    usePayloadInput: false,
                },
                title: "Upload Point",
                type: "uploadPoint",
                visualData: {
                    x: 0,
                    y: 0,
                    width: 200,
                },
            };
            return node;
        },

        getInputDefinitions(data): NodeInputDefinition[] {
            const inputs: NodeInputDefinition[] = [];

            if (data.useCollectionNameInput) {
                inputs.push({
                    id: "collectionName" as PortId,
                    dataType: "string",
                    title: "Collection Name",
                });
            }

            if (data.useIdInput) {
                inputs.push({
                    id: "id" as PortId,
                    dataType: "string",
                    title: "ID",
                });
            }

            inputs.push({
                id: "embedding" as PortId,
                dataType: "vector",
                title: "Embedding",
            });

            if (data.usePayloadInput) {
                inputs.push({
                    id: "payload" as PortId,
                    dataType: "object",
                    title: "Payload",
                });
            }

            return inputs;
        },

        getOutputDefinitions(): NodeOutputDefinition[] {
            return [
                {
                    id: "status" as PortId,
                    dataType: "string",
                    title: "Status",
                },
            ];
        },

        getBody(data) {
            return rivet.dedent`
              Collection: ${data.useCollectionNameInput ? "(From Input)" : data.collectionName
                }
            `;
        },

        getEditors(data) {
            return [
                {
                    type: "string",
                    label: "Collection Name",
                    dataKey: "collectionName",
                    useInputToggleDataKey: "useCollectionNameInput",
                    helperMessage: "The collection to add the item to.",
                },
                {
                    type: "string",
                    dataKey: "id",
                    label: "ID",
                    useInputToggleDataKey: "useIdInput",
                    placeholder: "ID",
                },
                {
                    type: "string",
                    dataKey: "vectorName",
                    label: "Vector Name.",
                    helperMessage: "The name of the vector. Uses the default unnamed('') vector if not provided.",
                },
                {
                    type: "anyData",
                    dataKey: "payload",
                    label: "Payload",
                    useInputToggleDataKey: "usePayloadInput",
                    helperMessage: "Payload of the point.",
                    keyPlaceholder: "Key",
                    valuePlaceholder: "Value",
                },
            ];
        },

        getUIData() {
            return {
                contextMenuTitle: "Upsert",
                infoBoxTitle: "Upsert Node",
                infoBoxBody: "Adds a point to a Qdrant collection.",
                group: "Qdrant",
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

            let id: string | number | undefined = rivet.getInputOrData(data, inputData, "id");

            if (id) {
                if (!isNaN(Number(id))) {
                    id = Number(id);
                }
            }

            const embedding = rivet.coerceType(
                inputData["embedding" as PortId],
                "vector"
            );

            const payload = JSON.parse(rivet.getInputOrData(data, inputData, "payload",)) || {};

            const { upsertPoint } = await import("../nodeEntry");

            const status = await upsertPoint(
                context.getPluginConfig("qdrantUrl") as string,
                collectionName,
                id,
                embedding,
                payload,
                data.vectorName,
                context.getPluginConfig("qdrantApiKey")
            )

            return {
                ["status" as PortId]: {
                    type: "string",
                    value: status,
                },
            };
        },
    };

    return rivet.pluginNodeDefinition(impl, "Upload Point");
}
