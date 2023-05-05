const renderError = (elements, state) => {
  const { input, feedback } = elements;
  input.classList.add('is-invalid');
  feedback.classList.add('text-danger');
  feedback.textContent = state.form.error;
};

const renderValidState = (elements) => {
  const { input, feedback, form } = elements;
  form.reset();
  input.focus();
  input.classList.remove('is-invalid');
  feedback.classList.remove('text-danger');
  feedback.classList.add('text-success');
  feedback.innerHTML = '';
};

// const renderFeeds = () => {};

// const renderPosts = () => {};

export default (elements, state) => (path, value) => {
  switch (path) {
    case 'form.valid':
      if (value === 'true') {
        renderValidState(elements);
        // renderFeeds();
        // renderPosts();
      }
      if (value === 'false') {
        renderError(elements, state);
      }
      break;
    default:
      break;
  }
};
