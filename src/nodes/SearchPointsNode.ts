import type {
    ChartNode,
    NodeInputDefinition,
    NodeOutputDefinition,
    PluginNodeImpl,
    PortId,
    Rivet,
    NodeId,
} from "@ironclad/rivet-core";

export type SearchPointsNode = ChartNode<"searchPoints", {

    collectionName: string;
    useCollectionNameInput?: boolean;

    vectorName?: string;
    limit?: number;
    scoreThreshold?: number;

    filter: Record<string, any>;
    useFilterInput?: boolean;
}>;

export function searchPointsNode(rivet: typeof Rivet) {
    const impl: PluginNodeImpl<SearchPointsNode> = {
        create(): SearchPointsNode {
            const node: SearchPointsNode = {
                id: rivet.newId<NodeId>(),
                data: {
                    collectionName: "",
                    useCollectionNameInput: false,
                    filter: {},
                    useFilterInput: false,
                },
                title: "Search Points",
                type: "searchPoints",
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

            inputs.push({
                id: "embedding" as PortId,
                dataType: "vector",
                title: "Embedding",
            });

            if (data.useFilterInput) {
                inputs.push({
                    id: "filter" as PortId,
                    dataType: "object",
                    title: "Search Filter",
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
                    dataKey: "vectorName",
                    label: "Vector Name",
                    helperMessage: "The name of the vector. Uses the default unnamed('') vector if not provided.",
                },
                {
                    type: "number",
                    dataKey: "limit",
                    label: "Number of Results",
                    helperMessage: "The number of results to return. Defaults to 10.",
                },
                {
                    type: "number",
                    dataKey: "scoreThreshold",
                    label: "Score Threshold",
                    helperMessage: "The minimum score for a result to be returned. Defaults to 0",
                },
                {
                    type: "anyData",
                    dataKey: "filter",
                    label: "Search Filter",
                    useInputToggleDataKey: "useFilterInput",
                    helperMessage: "Filter to apply during search.",
                },
            ];
        },

        getUIData() {
            return {
                contextMenuTitle: "Search",
                infoBoxTitle: "Search",
                infoBoxBody: "Search for points in a Qdrant collection.",
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

            const embedding = rivet.coerceType(
                inputData["embedding" as PortId],
                "vector"
            );

            const filter = JSON.parse(rivet.getInputOrData(data, inputData, "filter")) || {};

            const { searchPoints } = await import("../nodeEntry");

            const results = await searchPoints(
                context.getPluginConfig("qdrantUrl") as string,
                collectionName,
                embedding,
                filter,
                data.limit,
                data.scoreThreshold,
                data.vectorName,
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

    return rivet.pluginNodeDefinition(impl, "Upload Point");
}
