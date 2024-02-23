import JSZip from "jszip";

export default function main() {
  const zip = new JSZip();
  zip.file("Hello.txt", "Hello World\n");
}
