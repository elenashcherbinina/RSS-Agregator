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

const setAttributes = (el, attrs) => {
  Object.entries(attrs).forEach((element) => {
    const [key, value] = element;
    el.setAttribute(key, value);
  });
};

const renderForm = (elements, formState, i18nInstance) => {
  const { input, feedback } = elements;
  const { isValidate, error } = formState;

  if (isValidate === 'true') {
    input.classList.remove('is-invalid');
    feedback.classList.remove('text-danger');
    feedback.classList.add('text-success');
  } else {
    input.classList.add('is-invalid');
    feedback.classList.remove('text-success');
    feedback.classList.add('text-danger');
    feedback.textContent = i18nInstance.t(`errors.${error}`);
  }
};

const renderFeeds = (elements, initialState, i18nInstance) => {
  const { containerFeeds } = elements;
  const { feeds } = initialState;

  containerFeeds.innerHTML = '';
  const container = buildContainer('feeds', i18nInstance);
  const list = container.querySelector('ul');

  feeds.forEach((feed) => {
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

const renderPosts = (elements, initialState, i18nInstance) => {
  const { containerPosts } = elements;
  const { posts } = initialState;

  containerPosts.innerHTML = '';
  const container = buildContainer('posts', i18nInstance);
  const list = container.querySelector('ul');

  posts.forEach((post) => {
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
  containerPosts.appendChild(container);
};

const renderLoadingProcess = (elements, loadingProcessState, i18nInstance) => {
  const { input, feedback, submit } = elements;
  const { status, error } = loadingProcessState;

  switch (status) {
    case 'loading':
      submit.setAttribute('disabled', 'disabled');
      break;
    case 'finished':
      input.value = '';
      input.focus();
      submit.removeAttribute('disabled');
      feedback.textContent = i18nInstance.t('success.rssAdded');
      break;
    case 'failed':
      submit.removeAttribute('disabled');
      if (error === 'Network Error') {
        feedback.textContent = i18nInstance.t('errors.netWorkError');
      } else {
        feedback.textContent = i18nInstance.t(`errors.${error}`);
      }
      break;
    default:
      throw new Error(`${status}`);
  }
};

const renderModal = (elements, initialState, postId) => {
  const { title, text, link } = elements.modal;
  const { posts } = initialState;

  const curPost = posts.flat().find(({ id }) => id === postId);
  title.textContent = curPost.title;
  text.textContent = curPost.description;
  link.href = curPost.link;
};

const renderViewedPosts = (elements, postIds) => {
  const { containerPosts } = elements;

  return postIds.forEach((id) => {
    const viewedPost = containerPosts.querySelector(`[data-id="${id}"]`);
    viewedPost.classList.remove('fw-bold');
    viewedPost.classList.add('fw-normal', 'link-secondary');
  });
};

export default (elements, initialState, i18nInstance) => (path, value) => {
  switch (path) {
    case 'form':
      renderForm(elements, value, i18nInstance);
      break;
    case 'loadingProcess':
      renderLoadingProcess(elements, value, i18nInstance);
      break;
    case 'feeds':
      renderFeeds(elements, initialState, i18nInstance);
      break;
    case 'posts':
      renderPosts(elements, initialState, i18nInstance);
      break;
    case 'modal.postId':
      renderModal(elements, initialState, value);
      break;
    case 'modal.viewedPosts':
      renderViewedPosts(elements, value);
      break;
    default:
      break;
  }
};
