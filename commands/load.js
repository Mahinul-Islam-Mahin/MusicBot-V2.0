const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'load',
  description: 'Load a saved playlist',
  async execute(message, args) {
    if (!args.length) {
      return message.reply(
        '❌ Please provide the name of the playlist to load!'
      );
    }

    const playlistName = args.join(' ');
    const userId = message.author.id;
    const playlistsDir = path.join(__dirname, '../playlists');
    const userPlaylistsDir = path.join(playlistsDir, userId);
    const playlistPath = path.join(userPlaylistsDir, `${playlistName}.json`);

    if (!fs.existsSync(playlistPath)) {
      return message.reply(`❌ Playlist "${playlistName}" not found!`);
    }

    try {
      const playlistData = JSON.parse(fs.readFileSync(playlistPath, 'utf8'));
      const queue = message.client.queue.get(message.guild.id);

      if (!queue) {
        return message.reply(
          '❌ Please join a voice channel and start playing music first!'
        );
      }

      // Add songs to the queue
      queue.songs.push(...playlistData.songs);

      message.reply(
        `✅ Successfully loaded playlist: ${playlistName}\nAdded ${playlistData.songs.length} songs to the queue!`
      );
    } catch (error) {
      console.error('Error loading playlist:', error);
      message.reply('❌ An error occurred while loading the playlist.');
    }
  },
};
