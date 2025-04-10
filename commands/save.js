const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'save',
  description: 'Save current queue as a playlist',
  async execute(message, args) {
    if (!args.length) {
      return message.reply('❌ Please provide a name for your playlist!');
    }

    const playlistName = args.join(' ');
    const userId = message.author.id;
    const queue = message.client.queue.get(message.guild.id);

    if (!queue || !queue.songs.length) {
      return message.reply('❌ There are no songs in the queue to save!');
    }

    const playlistsDir = path.join(__dirname, '../playlists');
    if (!fs.existsSync(playlistsDir)) {
      fs.mkdirSync(playlistsDir, { recursive: true });
    }

    const userPlaylistsDir = path.join(playlistsDir, userId);
    if (!fs.existsSync(userPlaylistsDir)) {
      fs.mkdirSync(userPlaylistsDir, { recursive: true });
    }

    const playlistPath = path.join(userPlaylistsDir, `${playlistName}.json`);

    try {
      // Save only necessary song information
      const playlistData = {
        name: playlistName,
        songs: queue.songs.map(song => ({
          title: song.title,
          url: song.url,
          duration: song.duration,
          thumbnail: song.thumbnail,
        })),
      };

      fs.writeFileSync(playlistPath, JSON.stringify(playlistData, null, 2));
      message.reply(`✅ Successfully saved playlist: ${playlistName}`);
    } catch (error) {
      console.error('Error saving playlist:', error);
      message.reply('❌ An error occurred while saving the playlist.');
    }
  },
};
