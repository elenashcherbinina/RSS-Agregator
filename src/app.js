import i18next from 'i18next';
import onChange from 'on-change';
import * as yup from 'yup';

import resources from './locales/index.js';
import render from './render.js';

export default () => {
  const i18nInstance = i18next.createInstance();

  i18nInstance
    .init({
      lng: 'ru',
      debug: false,
      resources,
    })
    .then(() => {
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

      yup.setLocale({
        mixed: {
          notOneOf: 'rssAlreadyExists',
        },
        string: {
          url: 'invalidUrl',
        },
      });

      const schema = yup.string().url().notOneOf(state.feeds);

      const watchedState = onChange(state, render(elements, state, i18nInstance));

      elements.form.addEventListener('submit', (e) => {
        e.preventDefault();
        watchedState.form.state = 'sending';
        const formData = new FormData(e.target);
        const curUrl = formData.get('url').trim();

        schema
          .validate(curUrl)
          .then(() => {
            watchedState.form.valid = 'true';
            watchedState.form.error = null;
            watchedState.form.state = 'finished';
            watchedState.feeds.push(curUrl);
          })
          .catch((error) => {
            watchedState.form.valid = 'false';
            watchedState.form.error = error.message;
            watchedState.form.state = 'failed';
          });
      });
    });
};
