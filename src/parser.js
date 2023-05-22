export default (contents) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(contents, 'text/xml');
  if (doc.querySelector('parsererror')) {
    throw new Error('noRSS');
  }

  const feed = {
    title: doc.querySelector('title').textContent,
    description: doc.querySelector('description').textContent,
  };

  const posts = Array.from(doc.querySelectorAll('item')).map((item) => {
    const title = item.querySelector('title').textContent;
    const link = item.querySelector('link').textContent;
    const description = item.querySelector('description').textContent;
    return { title, link, description };
  });
  return { feed, posts };
};
