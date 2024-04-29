import type {
    ChartNode,
    NodeInputDefinition,
    NodeOutputDefinition,
    PluginNodeImpl,
    PortId,
    Rivet,
    NodeId,
} from "@ironclad/rivet-core";

export type ListCollectionsNode = ChartNode<"listCollections", {}>;

export function listCollectionsNode(rivet: typeof Rivet) {
    const impl: PluginNodeImpl<ListCollectionsNode> = {
        create(): ListCollectionsNode {
            const node: ListCollectionsNode = {
                id: rivet.newId<NodeId>(),
                data: {},
                title: "List Collections",
                type: "listCollections",
                visualData: {
                    x: 0,
                    y: 0,
                    width: 200,
                },
            };
            return node;
        },

        getInputDefinitions(): NodeInputDefinition[] {
            return [];
        },

        getOutputDefinitions(): NodeOutputDefinition[] {
            return [
                {
                    id: "collectionNames" as PortId,
                    dataType: "string[]",
                    title: "Collection Names",
                    defaultValue: [],
                },
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
                infoBoxBody:
                    "This node lists all the collections in the Qdrant service as string[].",
                infoBoxTitle: "List Collections",
            };
        },

        async process(_data, _inputData, context) {
            if (context.executor !== "nodejs") {
                throw new Error("This node can only be run using a nodejs executor.");
            }

            const { listCollections } = await import("../nodeEntry");

            const collections = await listCollections(
                context.getPluginConfig("qdrantUrl") as string,
                context.getPluginConfig("qdrantApiKey")
            )

            return {
                ["collectionNames" as PortId]: {
                    type: "string[]",
                    value: collections,
                },
            };
        },
    };

    return rivet.pluginNodeDefinition(impl, "List Collections");
}
