// References:
// https://stackoverflow.com/questions/55551350/jest-test-formatting-tests-vs-test-js
// https://fek.io/blog/how-to-add-unit-testing-to-express-using-jest/
// https://dev.to/ali_adeku/guide-to-writing-integration-tests-in-express-js-with-jest-and-supertest-1059
// https://github.com/Adeku5080/task-manager-with-express/blob/master/tests/integration/tasksController.test.js

// --------------------------------------------------------
// 1. MOCK DEPENDENCIES
// --------------------------------------------------------
const mongodb = require('../db/connect');
const ObjectId = require('mongodb').ObjectId; 
const { requireLogin, characterSchema } = require('../models/utilities');

// Refer to model/utilities.js requireLogin function
const mockLogin = {
    session: {
        isLoggedIn: true
    }
};

const MOCK_ID = '6912970eb69127d1966091e3';
const MOCK_BOOK = '1 Nephi';

jest.mock('mongodb', () => ({
    // When mongodb automatically create an _id, it is of the type ObjectId.
    ObjectId: jest.fn((id) => ({
        toHexString: () => id || MOCK_ID,
        toString: () => id || MOCK_ID,
    })),
}));

// mongodb.getDb().db('team_bountiful').collection('characters').find(), etc.

// Mock the chained MongoDB calls: db().collection.find().toArray(), etc.
const mockCollection = {
    find: jest.fn(),
    insertOne: jest.fn(),
    replaceOne: jest.fn(),
    deleteOne: jest.fn()
}

// This commented line bewlo represents db('team_bountiful'):
// db: jest.fn(() => ({ ... }))
// This commented line below represents collection('characters'):
// collection: jest.fn(() => mockCollection)
const mockDb = {
    db: jest.fn(() => ({
        collection: jest.fn(() => mockCollection)
    }))
};

// Represents mongodb.getDb()
mongodb.getDb = jest.fn(() => mockDb);

// --------------------------------------------------------
// 2. MOCK UTILITIES
// --------------------------------------------------------

// Utility to mock joi character schema
jest.mock('../models/utilities', () => ({
    requireLogin: jest.fn(),
    characterSchema: {
        validate: jest.fn((data) => ({ error: undefined, value: data }))
    }
}));

// Utility to mock a response object
const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnThis();
    res.json = jest.fn().mockReturnThis();
    res.send = jest.fn().mockReturnThis();
    res.setHeader = jest.fn().mockReturnThis();
    return res;
}

// --------------------------------------------------------
// 3. IMPORT CONTROLLER AND ROUTE
// --------------------------------------------------------

// This block of code below does the same thing as this:
// const charactersController = require('../controllers/con_characters.js');
// const listAll = charactersController.listAll;
// const listDetails = charactersController.listDetails;
// const listByBook = charactersController.listByBook;
// const listByQuality = charactersController.listByQuality;
// const createNewCharacter = charactersController.createNewCharacter;
// const updateCharacter = charactersController.updateCharacter;
// const deleteCharacter = charactersController.deleteCharacter;
const {
    listAll,
    listDetails,
    listByBook,
    listByQuality,
    createNewCharacter,
    updateCharacter,
    deleteCharacter
} = require('../controllers/con_characters.js');

// This is the express router object exported from the characters routes file.
const charactersRoutes = ('../routes/characters.js');

// --------------------------------------------------------
// 4. CONTROLLER UNIT TESTS
// --------------------------------------------------------

// The string 'Characters Controller' is a label that Jest prints when it runs the tests.
describe('Characters Controller', (() => {
    let res;
    beforeEach(() => {
        // This clear the mock functions before each single test runs.
        jest.clearAllMocks();
        // This creates a new mockResponse object that has not had its
        // res.status, res.json, res.send, and res.setHeader set yet.
        res = mockResponse();
    });

    // --- GET: LIST ALL CHARACTERS ---
    describe('listAll', () => {
        it('should return 200 and list of all characters', async () => {
            requireLogin.mockReturnValue(true); // login success

            const mockData = [{
                _id: MOCK_ID,
                characterName: 'Nephi',
                firstBookSeen: '1 Nephi',
                firstVerseSeen: '1:1',
                quality: 'Hero',
                notes: 'Son of Lehi. Righteous and knows his father to be a true prophet. Repeatedly calls upon the Lord for wisdom and knowledge. Builds the boat that brings his family to the new lands. During the time in the wilderness, he marries and has children. The name of his wife, the name and number of his children, is never given.'               
            }];

            // This represents find().toArray().
            // When find() is called, it returns this entire object:
            // {
            //      toArray: jest.fn().mockResolvedValue(mockData)
            // }
            // where the method 'toArray' is a property (a key) of that object
            // and its value 'jest.fn().mockResolvedValue(mockData)' is a function.
            mockCollection.find.mockReturnValue({
                toArray: jest.fn().mockResolvedValue(mockData)
            });

            // An empty object {} is passed because the listAll
            // function does not require any data from the request such as
            // req.params (id, etc.) or req.body (used to insert data).
            // The new res mockResponse object is passed that was created
            // in the beforeEach block.
            await listAll(mockLogin, res);

            // This checks that mockCollection.find, the find method on the
            // mockCollection object, has been called at least once.
            expect(mockCollection.find).toHaveBeenCalled();

            // This checks that res.status has been called with 200.
            expect(res.status).toHaveBeenCalledWith(200);

            // This checks that res.json was called and the mockData
            // array was passed to the res.json function as an argument.
            expect(res.json).toHaveBeenCalledWith(mockData);
        });

        it('should return 403 if access level insufficient', async () => {
            requireLogin.mockReturnValue(false); // login failure

            await listAll({ session: {} }, res);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({ message: 'You must be signed in to use this resource.' })
        });

        it('should return 500 on database connection error', async () => {
            requireLogin.mockReturnValue(true); // login success

            mockCollection.find.mockImplementation(() => {
                throw new Error('An internal server error occurred.');
            });

            await listAll(mockLogin, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: 'An internal server error occurred.'});
        });
    });

    // --- GET: LIST CHARACTER DETAILS BY ID ---
    describe('listDetails', () => {
        const req = { 
            mockLogin,
            params: { id: MOCK_ID } 
        };

        const mockData = [{
            _id: MOCK_ID,
            characterName: 'Nephi',
            firstBookSeen: '1 Nephi',
            firstVerseSeen: '1:1',
            quality: 'Hero',
            notes: 'Son of Lehi. Righteous and knows his father to be a true prophet. Repeatedly calls upon the Lord for wisdom and knowledge. Builds the boat that brings his family to the new lands. During the time in the wilderness, he marries and has children. The name of his wife, the name and number of his children, is never given.'               
        }];

        it('should return 200 and the character details', async () => {
            requireLogin.mockReturnValue(true); // login success
 
            mockCollection.find.mockReturnValue({
                toArray: jest.fn().mockResolvedValue(mockData)
            });
            
            await listDetails(req, res);

            expect(ObjectId).toHaveBeenCalledWith(MOCK_ID);
            expect(mockCollection.find).toHaveBeenCalledWith({ _id: expect.any(Object) });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockData);
        });

        it('should return 403 if access level insufficient', async () => {
            requireLogin.mockReturnValue(false); // login failure

            await listDetails({ session: {}, params: { id: MOCK_ID } }, res);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({ message: 'You must be signed in to use this resource.' })
        });        

        it('should return 404 if the character is not found', async () => {
            requireLogin.mockReturnValue(true); // login success

            mockCollection.find.mockReturnValue({
                toArray: jest.fn().mockResolvedValue([])
            });

            await listDetails(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'The character with the specified id was not found.' });
        })

        it('should return 500 on database connection error', async () => {
            requireLogin.mockReturnValue(true); // login success

            mockCollection.find.mockImplementation(() => {
                throw new Error('An internal server error occurred.');
            });

            await listDetails(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: 'An internal server error occurred.'});
        });
    });

    // --- GET: LIST CHARACTER DETAILS BY BOOK ---
    describe('listByBook', () => {
        const req = { 
            mockLogin,
            params: { book: MOCK_BOOK } 
        };

        const mockData = [{
            _id: MOCK_ID,
            characterName: 'Nephi',
            firstBookSeen: '1 Nephi',
            firstVerseSeen: '1:1',
            quality: 'Hero',
            notes: 'Son of Lehi. Righteous and knows his father to be a true prophet. Repeatedly calls upon the Lord for wisdom and knowledge. Builds the boat that brings his family to the new lands. During the time in the wilderness, he marries and has children. The name of his wife, the name and number of his children, is never given.'               
        }];

        it('should return 200 and the character details', async () => {
            requireLogin.mockReturnValue(true); // login success
 
            mockCollection.find.mockReturnValue({
                toArray: jest.fn().mockResolvedValue(mockData)
            });
            
            await listByBook(req, res);

            expect(mockCollection.find).toHaveBeenCalledWith({ firstBookSeen: MOCK_BOOK });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockData);
        });

        it('should return 403 if access level insufficient', async () => {
            requireLogin.mockReturnValue(false); // login failure

            await listByBook({ session: {}, params: { book: MOCK_BOOK } }, res);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({ message: 'You must be signed in to use this resource.' })
        });        

        it('should return 404 if the character is not found', async () => {
            requireLogin.mockReturnValue(true); // login success

            mockCollection.find.mockReturnValue({
                toArray: jest.fn().mockResolvedValue([])
            });

            await listByBook(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'No characters with the specified book were found.' });
        })

        it('should return 500 on database connection error', async () => {
            requireLogin.mockReturnValue(true); // login success

            mockCollection.find.mockImplementation(() => {
                throw new Error('An internal server error occurred.');
            });

            await listByBook(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: 'An internal server error occurred.'});
        });
    });



}));

