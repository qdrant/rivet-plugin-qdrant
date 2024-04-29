import type {
    ChartNode,
    NodeInputDefinition,
    NodeOutputDefinition,
    PluginNodeImpl,
    PortId,
    Rivet,
    NodeId,
} from "@ironclad/rivet-core";

export type DeletePointNode = ChartNode<"deleteCollection", {
    collectionName: string;
    useCollectionNameInput?: boolean;
}>;

export function deletePointNode(rivet: typeof Rivet) {
    const impl: PluginNodeImpl<DeletePointNode> = {
        create(): DeletePointNode {
            const node: DeletePointNode = {
                id: rivet.newId<NodeId>(),
                data: {
                    collectionName: "",
                    useCollectionNameInput: false,
                },
                title: "Delete Collection",
                type: "deleteCollection",
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
            return inputs;
        },

        getOutputDefinitions(): NodeOutputDefinition[] {
            return [
                {
                    id: "status" as PortId,
                    dataType: "boolean",
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
                    helperMessage: "The name of the collection to delete.",
                }
            ];
        },

        getUIData() {
            return {
                contextMenuTitle: "Delete Collection",
                infoBoxTitle: "Delete Collection Node",
                infoBoxBody: "Deletes a Qdrant collection",
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


            const { deleteCollection } = await import("../nodeEntry");

            const status = await deleteCollection(
                context.getPluginConfig("qdrantUrl") as string,
                collectionName,
                context.getPluginConfig("qdrantApiKey")
            )

            return {
                ["status" as PortId]: {
                    type: "boolean",
                    value: status,
                },
            };
        },
    };

    return rivet.pluginNodeDefinition(impl, "Delete Collection");
}
