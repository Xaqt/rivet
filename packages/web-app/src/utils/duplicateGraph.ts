import { type GraphId, type NodeGraph, type NodeId } from '@ironclad/rivet-core';
import { produce } from 'immer';
import { genId } from '../state/savedGraphs';

export function duplicateGraph(graph: NodeGraph) {
  let duplicatedGraph: NodeGraph = produce(graph, (draft) => ({
    ...draft,
    metadata: {
      ...draft.metadata,
      id: genId<GraphId>(),
      name: `${draft.metadata?.name} (Copy)`,
    },
  }));

  duplicatedGraph = produce(duplicatedGraph, (draft) => {
    // Generate new IDs for all nodes and update connections
    for (const node of draft.nodes) {
      const oldId = node.id;
      node.id = genId<NodeId>();

      for (const connection of draft.connections) {
        if (connection.inputNodeId === oldId) {
          connection.inputNodeId = node.id;
        }
        if (connection.outputNodeId === oldId) {
          connection.outputNodeId = node.id;
        }
      }
    }
  });

  return duplicatedGraph;
}
