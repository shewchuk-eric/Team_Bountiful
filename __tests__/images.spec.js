jest.mock('../db/connect', () => ({
  getDb: jest.fn()
}));

jest.mock('../models/utilities', () => ({
  requireLogin: jest.fn(),
  imageSchema: {
    validate: jest.fn()
  }
}));

const mongodb = require('../db/connect');
const { requireLogin, imageSchema } = require('../models/utilities');
const imagesController = require('../controllers/con_images');

const createRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.setHeader = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

describe('Images Controller', () => {
  let mockCollection;
  let mockDb;

  beforeEach(() => {
    jest.clearAllMocks();

    mockCollection = {
      find: jest.fn(),
      insertOne: jest.fn(),
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

  test('listAll returns all images', async () => {
    const docs = [{ id: 1 }];

    mockCollection.find.mockReturnValue({
      toArray: jest.fn().mockResolvedValue(docs)
    });

    const req = { session: { accessLevel: 'user' } };
    const res = createRes();

    await imagesController.listAll(req, res);

    expect(mockCollection.find).toHaveBeenCalledWith({});
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(docs);
  });

  test('listByBook returns images by book', async () => {
    const docs = [{ bookWhereSeen: '1 Nephi' }];

    mockCollection.find.mockReturnValue({
      toArray: jest.fn().mockResolvedValue(docs)
    });

    const req = {
      params: { book: '1 Nephi' },
      session: { accessLevel: 'user' }
    };
    const res = createRes();

    await imagesController.listByBook(req, res);

    expect(mockCollection.find).toHaveBeenCalledWith({
      bookWhereSeen: '1 Nephi'
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(docs);
  });

  test('listByCharacter returns images by character', async () => {
    const docs = [{ characterName: 'Nephi' }];

    mockCollection.find.mockReturnValue({
      toArray: jest.fn().mockResolvedValue(docs)
    });

    const req = {
      params: { character: 'Nephi' },
      session: { accessLevel: 'user' }
    };
    const res = createRes();

    await imagesController.listByCharacter(req, res);

    expect(mockCollection.find).toHaveBeenCalledWith({
      characterName: 'Nephi'
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(docs);
  });

  test('createNewImage inserts a new image when admin and valid body', async () => {
    const body = {
      characterId: '123',
      characterName: 'Nephi',
      bookWhereSeen: '1 Nephi',
      characterQuality: 'Hero',
      caption: 'Test',
      description: 'Desc',
      source: 'Source'
    };

    imageSchema.validate.mockReturnValue({ error: null });

    mockCollection.insertOne.mockResolvedValue({
      acknowledged: true,
      insertedId: 'abc'
    });

    const req = { body, session: { accessLevel: 'admin' } };
    const res = createRes();

    await imagesController.createNewImage(req, res);

    expect(imageSchema.validate).toHaveBeenCalledWith(body);
    expect(mockCollection.insertOne).toHaveBeenCalledWith(body);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      acknowledged: true,
      insertedId: 'abc'
    });
  });

  test('createNewImage returns 400 on validation error', async () => {
    imageSchema.validate.mockReturnValue({
      error: { details: [{ message: 'Invalid' }] }
    });

    const req = { body: {}, session: { accessLevel: 'admin' } };
    const res = createRes();

    await imagesController.createNewImage(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid' });
  });

  test('updateImage updates an image when admin and valid body', async () => {
    const body = {
      characterId: '123',
      characterName: 'Nephi',
      bookWhereSeen: '1 Nephi',
      characterQuality: 'Hero',
      caption: 'Updated',
      description: 'Updated desc',
      source: 'Source'
    };

    imageSchema.validate.mockReturnValue({ error: null });

    mockCollection.replaceOne.mockResolvedValue({ modifiedCount: 1 });

    const req = {
      params: { id: '69227d43cc3fae26dd0125f9' },
      body,
      session: { accessLevel: 'admin' }
    };
    const res = createRes();

    await imagesController.updateImage(req, res);

    expect(imageSchema.validate).toHaveBeenCalledWith(body);
    expect(mockCollection.replaceOne).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(204);
  });

  test('updateImage returns 404 when no doc updated', async () => {
    const body = {
      characterId: '123',
      characterName: 'Nephi',
      bookWhereSeen: '1 Nephi',
      characterQuality: 'Hero',
      caption: 'Updated',
      description: 'Updated desc',
      source: 'Source'
    };

    imageSchema.validate.mockReturnValue({ error: null });

    mockCollection.replaceOne.mockResolvedValue({ modifiedCount: 0 });

    const req = {
      params: { id: '69227d43cc3fae26dd0125f9' },
      body,
      session: { accessLevel: 'admin' }
    };
    const res = createRes();

    await imagesController.updateImage(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });


  test('removeImage returns 500 due to internal error', async () => {
    const req = {
      params: { id: '69227d43cc3fae26dd0125f9' },
      session: { accessLevel: 'admin' }
    };
    const res = createRes();

    await imagesController.removeImage(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});
