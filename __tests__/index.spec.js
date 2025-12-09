// This is the express router object exported from the index routes file.
const indexRoutes = require('../routes/index.js');
const swaggerRouter = require('../routes/swagger');
const usersRouter = require('../routes/users');
const charactersRouter = require('../routes/characters');
const quotesRouter = require('../routes/quotes');
const imagesRouter = require('../routes/images');

// --------------------------------------------------------
// INDEX ROUTE UNIT TESTS
// --------------------------------------------------------

describe('Index Routes Mapping', () => {
    it('should have the correct number of routes (5)', () => {
        expect(indexRoutes.stack.length).toBe(5);
    });


    // Test the / route
    it('should map / route correctly', () => {
        const routeLayer = indexRoutes.stack.find(
            layer => layer.handle === swaggerRouter
        );

        expect(routeLayer).toBeDefined();

        expect(typeof routeLayer.handle).toBe('function');

        expect(routeLayer.handle).toBe(swaggerRouter);
    });


    // Test the /users route
    it('should map /users route correctly', () => {
        const routeLayer = indexRoutes.stack.find(
            layer => layer.handle === usersRouter
        );

        expect(routeLayer).toBeDefined();

        expect(typeof routeLayer.handle).toBe('function');

        expect(routeLayer.handle).toBe(usersRouter);
    });    

    // Test the /characters route
    it('should map /characters route correctly', () => {
        const routeLayer = indexRoutes.stack.find(
            layer => layer.handle === charactersRouter
        );

        expect(routeLayer).toBeDefined();

        expect(typeof routeLayer.handle).toBe('function');

        expect(routeLayer.handle).toBe(charactersRouter);
    });    

    // Test the /quotes route
    it('should map /quotes route correctly', () => {
        const routeLayer = indexRoutes.stack.find(
            layer => layer.handle === quotesRouter
        );

        expect(routeLayer).toBeDefined();

        expect(typeof routeLayer.handle).toBe('function');

        expect(routeLayer.handle).toBe(quotesRouter);
    });    

    // Test the /images route
    it('should map /images route correctly', () => {
        const routeLayer = indexRoutes.stack.find(
            layer => layer.handle === imagesRouter
        );

        expect(routeLayer).toBeDefined();

        expect(typeof routeLayer.handle).toBe('function');

        expect(routeLayer.handle).toBe(imagesRouter);
    });    
});