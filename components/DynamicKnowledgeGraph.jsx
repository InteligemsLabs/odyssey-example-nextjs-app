import dynamic from 'next/dynamic';

const DynamicKnowledgeGraph = dynamic(
  () => import('./KnowledgeGraph'),
  { ssr: false }
);

export default DynamicKnowledgeGraph;