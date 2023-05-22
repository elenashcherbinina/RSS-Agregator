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
  const promises = watchedState.feeds.map(({ id, url }) => {
    const request = getData(url);

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
  const defaultLanguage = 'ru';
  const i18nInstance = i18next.createInstance();

  i18nInstance
    .init({
      lng: defaultLanguage,
      debug: false,
      resources,
    })
    .then(() => {
      const elements = {
        form: document.querySelector('form'),
        input: document.querySelector('input'),
        feedback: document.querySelector('.feedback'),
        containerFeeds: document.querySelector('div.feeds'),
        containerPosts: document.querySelector('div.posts'),
        modal: {
          title: document.querySelector('.modal-title'),
          text: document.querySelector('.modal-body'),
          link: document.querySelector('a.full-article'),
        },
      };

      const state = {
        form: {
          valid: true,
        },
        loadingProcess: {
          state: 'filling',
        },
        error: null,
        feeds: [],
        posts: [],
        modal: {
          postId: null,
          viewedPosts: new Set(),
        },
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
        watchedState.loadingProcess.state = 'sending';
        const formData = new FormData(e.target);
        const curUrl = formData.get('url').trim();

        const urls = state.feeds.map(({ url }) => url);

        validate(curUrl, urls)
          .then((url) => {
            watchedState.form.valid = 'true';
            watchedState.loadingProcess.state = 'loading';
            watchedState.error = null;
            return getData(url);
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
            watchedState.loadingProcess.state = 'finished';
          })
          .catch((error) => {
            watchedState.form.valid = 'false';
            watchedState.loadingProcess.state = 'failed';
            watchedState.error = error.message;
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
