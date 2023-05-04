const renderError = (elements, state) => {
  const { input, feedback } = elements;
  input.classList.add('is-invalid');
  feedback.textContent = state.error;
};

const renderValidState = (elements) => {
  const { input, feedback, form } = elements;
  input.classList.remove('is-invalid');
  feedback.innerHTML = '';
  form.reset();
  input.focus();
};

// const renderFeeds = () => {};

// const renderPosts = () => {};

export default (elements, state) => (path, value) => {
  switch (path) {
    case 'form.valid':
      if (value === 'false') {
        renderError(elements, state);
      }
      if (value === 'true') {
        renderValidState(elements);

        // renderFeeds();
        // renderPosts();
      }
      break;
    default:
      break;
  }
};
