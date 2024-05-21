import type {
    ChartNode,
    NodeInputDefinition,
    NodeOutputDefinition,
    PluginNodeImpl,
    PortId,
    Rivet,
    NodeId,
} from "@ironclad/rivet-core";

export type GetPointsNode = ChartNode<"getPoints", {

    collectionName: string;
    useCollectionNameInput?: boolean;

    ids: any[];
    useIdsInput: boolean;
}>;

export function getPointsNode(rivet: typeof Rivet) {
    const impl: PluginNodeImpl<GetPointsNode> = {
        create(): GetPointsNode {
            const node: GetPointsNode = {
                id: rivet.newId<NodeId>(),
                data: {
                    collectionName: "",
                    useCollectionNameInput: false,
                    ids: [],
                    useIdsInput: false,
                },
                title: "Get Points",
                type: "getPoints",
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

            if (data.useIdsInput) {
                inputs.push({
                    id: "ids" as PortId,
                    dataType: "object[]",
                    title: "Point IDs",
                });
            }

            return inputs;
        },

        getOutputDefinitions(): NodeOutputDefinition[] {
            return [
                {
                    id: "points" as PortId,
                    dataType: "object[]",
                    title: "Points",
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
                    dataKey: "ids",
                    label: "Point IDs",
                    useInputToggleDataKey: "useIdsInput",
                    helperMessage: "The list of points IDs to retrieve.",
                },
            ];
        },

        getUIData() {
            return {
                contextMenuTitle: "Get Points",
                infoBoxTitle: "Get Points",
                infoBoxBody: "Retrieves points from a collection.",
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
            const ids = rivet.getInputOrData(data, inputData, "ids", "any[]");

            const { getPoints } = await import("../nodeEntry");

            const results = await getPoints(
                context.getPluginConfig("qdrantUrl") as string,
                collectionName,
                ids,
                context.getPluginConfig("qdrantApiKey")
            ) || [];

            return {
                ["points" as PortId]: {
                    type: "object[]",
                    value: results,
                },
            };
        },
    };

    return rivet.pluginNodeDefinition(impl, "Get Points");
}
