jest.mock('../db/connect', () => ({
  getDb: jest.fn()
}));

jest.mock('../models/utilities', () => ({
  requireLogin: jest.fn(),
  quoteSchema: {
    validate: jest.fn()
  }
}));

const mongodb = require('../db/connect');
const { requireLogin, quoteSchema } = require('../models/utilities');
const quotesController = require('../controllers/con_quotes');

const createRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.setHeader = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

describe('Quotes Controller', () => {
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

    test('listAll returns all quotes', async () => {
        const docs = [{ id: 1 }];
        mockCollection.find.mockReturnValue({
            toArray: jest.fn().mockResolvedValue(docs)
        });

        const req = {};
        const res = createRes();

        await quotesController.listAll(req, res);

        expect(mockCollection.find).toHaveBeenCalledWith({});
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(docs);
    });

    test('listByBook returns quotes by book', async () => {
        const docs = [{ bookName: '1 Nephi' }];
        mockCollection.find.mockReturnValue({
            toArray: jest.fn().mockResolvedValue(docs)
        });

        const req = {
            params: { book: '1 Nephi' }
        };
        const res = createRes();

        await quotesController.listByBook(req, res);

        expect(mockCollection.find).toHaveBeenCalledWith({
            bookName: '1 Nephi'
        });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(docs);
    });

    test('listByCharacter returns quotes by character', async () => {
        const docs = [{ characterName: 'Nephi' }];
        mockCollection.find.mockReturnValue({
            toArray: jest.fn().mockResolvedValue(docs)
        });

        const req = {
            params: { character: 'Nephi' }
        };
        const res = createRes();

        await quotesController.listByCharacter(req, res);

        expect(mockCollection.find).toHaveBeenCalledWith({
            characterName: 'Nephi'
        });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(docs);
    });

    test('createNewQuote inserts a new quote', async () => {
        const body = {
            characterId: '123',
            characterName: 'Nephi',
            bookName: '1 Nephi',
            verse: '1:1',
            characterQuality: 'Hero',
            text: 'Test'
        };

        quoteSchema.validate.mockReturnValue({ error: null });

        mockCollection.insertOne.mockResolvedValue({
          acknowledged: true,
          insertedId: 'abc'
        });

        const req = { body, session: { accessLevel: 'admin' } };
        const res = createRes();

        await quotesController.createNewQuote(req, res);

        expect(quoteSchema.validate).toHaveBeenCalledWith(body);
        expect(mockCollection.insertOne).toHaveBeenCalledWith(body);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
          acknowledged: true,
          insertedId: 'abc'
        });
    });

    test('createNewQuote returns 400 on validation error', async () => {
        quoteSchema.validate.mockReturnValue({
            error: {
                details: [{ message: 'Invalid' }]
            }
        });

        const req = { body: {}, session: { accessLevel: 'admin' } };
        const res = createRes();

        await quotesController.createNewQuote(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'Invalid' });
    });

    test('updateQuote updates a quote', async () => {
        const body = {
            characterId: '123',
            characterName: 'Nephi',
            bookName: '1 Nephi',
            verse: '1:1',
            characterQuality: 'Hero',
            text: 'Test'
        };

        quoteSchema.validate.mockReturnValue({ error: null });
        mockCollection.replaceOne.mockResolvedValue({ modifiedCount: 1 });

        const req = {
            params: { id: '69227d43cc3fae26dd0125f9' },
            body,
            session: { accessLevel: 'admin' }
        };
        const res = createRes();

        await quotesController.updateQuote(req, res);

        expect(quoteSchema.validate).toHaveBeenCalledWith(body);
        expect(mockCollection.replaceOne).toHaveBeenCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(204);
    });

    test('updateQuote returns 404 when no doc updated', async () => {
        const body = {
            characterId: '123',
            characterName: 'Nephi',
            bookWhereSeen: '1 Nephi',
            characterQuality: 'Hero',
            caption: 'Updated',
            description: 'Updated desc',
            source: 'Source'
        };

        quoteSchema.validate.mockReturnValue({ error: null });
        mockCollection.replaceOne.mockResolvedValue({
            modifiedCount: 0
        });

        const req = {
            params: { id: '69227d43cc3fae26dd0125f9' },
            body,
            session: { accessLevel: 'admin' }
        };
        const res = createRes();

        await quotesController.updateQuote(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });

    test('removeQuote deletes a quote', async () => {
        mockCollection.deleteOne.mockResolvedValue({
            deletedCount: 1
        });

        const req = {
            params: { id: '69227d43cc3fae26dd0125f9' },
            session: { accessLevel: 'admin' }
        };
        const res = createRes();

        await quotesController.removeQuote(req, res);

        expect(mockCollection.deleteOne).toHaveBeenCalledTimes(1);
        const [filterArg] = mockCollection.deleteOne.mock.calls[0];
        expect(filterArg).toHaveProperty('_id');
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('removeQuote returns 404 when not found', async () => {
        mockCollection.deleteOne.mockResolvedValue({ deletedCount: 0 });

        const req = {
            params: { id: '69227d43cc3fae26dd0125f9' },
            session: { accessLevel: 'admin' }
        };
        const res = createRes();

        await quotesController.removeQuote(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });
});