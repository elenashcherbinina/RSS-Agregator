import { buildContainer, setAttributes } from './utils/helpers.js';

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

const renderFeeds = (elements, state, i18nInstance) => {
  const { containerFeeds } = elements;
  containerFeeds.innerHTML = '';

  const container = buildContainer('feeds', i18nInstance);

  const list = container.querySelector('ul');

  state.feeds.forEach((feed) => {
    const listItem = document.createElement('li');
    listItem.classList.add('list-group-item', 'border-0', 'border-end-0');

    const title = document.createElement('h3');
    title.classList.add('h6', 'm-0');
    title.textContent = feed.title;

    const description = document.createElement('p');
    description.classList.add('m-0', 'small', 'text-black-50');
    description.textContent = feed.description;

    listItem.replaceChildren(title, description);
    list.appendChild(listItem);
  });
  containerFeeds.appendChild(container);
};

const renderPosts = (elements, state, i18nInstance) => {
  const { containerPosts } = elements;
  containerPosts.innerHTML = '';
  const container = buildContainer('posts', i18nInstance);

  const list = container.querySelector('ul');

  state.posts.forEach((postList) => {
    postList.forEach((post) => {
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
      link.classList.add('fw-bold');
      link.href = post.link;
      setAttributes(link, { 'data-id': `${post.id}`, target: '_blank', rel: 'noopener noreferrer' });
      link.textContent = post.title;

      const button = document.createElement('button');
      button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
      setAttributes(button, {
        type: 'button',
        'data-id': `${post.id}`,
        'data-bs-toggle': 'modal',
        'data-bs-target': '#modal',
      });
      button.textContent = i18nInstance.t('buttons.read');

      listItem.replaceChildren(link, button);
      list.appendChild(listItem);
    });
  });

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
        renderFeeds(elements, state, i18nInstance);
        renderPosts(elements, state, i18nInstance);
      }
      break;
    case 'posts':
      renderPosts(elements, state, i18nInstance);
      break;
    default:
      break;
  }
};
