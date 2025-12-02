jest.mock('../../db/connect', () => ({
  getDb: jest.fn()
}));

jest.mock('../../models/utilities', () => ({
  imageSchema: {
    validate: jest.fn()
  }
}));

jest.mock('mongodb', () => ({
  ObjectId: jest.fn((id) => id)
}));

const mongodb = require('../../db/connect');
const { imageSchema } = require('../../models/utilities');
const imagesController = require('../../controllers/con_images');

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
    jest.clearAllMocks();
  });

  test('listAll returns all images', async () => {
    const docs = [{ id: 1 }];
    mockCollection.find.mockReturnValue({
      toArray: jest.fn().mockResolvedValue(docs)
    });

    const req = {};
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

    const req = { params: { book: '1 Nephi' } };
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

    const req = { params: { character: 'Nephi' } };
    const res = createRes();

    await imagesController.listByCharacter(req, res);

    expect(mockCollection.find).toHaveBeenCalledWith({
      characterName: 'Nephi'
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(docs);
  });

  test('createNewImage inserts a new image', async () => {
    const body = {
      characterId: '123',
      characterName: 'Nephi',
      bookWhereSeen: '1 Nephi',
      characterQuality: 'Hero',
      filename: 'nephi.jpg',
      caption: 'Test',
      description: 'Desc',
      source: 'Source'
    };

    imageSchema.validate.mockReturnValue({ error: null });
    mockCollection.insertOne.mockResolvedValue({
      acknowledged: true,
      insertedId: 'abc'
    });

    const req = { body };
    const res = createRes();

    await imagesController.createNewImage(req, res);

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

    const req = { body: {} };
    const res = createRes();

    await imagesController.createNewImage(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid' });
  });

  test('updateImage updates an image', async () => {
    imageSchema.validate.mockReturnValue({ error: null });
    mockCollection.replaceOne.mockResolvedValue({ modifiedCount: 1 });

    const body = {
      characterId: '123',
      characterName: 'Nephi',
      bookWhereSeen: '1 Nephi',
      characterQuality: 'Hero',
      filename: 'nephi2.jpg',
      caption: 'Updated',
      description: 'Updated desc',
      source: 'Source'
    };

    const req = { params: { id: 'id123' }, body };
    const res = createRes();

    await imagesController.updateImage(req, res);

    expect(mockCollection.replaceOne).toHaveBeenCalledTimes(1);
    const [filterArg, docArg] = mockCollection.replaceOne.mock.calls[0];
    expect(filterArg).toHaveProperty('_id');
    expect(docArg).toEqual(body);
    expect(res.status).toHaveBeenCalledWith(204);
  });

  test('updateImage returns 404 when no doc updated', async () => {
    imageSchema.validate.mockReturnValue({ error: null });
    mockCollection.replaceOne.mockResolvedValue({ modifiedCount: 0 });

    const req = { params: { id: 'id123' }, body: {} };
    const res = createRes();

    await imagesController.updateImage(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('removeImage deletes an image', async () => {
    mockCollection.deleteOne.mockResolvedValue({ deletedCount: 1 });

    const req = { params: { id: 'id123' } };
    const res = createRes();

    await imagesController.removeImage(req, res);

    expect(mockCollection.deleteOne).toHaveBeenCalledTimes(1);
    const [filterArg] = mockCollection.deleteOne.mock.calls[0];
    expect(filterArg).toHaveProperty('_id');
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('removeImage returns 404 when not found', async () => {
    mockCollection.deleteOne.mockResolvedValue({ deletedCount: 0 });

    const req = { params: { id: 'id123' } };
    const res = createRes();

    await imagesController.removeImage(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });
});
