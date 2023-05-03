const renderError = (elements, error) => {
  elements.input.classList.add('is-invalid');
  elements.feedback.textContent = error;
};

const renderFeeds = () => {};

const renderPosts = () => {};

export default (elements, initialState) => (path, value) => {
  switch (path) {
    case 'form.isValid':
      if (value === 'false') {
        renderError(elements, initialState.form.error);
      }
      if (value === 'true') {
        elements.input.classList.remove('is-invalid');
        elements.feedback.innerHTML = '';
        elements.input.focus();
        elements.form.reset();
        renderFeeds();
        renderPosts();
      }
      break;
    default:
      break;
  }
};
