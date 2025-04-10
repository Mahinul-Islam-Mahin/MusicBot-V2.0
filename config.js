require('dotenv').config();

const config = {
  prefix: '=',
  nodes: [
    {
      host: 'lavalink.jirayu.net',
      password: 'youshallnotpass',
      port: 13592,
      secure: false,
      name: 'Main Node',
    },
  ],
  spotify: {
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  },
  botToken: process.env.BOT_TOKEN,
  embedColor: '#0061ff',
};

module.exports = config;
