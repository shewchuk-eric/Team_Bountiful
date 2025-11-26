const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'Book of Mormon Characters API',
    description: 'A searchable database of characters found in the Book of Mormon.',
  },
  /* "host": "team-bountiful.onrender.com",
  "servers": [
    {
      "url": "team-bountiful.onrender.com",
      "description": "Render site",
      "schemes": ["https"]
    },
    {
      "url": "localhost:3000",
      "description": "Localhost",
      "schemes": ["http"]
    }
  ], */
  host: 'team-bountiful.onrender.com',
  schemes: ['https', 'http'],
  // servers: [
  //   {
  //     url: 'https://team-bountiful.onrender.com',
  //     description: 'Render site',
  //     schemes: ['https']
  //   },
  //   {
  //     url: 'http://localhost:3000',
  //     description: 'Localhost',
  //     schemes: ['http']
  //   }
  // ],
  definitions: {
    Character: {
      _id: '6912970eb69127d1966091e3',
      characterName: 'Nephi',
      firstBookSeen: '1 Nephi',
      firstVerseSeen: '1:1',
      quality: 'Hero',
      notes: 'Son of Lehi. Righteous and knows his father to be a true prophet. Repeatedly calls upon the Lord for wisdom and knowledge. Builds the boat that brings his family to the new lands. During the time in the wilderness, he marries and has children. The name of his wife, the name and number of his children, is never given.'
    },
    Image: {
      characterId: '6912970eb69127d1966091e3',
      characterName: 'Nephi',
      bookWhereSeen: '1 Nephi',
      characterQuality: 'Hero',
      filename: 'nephi_donkey.jpeg',
      caption: 'Nephi has a donkey',
      description: 'An image of Nephi with a donkey. Image from the Book of Mormon Videos and Images collection on churchofjesuschrist.org',
      source: 'https://www.churchofjesuschrist.org/media/collection/1-nephi-1-2-images?lang=eng'      
    },
    Quote: {
      characterId: '**id**',
      characterName: 'Nephi',
      bookName: '1 Nephi',
      verse: '3:7',
      characterQuality: 'Hero',
      text: 'I will go and do the things which the Lord hath commanded.'     
    }
  }
};

const outputFile = './swagger.json';
const routes = ['./routes/index.js'];


swaggerAutogen(outputFile, routes, doc);

/*host: 'localhost:3000', // Local development = 'localhost:3000' Remote =  'team-bountiful.onrender.com'
  schemes: ['http'], // Local development = 'http' Remote = 'https'*/