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

// const renderFeeds = () => {};

// const renderPosts = () => {};

export default (elements, state, i18nInstance) => (path, value) => {
  switch (path) {
    case 'form.valid':
      if (value === 'true') {
        renderValidState(elements);
      } else {
        renderError(elements, state.form.error, i18nInstance);
      }
      break;
    case 'form.error':
      if (value === 'true') {
        renderValidState(elements);
      } else {
        renderError(elements, state.form.error, i18nInstance);
      }
      break;
    default:
      break;
  }
};
