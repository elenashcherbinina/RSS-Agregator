const buildContainer = (name, i18nInstance) => {
  const container = document.createElement('div');
  container.classList.add('card', 'border-0');

  const div = document.createElement('div');
  div.classList.add('card-body');
  const h2 = document.createElement('h2');
  h2.classList.add('card-title', 'h4');
  h2.textContent = i18nInstance.t(`containers.${name}`);
  div.appendChild(h2);

  const ul = document.createElement('ul');
  ul.classList.add('list-group', 'border-0', 'rounded-0');
  container.replaceChildren(div, ul);
  return container;
};

const renderError = (elements, error, i18nInstance) => {
  const { input, feedback } = elements;
  input.classList.add('is-invalid');
  feedback.textContent = i18nInstance.t(`errors.${error}`);
  feedback.classList.add('text-danger');
  feedback.classList.remove('text-success');
};

const renderValidState = (elements) => {
  const { input, feedback, form } = elements;
  input.classList.remove('is-invalid');
  feedback.classList.remove('text-danger');
  feedback.classList.add('text-success');
  feedback.innerHTML = '';
  form.reset();
  input.focus();
};

const renderFeeds = (elements, i18nInstance) => {
  const { containerFeeds } = elements;

  const container = buildContainer('feeds', i18nInstance);

  const list = container.querySelector('ul');
  const listItem = document.createElement('li');
  listItem.classList.add('list-group-item', 'border-0', 'border-end-0');

  const title = document.createElement('h3');
  title.classList.add('h6', 'm-0');
  // title.textContent = '';

  const description = document.createElement('p');
  description.classList.add('m-0', 'small', 'text-black-50');
  // description.textContent = '';

  listItem.replaceChildren(title, description);
  list.appendChild(listItem);

  containerFeeds.appendChild(container);
};

const renderPosts = (elements, i18nInstance) => {
  const { containerPosts } = elements;
  const container = buildContainer('posts', i18nInstance);

  const list = container.querySelector('ul');
  const listItem = document.createElement('li');
  listItem.classList.add(
    'list-group-item',
    'd-flex',
    'justify-content-between',
    'align-items-start',
    'border-0',
    'border-end-0',
  );

  const link = document.createElement('a');
  // link.classList.add();
  // link.textContent = '';

  const button = document.createElement('button');
  button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
  button.type = 'button';
  button.textContent = i18nInstance.t('buttons.read');
  // button.setAttribute...

  listItem.replaceChildren(link, button);
  list.appendChild(listItem);

  containerPosts.appendChild(container);
};

export default (elements, state, i18nInstance) => (path, value) => {
  switch (path) {
    case 'form.valid':
      if (value === 'true') {
        renderValidState(elements);
      }
      break;
    case 'form.error':
      if (value !== null) {
        renderError(elements, value, i18nInstance);
      }
      break;
    case 'form.state':
      if (value === 'finished') {
        renderFeeds(elements, i18nInstance);
        renderPosts(elements, i18nInstance);
      }
      break;
    default:
      break;
  }
};
