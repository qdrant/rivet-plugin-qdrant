import type {
    ChartNode,
    NodeInputDefinition,
    NodeOutputDefinition,
    PluginNodeImpl,
    PortId,
    Rivet,
    NodeId,
} from "@ironclad/rivet-core";

export type ScrollPointsNode = ChartNode<"scrollPoints", {

    collectionName: string;
    useCollectionNameInput?: boolean;

    limit?: number;
    offset?: string | number;

    filter?: Record<string, any>;
    useFilterInput?: boolean;
}>;

export function scrollPointsNode(rivet: typeof Rivet) {
    const impl: PluginNodeImpl<ScrollPointsNode> = {
        create(): ScrollPointsNode {
            const node: ScrollPointsNode = {
                id: rivet.newId<NodeId>(),
                data: {
                    collectionName: "",
                    useCollectionNameInput: false,

                    limit: 10,
                    offset: undefined,

                    filter: undefined,
                    useFilterInput: false,
                },
                title: "Scroll Points",
                type: "scrollPoints",
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
                    title: "Scroll Filter",
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
                    type: "number",
                    dataKey: "limit",
                    label: "Number of Results",
                    helperMessage: "The number of results to return. Defaults to 10.",
                },
                {
                    type: "anyData",
                    dataKey: "offset",
                    label: "Offset point ID",
                    helperMessage: "The ID of the point to start from",
                },
                {
                    type: "anyData",
                    dataKey: "filter",
                    label: "Scroll Filter",
                    useInputToggleDataKey: "useFilterInput",
                    helperMessage: "Filter to apply during scroll.",
                },
            ];
        },

        getUIData() {
            return {
                contextMenuTitle: "Scroll Points",
                infoBoxTitle: "Scroll Points",
                infoBoxBody: "Scroll for points in a Qdrant collection.",
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

            const { scrollPoints } = await import("../nodeEntry");

            const results = await scrollPoints(
                context.getPluginConfig("qdrantUrl") as string,
                collectionName,
                filter,
                data.limit,
                data.offset,
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

    return rivet.pluginNodeDefinition(impl, "Scroll Points");
}
