const axios = require('axios');

module.exports = {
  name: 'lyrics',
  description: 'Fetch the lyrics of a song',
  async execute(message, args) {
    if (!args.length) {
      return message.reply('❌ Please provide a song name!');
    }

    const query = args.join(' ');
    try {
      message.channel.send(`🔍 Searching for lyrics of "${query}"...`);

      const response = await axios.get(`https://api.lyrics.ovh/v1/${query}`);
      if (response.data && response.data.lyrics) {
        const lyrics = response.data.lyrics;

        // Split lyrics into chunks of 2000 characters (Discord message limit)
        const chunks = [];
        let currentChunk = `📝 **Lyrics for ${query}:**\n\n`;

        const lines = lyrics.split('\n');
        for (const line of lines) {
          if (currentChunk.length + line.length + 2 > 2000) {
            chunks.push(currentChunk);
            currentChunk = line + '\n';
          } else {
            currentChunk += line + '\n';
          }
        }
        chunks.push(currentChunk);

        // Send lyrics in multiple messages if needed
        for (const chunk of chunks) {
          await message.channel.send(chunk);
        }
      } else {
        message.reply(
          '❌ Lyrics not found! Please check the song name and try again.'
        );
      }
    } catch (error) {
      console.error('Error in lyrics command:', error);
      if (error.response && error.response.status === 404) {
        message.reply(
          '❌ Lyrics not found! Please check the song name and try again.'
        );
      } else {
        message.reply(
          '❌ An error occurred while fetching the lyrics. Please try again later.'
        );
      }
    }
  },
};
