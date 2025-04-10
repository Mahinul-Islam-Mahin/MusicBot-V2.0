# Flynn Discord Bot Commands

Welcome to Flynn Discord Bot! Below is a comprehensive list of available
commands and their usage.

## Music Commands

### !play <name/url>

**Description:** Play a song from YouTube, Spotify, or other supported sources
**Usage:** `!play <song name or URL>` **Examples:**

- `!play Despacito`
- `!play https://www.youtube.com/watch?v=...` **Cooldown:** 3 seconds

### !help

**Description:** Shows all bot commands and features **Usage:**
`!help [command]` **Examples:**

- `!help` - Shows all commands
- `!help play` - Shows detailed info about the play command

### !lyrics

**Description:** Display lyrics for the currently playing song **Usage:**
`!lyrics` **Cooldown:** 5 seconds

### !save

**Description:** Save the current song to your playlist **Usage:**
`!save [playlist name]` **Examples:**

- `!save` - Saves to default playlist
- `!save favorites`

### !load

**Description:** Load a saved playlist **Usage:** `!load <playlist name>`
**Example:** `!load favorites`

## Audio Effects

### !effects

**Description:** Apply audio effects to the current playback **Usage:**
`!effects <effect name>` **Available Effects:**

- bass (Bass boost)
- nightcore
- 8D
- vaporwave **Example:** `!effects bass`

### !audioeffects

**Description:** Manage advanced audio effects settings **Usage:**
`!audioeffects <setting> <value>` **Examples:**

- `!audioeffects bass 150%`
- `!audioeffects reset`

### !boost

**Description:** Enhance the audio quality **Usage:** `!boost <level>`
**Levels:** low, medium, high **Example:** `!boost high`

## Playlist Management

### !playlist

**Description:** Manage your saved playlists **Usage:** `!playlist <action>`
**Actions:**

- list - Show all playlists
- create <name>
- delete <name>
- view <name> **Examples:**
- `!playlist list`
- `!playlist create favorites`

### !premiumqueue

**Description:** Access premium queue features (Premium Only) **Usage:**
`!premiumqueue <action>` **Actions:**

- shuffle
- save
- load

## Utility Commands

### !utility

**Description:** Access utility features **Usage:** `!utility <feature>`
**Features:**

- stats - Show bot statistics
- ping - Check bot latency
- invite - Get bot invite link

### !serverlist

**Description:** View list of servers the bot is in **Permission Required:**
Server Administrator **Usage:** `!serverlist`

### !setstatus

**Description:** Set bot status **Permission Required:** Bot Administrator
**Usage:** `!setstatus <status>` **Example:** `!setstatus listening to music`

## Premium Features

### !premiumcheck

**Description:** Check premium status **Usage:** `!premiumcheck`

### !purchase

**Description:** Get information about premium features **Usage:** `!purchase`
**Features Included:**

- Higher audio quality
- Extended playlist limits
- Advanced audio effects
- Premium queue management

For more detailed information about any command, use `!help <command>`

Note: All commands have a default cooldown of 3 seconds unless specified
otherwise. Premium users enjoy reduced cooldowns and additional features.
