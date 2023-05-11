export default (contents) => {
  const parser = new DOMParser();
  return parser.parseFromString(contents, 'text/xml');
};
