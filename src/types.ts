export enum RuntimeEnv {
  Browser = 'browser',
  Node = 'node',
  Unknown = 'unknown',
}

export enum OOXMLFilenames {
  Content_Types = '[Content_Types]',
  Node = 'node',
  Unknown = 'unknown',
}

export interface DocArrayNode {
  tag: string;
  attrs: Record<string, string>;
  children?: DocArrayNode[];
  parentNode?: DocArrayNode;
  originNode: Node;
  order: number;
}

export interface DocObjectNode {
  attrs: Record<string, string>;
  parentNode?: DocObjectNode;
  originNode: Node;
  order: number;
  [key: string]:
    | DocObjectNode[]
    | DocObjectNode
    | Record<string, string>
    | Node
    | undefined
    | number;
}
