import React from 'react';
import { GraphCanvas, lightTheme, darkTheme } from 'reagraph';

const KnowledgeGraph = ({ mode = 'light', graphData }) => {
  if (!graphData) {
    return <div>No graph data available</div>;
  }

  const nodes = graphData.nodes.map(node => ({
    id: node.node_id,
    label: node.label,
  }));

  const edges = graphData.edges.map(edge => ({
    id: edge.edge_id,
    source: edge.source,
    target: edge.target,
    label: edge.label,
  }));

  const myTheme = {
    ...(mode === 'dark' ? darkTheme : lightTheme),
    node: {
      ...(mode === 'dark' ? darkTheme.node : lightTheme.node),
      fill: '#0a96e5'
    },
    edge: {
      ...(mode === 'dark' ? darkTheme.edge : lightTheme.edge),
      label: {
        ...(mode === 'dark' ? darkTheme.edge.label : lightTheme.edge.label),
        ellipsis: 100,
      }
    }
  };

  return (
    <div style={{
      position: 'relative',
      backgroundColor: mode === 'dark' ? '#121212' : '#fff',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        position: 'relative',
        margin: '0 auto',
        width: '100%',
        height: '70vh',
        backgroundColor: mode === 'dark' ? '#121212' : '#fff',
        border: `1px solid ${mode === 'dark' ? '#333' : '#ddd'}`,
        borderRadius: '8px',
        boxShadow: mode === 'dark' ? 
          '0 2px 8px rgba(255,255,255,0.1)' : 
          '0 2px 8px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        <GraphCanvas
          nodes={nodes}
          edges={edges}
          minDistance={600}
          layoutOverrides={{
            linkDistance: 70,
            nodeStrength: -2000
            
          }}
          labelType="all"
          theme={myTheme}
        />
      </div>
    </div>
  );
};

export default KnowledgeGraph;
