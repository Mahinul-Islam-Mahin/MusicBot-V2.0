const { isPremiumUser } = require('../premiumFeatures');

module.exports = {
  name: 'premiumqueue',
  description: 'Premium users can queue unlimited songs with advanced controls',
  async execute(message, args) {
    const userId = message.author.id;

    if (!isPremiumUser(userId)) {
      return message.reply(
        '❌ This feature is exclusive to premium users. Use !purchase to upgrade to premium!'
      );
    }

    const queue = message.client.queue.get(message.guild.id);
    if (!queue) {
      return message.reply(
        '❌ There is no active music queue! Start playing some music first.'
      );
    }

    if (!args.length) {
      // Display current queue with advanced information
      let queueInfo = '🎵 **Premium Queue**\n\n';
      queue.songs.forEach((song, index) => {
        queueInfo += `${index + 1}. ${song.title} (${song.duration})\n`;
      });
      queueInfo += `\n📊 Total songs: ${queue.songs.length}`;

      // Split long queue messages
      if (queueInfo.length > 2000) {
        const chunks = queueInfo.match(/.{1,2000}/g);
        for (const chunk of chunks) {
          await message.channel.send(chunk);
        }
      } else {
        await message.channel.send(queueInfo);
      }
      return;
    }

    const subCommand = args[0].toLowerCase();

    switch (subCommand) {
      case 'clear':
        queue.songs = [queue.songs[0]]; // Keep current song
        message.reply('✅ Queue cleared! Only current song remains.');
        break;

      case 'remove':
        const index = parseInt(args[1]);
        if (isNaN(index) || index < 1 || index >= queue.songs.length) {
          return message.reply(
            '❌ Please provide a valid song number to remove!'
          );
        }
        const removed = queue.songs.splice(index, 1)[0];
        message.reply(`✅ Removed "${removed.title}" from the queue!`);
        break;

      case 'move':
        const from = parseInt(args[1]);
        const to = parseInt(args[2]);
        if (
          isNaN(from) ||
          isNaN(to) ||
          from < 1 ||
          to < 1 ||
          from >= queue.songs.length ||
          to >= queue.songs.length
        ) {
          return message.reply(
            '❌ Please provide valid position numbers to move songs!'
          );
        }
        const song = queue.songs.splice(from, 1)[0];
        queue.songs.splice(to, 0, song);
        message.reply(
          `✅ Moved "${song.title}" from position ${from} to ${to}!`
        );
        break;

      case 'shuffle':
        const currentSong = queue.songs[0];
        const remainingSongs = queue.songs.slice(1);
        for (let i = remainingSongs.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [remainingSongs[i], remainingSongs[j]] = [
            remainingSongs[j],
            remainingSongs[i],
          ];
        }
        queue.songs = [currentSong, ...remainingSongs];
        message.reply('✅ Queue has been shuffled!');
        break;

      default:
        message.reply(
          '❌ Available commands: clear, remove <number>, move <from> <to>, shuffle'
        );
    }
  },
};
