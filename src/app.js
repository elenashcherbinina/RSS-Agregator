import i18next from 'i18next';
import onChange from 'on-change';
import * as yup from 'yup';
import uniqueId from 'lodash/uniqueId.js';
import axios from 'axios';

import resources from './locales/index.js';
import render from './render.js';
import parse from './parser.js';

const validate = (url, urls) => {
  const schema = yup.string().url().notOneOf(urls);
  return schema.validate(url);
};

const getData = (url) => {
  const proxy = `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`;
  return axios.get(proxy);
};

const getUpdates = (watchedState) => {
  const promises = watchedState.feeds.map(({ id, url }) =>
    getData(url).then((response) => {
      const { posts } = parse(response.data.contents);
      const curPostsLinks = watchedState.posts.map((post) => post.map((item) => item.link)).flat();
      const newPosts = posts.filter((item) => !curPostsLinks.includes(item.link));
      if (newPosts.length !== 0) {
        newPosts.forEach((newPost) => {
          newPost.id = Number(uniqueId());
          newPost.feedId = id;
        });
        watchedState.posts.unshift(newPosts);
      }
    }),
  );
  return Promise.all(promises).then(setTimeout(() => getUpdates(watchedState), 5000));
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
            return getData(url);
          })
          .then((response) => response.data.contents)
          .then((contents) => {
            const { feed, posts } = parse(contents);
            feed.url = curUrl;
            feed.id = Number(uniqueId());

            posts.map((post) => {
              post.feedId = feed.id;
              post.id = Number(uniqueId());
            });

            watchedState.feeds.unshift(feed);
            watchedState.posts.unshift(posts);
            watchedState.form.state = 'finished';
          })
          .catch((error) => {
            watchedState.form.valid = 'false';
            watchedState.form.error = error.message;
            watchedState.form.state = 'failed';
          });
      });
      setTimeout(() => getUpdates(watchedState), 5000);
    });
};
