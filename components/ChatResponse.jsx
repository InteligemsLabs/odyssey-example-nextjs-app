import React, { useState, useEffect, useCallback } from 'react';
import { Box, Text, Flex, Icon, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Button, useDisclosure } from '@chakra-ui/react';
import Markdown from 'markdown-to-jsx';
import { FaFilePdf, FaFileAlt, FaFile, FaProjectDiagram } from 'react-icons/fa';
import {ReactFlow, Background, Controls, useNodesState, useEdgesState, addEdge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';
import DynamicKnowledgeGraph from './DynamicKnowledgeGraph';

const ChatResponse = ({ message }) => {
  const { isOpen: isSourceOpen, onOpen: onSourceOpen, onClose: onSourceClose } = useDisclosure();
  const { isOpen: isAgentExplorerOpen, onOpen: onAgentExplorerOpen, onClose: onAgentExplorerClose } = useDisclosure();
  const { isOpen: isNodeDetailOpen, onOpen: onNodeDetailOpen, onClose: onNodeDetailClose } = useDisclosure();
  const { isOpen: isGraphOpen, onOpen: onGraphOpen, onClose: onGraphClose } = useDisclosure();
  const [selectedSource, setSelectedSource] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [graphData, setGraphData] = useState(null);
  
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((event, node) => {
    if (node.data?.fullText) {
      setSelectedNode(node);
      onNodeDetailOpen();
    } else if (node.data?.type === 'graph' || (node.id && node.id.startsWith('graph-'))) {
      const stepIndex = parseInt(node.id.split('-')[1]);
      const step = message.stepsBreakdown[stepIndex];
      
      if (step && step.content && step.content.graph) {
        setGraphData(step.content.graph);
        onGraphOpen();
      }
    }
  }, [onNodeDetailOpen, onGraphOpen, message]);
  
  const getSourceIcon = (snippet) => {
    const { mimetype, filetype } = snippet;
    
    if (mimetype === 'pdf' || filetype === 'document') {
      return FaFilePdf;
    }
    
    return FaFileAlt;
  };

  const getUniqueFilenames = () => {
    if (!message?.sourceSnips || message.sourceSnips.length === 0) return [];
    
    const uniqueFiles = [];
    const filenames = new Set();
    
    message.sourceSnips.forEach(snippet => {
      const filename = snippet.filename || 'Unknown source';
      if (!filenames.has(filename)) {
        filenames.add(filename);
        uniqueFiles.push(filename);
      }
    });
    
    return uniqueFiles;
  };
  
  const getSnippetsForFilename = (filename) => {
    return message.sourceSnips.filter(snippet => 
      (snippet.filename || 'Unknown source') === filename
    );
  };
  
  const handleSourceClick = (filename) => {
    setSelectedSource({
      filename,
      snippets: getSnippetsForFilename(filename)
    });
    onSourceOpen();
  };

  const getLayoutedElements = (nodes, edges, direction = 'TB') => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({ rankdir: direction });

    nodes.forEach((node) => {
      dagreGraph.setNode(node.id, { width: 180, height: 60 });
    });

    edges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    const layoutedNodes = nodes.map((node) => {
      const dagreNode = dagreGraph.node(node.id);
      return {
        ...node,
        position: {
          x: dagreNode.x - 90,
          y: dagreNode.y - 30,
        },
      };
    });

    return { nodes: layoutedNodes, edges };
  };

  const prepareGraphData = () => {
    if (!message?.stepsBreakdown || !Array.isArray(message.stepsBreakdown)) {
      return { nodes: [], edges: [] };
    }
    
    const nodes = [];
    const edges = [];
    
    message.stepsBreakdown.forEach((step, index) => {
      // Add node for the agent (main node)
      const agentId = `agent-${index}`;
      nodes.push({
        id: agentId,
        data: { 
          label: step.agentname || (step.type === 'structure' ? 'Structure Agent' : `Agent ${index}`),
          type: step.type || 'unknown'
        },
        style: {
          background: getNodeColor(step.type),
          border: '1px solid #222',
          borderRadius: 5,
          padding: 10,
          width: 180,
          color: '#222',
          fontSize: 12,
          fontWeight: 'bold'
        }
      });
      
      // If there's an external data source, add it as a side node
      if (step.external) {
        const externalId = `external-${index}`;
        nodes.push({
          id: externalId,
          data: { 
            label: `Source: ${step.external}`
          },
          style: {
            background: '#E9D8FD', // Light purple
            border: '1px solid #B794F4',
            borderRadius: 5,
            padding: 10,
            width: 150,
            color: '#1A202C',
            fontSize: 11,
          }
        });
        
        edges.push({
          id: `edge-external-${index}`,
          source: agentId,
          target: externalId,
          type: 'straight',
          style: { stroke: '#B794F4' }
        });
      }
      
      // If there's a content.graph, add it as a side node
      if (step.content && step.content.graph) {
        const graphId = `graph-${index}`;
        nodes.push({
          id: graphId,
          data: { 
            label: `Graph: ${step.content.graph.description || 'Knowledge Graph'}`,
            type: 'graph'
          },
          style: {
            background: '#BEE3F8', // Light blue
            border: '1px solid #90CDF4',
            borderRadius: 5,
            padding: 10,
            width: 150,
            color: '#1A202C',
            fontSize: 11,
          }
        });
        
        edges.push({
          id: `edge-graph-${index}`,
          source: agentId,
          target: graphId,
          type: 'straight',
          style: { stroke: '#90CDF4' }
        });
      }
      
      // If there's a query, add it as a node
      if (step.query || (step.content && step.content.query)) {
        const query = step.query || step.content.query;
        const queryId = `query-${index}`;
        nodes.push({
          id: queryId,
          data: { 
            label: truncateText(query, 25),
            fullText: query
          },
          style: {
            background: '#E2E8F0',
            border: '1px solid #CBD5E0',
            borderRadius: 5,
            padding: 10,
            width: 180,
            color: '#1A202C',
            fontSize: 12,
          }
        });
        
        edges.push({
          id: `edge-query-${index}`,
          source: queryId,
          target: agentId,
          animated: true,
          style: { stroke: '#718096' }
        });
      }
      
      // If there's a response, add it as a node
      if (step.response || (step.content && step.content.response)) {
        const response = step.response || step.content.response;
        const responseId = `response-${index}`;
        nodes.push({
          id: responseId,
          data: { 
            label: truncateText(response, 25),
            fullText: response
          },
          style: {
            background: '#F7FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: 5,
            padding: 10,
            width: 180,
            color: '#1A202C',
            fontSize: 12,
          }
        });
        
        edges.push({
          id: `edge-response-${index}`,
          source: agentId,
          target: responseId,
          animated: true,
          style: { stroke: '#718096' }
        });
      }
      
      // Connect sequential agents (main flow)
      if (index > 0) {
        edges.push({
          id: `edge-seq-${index}`,
          source: `agent-${index-1}`,
          target: agentId,
          animated: true,
          style: { stroke: '#4A5568', strokeWidth: 2 }
        });
      }
    });
    
    // Apply layout
    return getLayoutedElements(nodes, edges);
  };

  // Helper function to truncate text
  const truncateText = (text, maxLength) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  // Helper function to get node color based on type
  const getNodeColor = (type) => {
    switch (type) {
      case 'rag': return '#FEB2B2'; // Light red
      case 'compile': return '#9AE6B4'; // Light green
      case 'structure': return '#FAF089'; // Light yellow
      default: return '#90CDF4'; // Light blue
    }
  };
  
  // Initialize flow elements when message changes
  useEffect(() => {
    if (message?.stepsBreakdown) {
      const graphData = prepareGraphData();
      setNodes(graphData.nodes);
      setEdges(graphData.edges);
    }
  }, [message, setNodes, setEdges]);

  return (
    <Box className="chat-response" bg="gray.100" p={3} borderRadius="md" alignSelf="flex-start" mb={2}>
      <Markdown>
        {message.text}
      </Markdown>

      {message?.rootAgentName ? <i style={{fontSize: '12px', marginTop: '1rem', display: 'block'}}>This response was generated by {message?.rootAgentName}</i> : ''}
      
      {message?.stepsBreakdown && Array.isArray(message.stepsBreakdown) && (
        <Box mt={8}>
          <Button 
            size="sm" 
            leftIcon={<Icon as={FaProjectDiagram} />} 
            colorScheme="purple" 
            onClick={onAgentExplorerOpen}
          >
            Agent Explorer
          </Button>
        </Box>
      )}
      
      {message?.sourceSnips && message.sourceSnips.length > 0 && (
        <Box borderRadius={8} p={4} mt={4} bgColor="gray.200">
          <Text fontWeight="bold" mb={2}>SourceSnips™</Text>
          <Flex flexWrap="wrap" gap={2}>
            {getUniqueFilenames().map((filename, index) => (
              <Text 
                key={index} 
                fontSize="xs" 
                bg="gray.300" 
                px={2} 
                py={1} 
                borderRadius="md"
                cursor="pointer"
                _hover={{ bg: "gray.300" }}
                onClick={() => handleSourceClick(filename)}
              >
                {filename}
              </Text>
            ))}
          </Flex>
          
          <Modal isOpen={isSourceOpen} onClose={onSourceClose}>
            <ModalOverlay />
            <ModalContent maxW="60vw">
              <ModalHeader>
                <Flex alignItems="center">
                  <Icon 
                    as={selectedSource && selectedSource.snippets.length > 0 
                      ? getSourceIcon(selectedSource.snippets[0]) 
                      : FaFile} 
                    mr={2} 
                    color="blue.500" 
                  />
                  {selectedSource?.filename}
                </Flex>
              </ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <Flex flexWrap="wrap" gap={4}>
                  {selectedSource?.snippets.map((snippet, idx) => (
                    <Box key={idx} p={3} borderWidth="1px" borderRadius="md" flex="1 0 calc(50% - 1rem)" minW="300px" position="relative">
                      <Box 
                        position="absolute" 
                        top="-10px" 
                        left="-10px" 
                        bg="blue.500" 
                        color="white" 
                        borderRadius="full" 
                        width="24px" 
                        height="24px" 
                        display="flex" 
                        alignItems="center" 
                        justifyContent="center"
                        fontSize="xs"
                        fontWeight="bold"
                      >
                        {idx + 1}
                      </Box>
                      <Text fontSize="sm">
                        {!snippet.content.match(/^[A-Z]/) ? '... ' : ''}
                        {snippet.content}
                        {!snippet.content.endsWith('.') ? ' ...' : ''}
                      </Text>
                    </Box>
                  ))}
                </Flex>
              </ModalBody>
              <ModalFooter>
                <Button colorScheme="blue" onClick={onSourceClose}>
                  Close
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </Box>
      )}
      
      <Modal isOpen={isAgentExplorerOpen} onClose={onAgentExplorerClose} size="xl" blockScrollOnMount={false}>
        <ModalOverlay />
        <ModalContent maxW="80vw" maxH="80vh">
          <ModalHeader>{message?.rootAgentName ? message?.rootAgentName : 'Agent Execution Flow'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box height="60vh" border="1px solid #E2E8F0" borderRadius="md">
              <ReactFlow 
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={onNodeClick}
                fitView
                attributionPosition="bottom-right"
                nodesDraggable={false}
              >
                <Controls />
                <Background color="#aaa" gap={16} />
              </ReactFlow>
            </Box>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={onAgentExplorerClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      
      {/* Node Detail Modal */}
      <Modal isOpen={isNodeDetailOpen} onClose={onNodeDetailClose} size="2xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{selectedNode?.data?.label || 'Node Details'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Markdown>{selectedNode?.data?.fullText || ''}</Markdown>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={onNodeDetailClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      
      <Modal isOpen={isGraphOpen} onClose={onGraphClose} size="xl">
        <ModalOverlay />
        <ModalContent maxW="90vw" maxH="90vh">
          <ModalHeader>{graphData?.description || 'Knowledge Graph'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <DynamicKnowledgeGraph 
              mode="light" 
              graphData={graphData} 
            />
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={onGraphClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ChatResponse;
