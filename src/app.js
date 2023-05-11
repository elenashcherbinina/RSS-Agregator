import i18next from 'i18next';
import onChange from 'on-change';
import * as yup from 'yup';
import uniqueId from 'lodash/uniqueId.js';
import axios from 'axios';

import resources from './locales/index.js';
import render from './render.js';
import parse from './parser.js';
import { getRssData } from './utils/helpers.js';

const validate = (url, urls) => {
  const schema = yup.string().url().notOneOf(urls);
  return schema.validate(url);
};

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
        submitButton: document.querySelector('[type="submit"]'),
        feedback: document.querySelector('.feedback'),
        containerFeeds: document.querySelector('div.feeds'),
        containerPosts: document.querySelector('div.posts'),
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

      const watchedState = onChange(state, render(elements, state, i18nInstance));

      elements.form.addEventListener('submit', (e) => {
        e.preventDefault();
        watchedState.form.state = 'sending';
        const formData = new FormData(e.target);
        const curUrl = formData.get('url').trim();

        const urls = state.feeds.map(({ url }) => url);

        validate(curUrl, urls)
          .then((url) => {
            watchedState.form.valid = 'true';
            watchedState.form.error = null;
            watchedState.form.state = 'loading';
            return axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${url}`);
          })
          .then((response) => response.data.contents)
          .then((contents) => parse(contents))
          .then((parsedData) => {
            const rssData = getRssData(parsedData);
            watchedState.feeds.unshift({
              id: Number(uniqueId()),
              url: curUrl,
              title: rssData.title,
              description: rssData.description,
            });
            watchedState.posts.unshift({
              feedId: state.feeds[state.feeds.length - 1].id,
              items: rssData.items,
            });
            watchedState.form.state = 'finished';
          })
          .catch((error) => {
            watchedState.form.valid = 'false';
            watchedState.form.error = error.message;
            watchedState.form.state = 'failed';
          });
      });
    });
};
