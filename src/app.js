import onChange from 'on-change';
import * as yup from 'yup';
import render from './render.js';

export default () => {
  const elements = {
    form: document.querySelector('form'),
    input: document.querySelector('input'),
    submitButton: document.querySelector('[type="submit"]'), // зачем она?
    feedback: document.querySelector('.feedback'),
    containerFeeds: document.querySelector('div.posts'),
    containerPosts: document.querySelector('div.feeds'),
  };

  const state = {
    form: {
      state: 'filling',
      valid: true,
      error: null,
    },
    feeds: [],
    posts: [],
  };

  console.log(state);

  const watchedState = onChange(state, render(elements, state));

  const schema = yup.string().url('Cсылка должна быть валидным URL').notOneOf(state.feeds, 'RSS уже существует');

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    watchedState.form.state = 'sending';
    const formData = new FormData(e.target);
    const curUrl = formData.get('url').trim();

    schema
      .validate(curUrl)
      .then(() => {
        watchedState.form.valid = 'true';
        watchedState.form.error = '';
        watchedState.feeds.push(curUrl);
        watchedState.form.state = 'finished';
      })
      .catch((error) => {
        watchedState.form.valid = 'false';
        watchedState.form.error = error.message;
        watchedState.form.state = 'failed';
      });
    console.log(state);
  });
};
