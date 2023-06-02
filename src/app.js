import i18next from 'i18next';
import onChange from 'on-change';
import * as yup from 'yup';
import uniqueId from 'lodash/uniqueId.js';
import axios from 'axios';

import resources from './locales/index.js';
import locale from './locales/yupLocale.js';
import render from './render.js';
import parse from './parser.js';

const TIMEOUT = 5000;
const DEFAULT_LANGUAGE = 'ru';

const validate = (url, urls) => {
  const schema = yup.string().required().url().notOneOf(urls);
  return schema.validate(url);
};

const generatePostsWithId = (posts, feedId) => {
  const postsWithId = posts.map((post) => ({
    ...post,
    feedId,
    id: Number(uniqueId()),
  }));
  return postsWithId;
};

const getProxiUrl = (url) => {
  const proxy = new URL('https://allorigins.hexlet.app/get');
  proxy.searchParams.set('url', url);
  proxy.searchParams.set('disableCache', true);
  return proxy;
};

const loadRSS = (url, watchedState) => {
  watchedState.loadingProcess = { status: 'loading', error: null };

  return axios
    .get(getProxiUrl(url), { timeout: TIMEOUT })
    .then((response) => response.data.contents)
    .then((contents) => {
      const { feed, posts } = parse(contents);
      feed.url = url;
      feed.id = Number(uniqueId());
      const postsWithId = generatePostsWithId(posts, feed.id);

      watchedState.loadingProcess = { status: 'finished', error: null };
      watchedState.feeds.unshift(feed);
      watchedState.posts.unshift(...postsWithId);
    })
    .catch((error) => {
      watchedState.loadingProcess = { status: 'failed', error: error.message };
      console.log('watchedState loading', watchedState);
    });
};

const getUpdates = (watchedState) => {
  const promises = watchedState.feeds.map(({ id, url }) => {
    const request = axios.get(getProxiUrl(url), { timeout: TIMEOUT });

    return request.then((response) => {
      const { posts } = parse(response.data.contents);
      const curPostsLinks = watchedState.posts.map((post) => post.link);

      const newPosts = posts.filter((item) => !curPostsLinks.includes(item.link));
      const newPostsWithId = generatePostsWithId(newPosts, id);
      watchedState.posts.unshift(...newPostsWithId);
    });
  });
  return Promise.all(promises).then(setTimeout(() => getUpdates(watchedState), TIMEOUT));
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
    submit: document.querySelector('.submit'),
    containerFeeds: document.querySelector('.feeds'),
    containerPosts: document.querySelector('.posts'),
    modal: {
      title: document.querySelector('.modal-title'),
      text: document.querySelector('.modal-body'),
      link: document.querySelector('.modal-link'),
    },
  };

  const i18nInstance = i18next.createInstance();

  i18nInstance
    .init({
      lng: DEFAULT_LANGUAGE,
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
            watchedState.form = { isValidate: 'true', error: null };
            loadRSS(url, watchedState);
          })
          .catch((error) => {
            watchedState.form = { isValidate: 'false', error: error.message };
          });
      });
      elements.containerPosts.addEventListener('click', (event) => {
        const clickedPostId = event.target.dataset.id;
        if (!clickedPostId) {
          return;
        }
        watchedState.modal.postId = Number(clickedPostId);
        watchedState.modal.viewedPosts.add(Number(clickedPostId));
      });
      setTimeout(() => getUpdates(watchedState), TIMEOUT);
    });
};
