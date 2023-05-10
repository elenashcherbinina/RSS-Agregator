export default (contents) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(contents, 'text/html');
  console.log('doc', doc);
  const title = doc.querySelector('title').textContent;
  const description = doc.querySelector('description').textContent;
  const item = doc.querySelector('item');
  const items = Array.from(item);
  return { title, description, items };
};
