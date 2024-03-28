import JSZip from "jszip";

export default async function transformer(type: string, zip: JSZip.JSZipObject) {
  return Promise.resolve('transformer');
}
