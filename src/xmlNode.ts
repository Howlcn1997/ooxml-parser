interface Config {
  cacheEnabled: boolean;
}

export class XmlNode {
  tag: string;
  name: string;
  parent: XmlNode | null = null;
  namespace: string | null = null;
  _config: Config;
  private _node: Element;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private _attrs: Record<string, any> = {};
  private _children: XmlNode[] = [];
  // private _cache: Record<string, XmlNode[]> = new Map([]);

  constructor(node: Element, parent?: XmlNode, config?: Config) {
    this.tag = node.nodeName;

    const [namespace, name] = this.tag.split(':');
    this.name = name || this.tag;
    this.namespace = name ? namespace : '';

    this._node = node;
    this._config = { cacheEnabled: true, ...(config || {}) };
    this.parent = parent || null;
  }

  get children() {
    if (this._children.length) return this._children;
    this._children = Array.from(this._node.children).map(node => new XmlNode(node, this, this._config));
    return this._children;
  }

  get text() {
    return this._node.textContent || '';
  }

  get attrs() {
    if (Object.keys(this._attrs).length || !this._node.attributes) return this._attrs;
    this._attrs = {};
    for (const attr of this._node.attributes) {
      this._attrs[attr.name] = attr.value;
    }
    return this._attrs;
  }

  child(name: string, namespace?: string): XmlNode | null {
    return (
      this.children.find(xNode => (namespace ? xNode.tag === `${namespace}:${name}` : xNode.name === name)) || null
    );
  }
  allChild(name?: string, namespace?: string): XmlNode[] {
    return name
      ? this.children.filter(xNode => (namespace ? xNode.tag === `${namespace}:${name}` : xNode.name === name))
      : this.children;
  }
}
