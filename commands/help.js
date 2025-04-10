const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  SelectMenuBuilder,
} = require('discord.js');

module.exports = {
  name: 'help',
  description: 'Shows all bot commands and features',
  usage: '=help',
  execute(message, args, client) {
    const { commands } = client;

    if (args.length) {
      const commandName = args[0].toLowerCase();
      const command =
        commands.get(commandName) ||
        commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

      if (!command) {
        return message.channel.send(`❌ Command \`${commandName}\` not found.`);
      }

      const embed = new EmbedBuilder()
        .setTitle(`Help: ${command.name}`)
        .setDescription(command.description || 'No description available.')
        .addFields([
          {
            name: 'Usage',
            value: `\`${command.usage || 'No usage available.'}\``,
            inline: false,
          },
        ])
        .setColor('#1DB954');

      return message.channel.send({ embeds: [embed] });
    }

    const embed = new EmbedBuilder()
      .setColor('#7289DA')
      .setTitle('Flynn Music Help Menu!')
      .setDescription(
        'A Next-Generation Discord Music Bot With Many Awesome Features,\nButtons, Menus, a Context Menu, Support for Many Sources, and\nCustomizable Settings.'
      )
      .addFields([
        {
          name: '<a:hashtag:1075676228100571136> How to Seen Help?',
          value: '`=help`',
          inline: false,
        },
        {
          name: '<a:Music:1355166373344444578> How to play music?',
          value: '`!play <name/url>`',
          inline: false,
        },
        {
          name: '<a:info:1078548574335418539> What is Flynn Music™?',
          value:
            'A Next-Generation Discord Music Bot With Many Awesome Features,\nButtons, Menus, a Context Menu, Support for Many Sources, and\nCustomizable Settings.',
          inline: false,
        },
        {
          name: '📋 Command Categories:',
          value:
            '🏠 Home - Back To Help Menu\n🎵 Music - Music Commands\n🎮 Filters - Audio Filter Commands\nℹ️ Information - Bot Information\n<:utility:1125860506968789023> Settings - Bot Settings\n✨ Premium - Premium Features\n📋 Playlist - Playlist Management',
          inline: false,
        },
      ])
      .setImage(
        'https://cdn.discordapp.com/attachments/1269793997925253172/1355170139708067952/Purple_And_Pink_Creative_Pixelated_Game_Start_Discord_Profile_Banner.gif?ex=67e7f40b&is=67e6a28b&hm=41e1d6c8f077e28d47e13a7af08cf133ebe3786400e0e867862a1ec1773ee75e&'
      )
      .setFooter({
        text: `Flynn™ Music Total Commands: ${
          commands.size
        } • Today at ${new Date().toLocaleTimeString()}`,
      });

    const row1 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('support')
        .setLabel('Support')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('🔧'),
      new ButtonBuilder()
        .setURL(
          'https://discord.com/oauth2/authorize?client_id=968780014608867369&permissions=1166571137269568&integration_type=0&scope=bot'
        )
        .setLabel('Invite')
        .setStyle(ButtonStyle.Link)
        .setEmoji('📨'),
      new ButtonBuilder()
        .setCustomId('vote')
        .setLabel('Vote')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('⬆️'),
      new ButtonBuilder()
        .setCustomId('premium')
        .setLabel('Premium')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('✨')
    );

    const row2 = new ActionRowBuilder().addComponents(
      new SelectMenuBuilder()
        .setCustomId('help_category')
        .setPlaceholder('Select Menu Category Commands')
        .addOptions([
          {
            label: 'Home',
            description: 'Back To Help Menu',
            value: 'home',
            emoji: '<a:ddev:1075672651663671326>',
          },
          {
            label: 'Music',
            description: 'Music Commands',
            value: 'music',
            emoji: '<a:Music:1355166373344444578>',
          },
          {
            label: 'Filters',
            description: 'Audio Filter Commands',
            value: 'filters',
            emoji: '<a:a_Filter:1078863818807066644>',
          },
          {
            label: 'Information',
            description: 'Bot Information',
            value: 'info',
            emoji: '<a:info:1078548574335418539>',
          },
          {
            label: 'Settings',
            description: 'Bot Settings',
            value: 'settings',
            emoji: '<:utility:1125860506968789023>',
          },
          {
            label: 'Premium',
            description: 'Premium Features',
            value: 'premium',
            emoji: '✨',
          },
          {
            label: 'Playlist',
            description: 'Playlist Management',
            value: 'playlist',
            emoji: '📋',
          },
        ])
    );

    message.channel.send({ embeds: [embed], components: [row1, row2] });
  },
};
