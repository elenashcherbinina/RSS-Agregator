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
      curUrl: '',
    },
    feeds: [],
    posts: [],
  };

  const watchedState = onChange(state, render(elements, state));

  const schema = yup.string().url('Cсылка должна быть валидным URL').notOneOf(state.feeds, 'RSS уже существует').trim();

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    watchedState.form.state = 'sending';
    const formData = new FormData(e.target);
    const curUrl = formData.get('url').trim();
    watchedState.form.curUrl = curUrl;

    schema
      .validate(watchedState.form.curUrl)
      .then(() => {
        watchedState.form.valid = 'true';
        watchedState.feeds.push(curUrl);
        watchedState.form.state = 'finished';
      })
      .catch((error) => {
        watchedState.form.error = error;
        watchedState.form.valid = 'false';
        watchedState.form.state = 'failed';
      });
  });
};
