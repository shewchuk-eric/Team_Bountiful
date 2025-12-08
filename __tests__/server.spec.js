
const mockApp = {
  routes: {
    get: []
  },
  use: jest.fn(function () {

    return mockApp;
  }),
  get: jest.fn(function (path, ...handlers) {
    mockApp.routes.get.push({ path, handlers });

    return mockApp;
  }),
  listen: jest.fn()
};

jest.mock('express', () => {
  const express = () => mockApp;


  express.Router = jest.fn(() => ({}));


  express.json = jest.fn(() => (req, res, next) => next());
  express.urlencoded = jest.fn(() => (req, res, next) => next());

  return express;
});


jest.mock('../db/connect.js', () => ({
  initDb: jest.fn()
}));


jest.mock('swagger-ui-express', () => ({
  serve: (req, res, next) => next(),
  setup: () => (req, res, next) => next()
}));


jest.mock('../routes/index.js', () => (req, res, next) => next());


jest.mock('passport-github2', () => ({
  Strategy: jest.fn(function MockStrategy() {})
}));


const mockPassport = {
  use: jest.fn(),
  initialize: jest.fn(() => (req, res, next) => next()),
  session: jest.fn(() => (req, res, next) => next()),
  authenticate: jest.fn(() => (req, res, next) => next()),
  serializeUser: jest.fn(),
  deserializeUser: jest.fn()
};
jest.mock('passport', () => mockPassport);



const { app } = require('../server.js'); 



function getGetRouteHandlers(path) {
  const route = mockApp.routes.get.find((r) => r.path === path);
  if (!route) {
    throw new Error(`GET ${path} not found on mock app`);
  }
  return route.handlers;
}


describe('server.js basic routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('GET / shows login link when no user', () => {
    const [rootHandler] = getGetRouteHandlers('/');

    const req = {};
    const res = { send: jest.fn() };

    rootHandler(req, res);

    expect(res.send).toHaveBeenCalledWith(
      '<a href="/auth/github">Login with GitHub</a>'
    );
  });

  test('GET / shows api-docs link when user is logged in', () => {
    const [rootHandler] = getGetRouteHandlers('/');

    const req = { user: { username: 'testuser' } };
    const res = { send: jest.fn() };

    rootHandler(req, res);

    expect(res.send).toHaveBeenCalledWith(
      '<a href="/api-docs/#/">You are logged in. View Swagger docs</a>'
    );
  });

  test('GET /auth/github/callback sets session and redirects', () => {
    const handlers = getGetRouteHandlers('/auth/github/callback');

    const callback = handlers[1];

    const req = {
      session: {},
      user: { username: 'testuser' }
    };
    const res = { redirect: jest.fn() };

    callback(req, res);

    expect(req.session.isLoggedIn).toBe(true);
    expect(req.session.username).toBe('testuser');
    expect(res.redirect).toHaveBeenCalledWith('/users/checkAdmin/testuser');
  });

  test('GET /logout calls logout and redirects to /', () => {
    const [logoutHandler] = getGetRouteHandlers('/logout');

    const logoutFn = jest.fn((cb) => cb && cb());
    const req = { logout: logoutFn };
    const res = { redirect: jest.fn() };

    logoutHandler(req, res);

    expect(logoutFn).toHaveBeenCalledTimes(1);
    expect(res.redirect).toHaveBeenCalledWith('/');
  });
});
