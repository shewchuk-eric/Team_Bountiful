jest.mock('../db/connect', () => ({
  getDb: jest.fn()
}));

jest.mock('../models/utilities', () => ({
  requireLogin: jest.fn(),
  userSchema: {
    validate: jest.fn()
  },
  getToday: jest.fn(() => '1111-11-11')
}));

const mongodb = require('../db/connect');
const { requireLogin, userSchema, getToday } = require('../models/utilities');
const usersController = require('../controllers/con_users');

const createRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.setHeader = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

describe('Users Controller', () => {
  let mockCollection;
  let mockDb;

  beforeEach(() => {
    jest.clearAllMocks();

    mockCollection = {
      find: jest.fn(),
      insertOne: jest.fn(),
      updateOne: jest.fn(),
      replaceOne: jest.fn(),
      deleteOne: jest.fn()
    };

    mockDb = {
      db: jest.fn(() => ({
        collection: jest.fn(() => mockCollection)
      }))
    };

    mongodb.getDb.mockReturnValue(mockDb);

    // default: logged-in user
    requireLogin.mockReturnValue(true);
  });

  test('listAllUsers returns all users', async () => {
      const docs = [{ id: 1 }];
  
      mockCollection.find.mockReturnValue({
        toArray: jest.fn().mockResolvedValue(docs)
      });
  
      const req = { session: { accessLevel: 'admin' } };
      const res = createRes();
  
      await usersController.listAllUsers(req, res);
  
      expect(mockCollection.find).toHaveBeenCalledWith({});
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(docs);
  });

  test('getUserByGitName check for admin by Git name', async () => {
      const docs = [{ 
        gitName: 'Name', 
        accessLevel: 'user'
    }];
  
      mockCollection.findOne = jest.fn().mockResolvedValue(docs);
  
      const req = {
        params: { gitName: 'Name' },
        session: { accessLevel: 'admin' }
      };
      const res = createRes();
      res.redirect = jest.fn();
  
      await usersController.getUserByGitName(req, res);
  
      expect(mockCollection.findOne).toHaveBeenCalledWith({
        gitName: 'Name'
      });

      expect(req.session.accessLevel).toBe('user');
      expect(res.redirect).toHaveBeenCalledWith('/api-docs/#/');
    });

    test('createNewUser inserts a new user when admin and valid body', async () => {
    const body = {
      firstName: 'fName',
      lastName: 'lName',
      email: 'myemail@email.com',
      userName: 'username',
      password: '12345Password',
      accessLevel: 'admin',
      accountModified: getToday(),
      gitName: 'GitName'
    };

    userSchema.validate.mockReturnValue({ error: null });

    mockCollection.insertOne.mockResolvedValue({
      acknowledged: true,
      insertedId: 'abc'
    });

    const req = { body, session: { accessLevel: 'admin' } };
    const res = createRes();

    await usersController.createNewUser(req, res);

    expect(userSchema.validate).toHaveBeenCalledWith(body);
    expect(mockCollection.insertOne).toHaveBeenCalledWith(body);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      acknowledged: true,
      insertedId: 'abc'
    });
  });

  test('createNewUser returns 400 on validation error', async () => {
    userSchema.validate.mockReturnValue({
      error: { details: [{ message: 'Invalid' }] }
    });

    const req = { body: {}, session: { accessLevel: 'admin' } };
    const res = createRes();

    await usersController.createNewUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid' });
  });

  test('updateUser updates a user when admin and valid body', async () => {
    const body = {
      firstName: 'fName',
      lastName: 'lName',
      email: 'myemail@email.com',
      userName: 'username',
      password: '12345Password',
      accessLevel: 'admin',
      accountModified: getToday(),
      gitName: 'GitName'
    };

    userSchema.validate.mockReturnValue({ error: null });

    mockCollection.replaceOne.mockResolvedValue({ modifiedCount: 1 });

    const req = {
      params: { id: '69227d43cc3fae26dd0125f9' },
      body,
      session: { accessLevel: 'admin' }
    };
    const res = createRes();

    await usersController.updateUser(req, res);

    expect(mockCollection.replaceOne).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(204);
  });

  test('changePassword updates a user\'s password', async () => {
    const body = {
      password: '12345Password',
    };

    userSchema.validate.mockReturnValue({ error: null });

    mockCollection.updateOne.mockResolvedValue({ modifiedCount: 1 });

    const req = {
      params: { id: '69227d43cc3fae26dd0125f9' },
      body,
      session: { accessLevel: 'admin' }
    };
    const res = createRes();

    await usersController.changePassword(req, res);

    expect(mockCollection.updateOne).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(204);
  });

  test('setAccessLevel sets a user\'s access level', async () => {
    const body = {
      accessLevel: 'user',
    };

    userSchema.validate.mockReturnValue({ error: null });

    mockCollection.updateOne.mockResolvedValue({ modifiedCount: 2 });

    const req = {
      params: { id: '69227d43cc3fae26dd0125f9' },
      body,
      session: { accessLevel: 'admin' }
    };
    const res = createRes();

    await usersController.setAccessLevel(req, res);

    expect(mockCollection.updateOne).toHaveBeenCalledTimes(2);
    expect(res.status).toHaveBeenCalledWith(204);
  });

  test('removeUser returns 500 due to internal error', async () => {
      const req = {
        params: { id: '69227d43cc3fae26dd0125f9' },
        session: { accessLevel: 'admin' }
      };
      const res = createRes();
  
      await usersController.removeUser(req, res);
  
      expect(res.status).toHaveBeenCalledWith(500);
    });
});