import type {
    ChartNode,
    NodeInputDefinition,
    NodeOutputDefinition,
    PluginNodeImpl,
    PortId,
    Rivet,
    NodeId,
} from "@ironclad/rivet-core";

export type DeletePointsNode = ChartNode<"deletePoints", {
    collectionName: string;
    useCollectionNameInput?: boolean;

    filter: Record<string, any>;
    useFilterInput?: boolean;
}>;

export function deletePointsNode(rivet: typeof Rivet) {
    const impl: PluginNodeImpl<DeletePointsNode> = {
        create(): DeletePointsNode {
            const node: DeletePointsNode = {
                id: rivet.newId<NodeId>(),
                data: {
                    collectionName: "",
                    useCollectionNameInput: false,

                    filter: {},
                    useFilterInput: false,
                },
                title: "Delete Points",
                type: "deletePoints",
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

            if (data.useFilterInput) {
                inputs.push({
                    id: "filter" as PortId,
                    dataType: "object",
                    title: "Delete Filter",
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
                    type: "anyData",
                    dataKey: "filter",
                    label: "Delete Filter",
                    useInputToggleDataKey: "useFilterInput",
                    helperMessage: "Filter to apply during delete.",
                },
            ];
        },

        getUIData() {
            return {
                contextMenuTitle: "Delete",
                infoBoxTitle: "Delete Points",
                infoBoxBody: "Delete points in a Qdrant collection.",
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

            const filter = JSON.parse(rivet.getInputOrData(data, inputData, "filter")) || {};

            const { deletePoints } = await import("../nodeEntry");

            const result = await deletePoints(
                context.getPluginConfig("qdrantUrl") as string,
                collectionName,
                filter,
                context.getPluginConfig("qdrantApiKey")
            ) || [];

            return {
                ["status" as PortId]: {
                    type: "string",
                    value: result,
                },
            };
        },
    };

    return rivet.pluginNodeDefinition(impl, "Delete Points");
}
