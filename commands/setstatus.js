const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'setstatus',
  description: "Change the bot's status",
  async execute(message, args) {
    // Only allow administrators to change status
    if (!message.member.permissions.has('ADMINISTRATOR')) {
      return message.reply(
        "❌ Only administrators can change the bot's status!"
      );
    }

    const validStatuses = ['online', 'dnd', 'idle', 'invisible', 'streaming'];
    const newStatus = args[0]?.toLowerCase();

    if (!newStatus || !validStatuses.includes(newStatus)) {
      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('🤖 Bot Status Options')
        .setDescription(
          'Available status options:\n' +
            '• `online` - Shows as online\n' +
            '• `dnd` - Shows as do not disturb\n' +
            '• `idle` - Shows as idle\n' +
            '• `invisible` - Shows as offline\n' +
            '• `streaming` - Shows as streaming\n\n' +
            'Usage: !setstatus <option>'
        );
      return message.reply({ embeds: [embed] });
    }

    // Update the current status
    message.client.currentStatus = newStatus;

    const statusEmoji = {
      online: '🟢',
      dnd: '🔴',
      idle: '🟡',
      invisible: '⚫',
      streaming: '🟣',
    };

    return message.reply(
      `${statusEmoji[newStatus]} Bot status has been updated to: ${newStatus}`
    );
  },
};
