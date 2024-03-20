import JSZip from 'jszip';
// import { saveAs } from 'file-saver';

import { loadNodeModule, runtimeEnv } from './utils/env';
import { ParserOptions } from './types';
import { readXmlFile } from './readXmlFile';

class OOXMLParser {
  zip: JSZip | undefined;

  async loadFile(file: File): Promise<JSZip> {
    const env = runtimeEnv();
    if (env === 'node') {
      const fs = loadNodeModule<typeof import('fs')>('fs');
      const path = loadNodeModule<typeof import('path')>('path');
      const file = fs.readFileSync(path.join(__dirname, '../assets/ppt/simple.pptx'));
      this.zip = await JSZip.loadAsync(file);
    } else {
      this.zip = await JSZip.loadAsync(file);
    }
    return this.zip;
  }

  async parse(file: File, options: ParserOptions = {}) {
    this.zip = this.zip || (await this.loadFile(file));
    const content = await readXmlFile(this.zip, '[Content_Types].xml');
    console.log(options);
    return content;
  }
}
export default OOXMLParser;
