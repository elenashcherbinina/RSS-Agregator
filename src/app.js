import i18next from 'i18next';
import onChange from 'on-change';
import * as yup from 'yup';
import uniqueId from 'lodash/uniqueId.js';
import axios from 'axios';

import resources from './locales/index.js';
import locale from './locales/yupLocale.js';
import render from './render.js';
import parse from './parser.js';

const validate = (url, urls) => {
  const schema = yup.string().required().url().notOneOf(urls);
  return schema.validate(url);
};

const getProxiUrl = (url) => {
  const proxy = new URL('https://allorigins.hexlet.app/get');
  proxy.searchParams.set('url', url);
  proxy.searchParams.set('disableCache', true);
  return proxy;
};

const getUpdates = (watchedState) => {
  const promises = watchedState.feeds.map(({ id, url }) => {
    const request = axios.get(getProxiUrl(url));

    return request.then((response) => {
      const { posts } = parse(response.data.contents);
      const curPostsLinks = watchedState.posts.map((post) => post.link);
      const newPosts = posts.filter((item) => !curPostsLinks.includes(item.link));
      if (newPosts.length !== 0) {
        const newPostsWithId = newPosts.map((newPost) => {
          const newPostWithId = { ...newPost, feedId: id, id: Number(uniqueId()) };
          return newPostWithId;
        });
        watchedState.posts.unshift(...newPostsWithId);
      }
    });
  });
  return Promise.all(promises).then(setTimeout(() => getUpdates(watchedState), 5000));
};

export default () => {
  const initialState = {
    form: {
      isValidate: null,
      error: null,
    },
    loadingProcess: {
      status: 'filling',
      error: null,
    },
    feeds: [],
    posts: [],
    modal: {
      postId: null,
      viewedPosts: new Set(),
    },
  };

  const elements = {
    form: document.querySelector('form'),
    input: document.querySelector('input'),
    feedback: document.querySelector('.feedback'),
    submit: document.querySelector('.rss-form button[type="submit"]'),
    containerFeeds: document.querySelector('div.feeds'),
    containerPosts: document.querySelector('div.posts'),
    modal: {
      title: document.querySelector('.modal-title'),
      text: document.querySelector('.modal-body'),
      link: document.querySelector('a.full-article'),
    },
  };

  const defaultLanguage = 'ru';
  const i18nInstance = i18next.createInstance();

  i18nInstance
    .init({
      lng: defaultLanguage,
      debug: false,
      resources,
    })
    .then(() => {
      yup.setLocale(locale);

      const watchedState = onChange(initialState, render(elements, initialState, i18nInstance));

      elements.form.addEventListener('submit', (e) => {
        e.preventDefault();
        watchedState.loadingProcess.status = 'sending';
        const formData = new FormData(e.target);
        const curUrl = formData.get('url').trim();

        const urls = initialState.feeds.map(({ url }) => url);

        validate(curUrl, urls)
          .then((url) => {
            watchedState.loadingProcess.status = 'loading';
            return axios.get(getProxiUrl(url));
          })
          .then((response) => response.data.contents)
          .then((contents) => {
            const { feed, posts } = parse(contents);

            feed.url = curUrl;
            feed.id = Number(uniqueId());

            const postsWithId = posts.map((post) => {
              const postWithId = { ...post, feedId: feed.id, id: Number(uniqueId()) };
              return postWithId;
            });

            watchedState.feeds.unshift(feed);
            watchedState.posts.unshift(...postsWithId);
            watchedState.form = { isValidate: 'true', error: null };
            watchedState.loadingProcess = { status: 'finished', error: null };
          })
          .catch((error) => {
            if (error.name === 'ValidationError') {
              watchedState.form = { isValidate: 'false', error: error.message };
            } else {
              watchedState.loadingProcess = { status: 'failed', error: error.message };
            }
          });
      });
      elements.containerPosts.addEventListener('click', (event) => {
        const clickedPostId = event.target.dataset.id;
        watchedState.modal.postId = Number(clickedPostId);
        watchedState.modal.viewedPosts.add(Number(clickedPostId));
      });
      setTimeout(() => getUpdates(watchedState), 5000);
    });
};
