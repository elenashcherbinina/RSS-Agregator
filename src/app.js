import _ from 'lodash';
import onChange from 'on-change';
import { object, string } from 'yup';
import render from './render.js';

const schema = (initialState) => {
  object().shape({
    url: string()
      .trim()
      .required()
      .url('Cсылка должна быть валидным URL')
      .notOneOf(initialState.feeds, 'RSS уже существует'),
  });
};

const validate = (fields) => {
  try {
    schema.validate(fields, { abortEarly: false });
    return {};
  } catch (e) {
    return _.keyBy(e.inner, 'path');
  }
};

const app = () => {
  const elements = {
    form: document.querySelector('form'),
    input: document.querySelector('input'),
    submitButton: document.querySelector('[type="submit"'), // зачем она?
    feedback: document.querySelector('.feedback'),
    containerFeeds: document.querySelector('div.posts'),
    containerPosts: document.querySelector('div.feeds'),
  };

  const initialState = {
    form: {
      state: 'filling',
      isValid: true,
      error: '',
      url: '',
    },
    feeds: [],
    posts: [],
  };

  const watchedState = onChange(initialState, render(elements, initialState));

  elements.form.addEventListener('submit', async (e) => {
    e.preventDefault();
    watchedState.form.state = 'sending';
    const formData = new FormData(e.target);
    const data = formData.get('url');
    watchedState.form.url = data;

    await validate(watchedState.form.url).then((error) => {
      if (error !== '') {
        watchedState.form.error = error;
        watchedState.isValid = 'false';
      } else {
        watchedState.isValid = 'true';
        // отправить в feeds / posts
      }
    });
  });
};

export default app;
