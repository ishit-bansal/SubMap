/*
 * popular subscription presets
 * prices are US monthly rates as of late 2024
 * these will definitely go out of date but gives users a starting point
 */
const presets = [

  // streaming services - everyone has like 5 of these now
  { name: "Netflix", domain: "netflix.com", price: 17.99, cycle: "Monthly", color: "rose", category: "Streaming", popular: true },
  { name: "Disney+", domain: "disneyplus.com", price: 15.99, cycle: "Monthly", color: "blue", category: "Streaming", popular: true },
  { name: "Max", domain: "max.com", price: 18.49, cycle: "Monthly", color: "purple", category: "Streaming" }, // was HBO Max
  { name: "Hulu", domain: "hulu.com", price: 9.99, cycle: "Monthly", color: "green", category: "Streaming" },
  { name: "Apple TV+", domain: "tv.apple.com", price: 9.99, cycle: "Monthly", color: "slate", category: "Streaming" },
  { name: "Paramount+", domain: "paramountplus.com", price: 7.99, cycle: "Monthly", color: "blue", category: "Streaming" },
  { name: "Peacock", domain: "peacocktv.com", price: 7.99, cycle: "Monthly", color: "purple", category: "Streaming" },
  { name: "Amazon Prime", domain: "amazon.com", price: 14.99, cycle: "Monthly", color: "orange", category: "Streaming", popular: true },
  { name: "Crunchyroll", domain: "crunchyroll.com", price: 7.99, cycle: "Monthly", color: "orange", category: "Streaming" },

  // music
  { name: "Spotify", domain: "spotify.com", price: 11.99, cycle: "Monthly", color: "green", category: "Music", popular: true },
  { name: "Apple Music", domain: "music.apple.com", price: 10.99, cycle: "Monthly", color: "pink", category: "Music" },
  { name: "YouTube Premium", domain: "youtube.com", price: 13.99, cycle: "Monthly", color: "rose", category: "Music", popular: true },
  { name: "Audible", domain: "audible.com", price: 14.95, cycle: "Monthly", color: "orange", category: "Music" },

  // gaming subscriptions
  { name: "Xbox Game Pass", domain: "xbox.com", price: 19.99, cycle: "Monthly", color: "green", category: "Gaming" },
  { name: "PlayStation Plus", domain: "playstation.com", price: 14.99, cycle: "Monthly", color: "blue", category: "Gaming" },
  { name: "Nintendo Switch Online", domain: "nintendo.com", price: 3.99, cycle: "Monthly", color: "rose", category: "Gaming" },
  { name: "EA Play", domain: "ea.com", price: 5.99, cycle: "Monthly", color: "blue", category: "Gaming" },

  // ai tools - these are getting expensive
  { name: "ChatGPT Plus", domain: "openai.com", price: 20, cycle: "Monthly", color: "teal", category: "AI", popular: true },
  { name: "Claude Pro", domain: "claude.ai", price: 20, cycle: "Monthly", color: "orange", category: "AI" },
  { name: "Midjourney", domain: "midjourney.com", price: 10, cycle: "Monthly", color: "indigo", category: "AI" },
  { name: "GitHub Copilot", domain: "github.com", price: 10, cycle: "Monthly", color: "slate", category: "AI" },

  // productivity
  { name: "Microsoft 365", domain: "microsoft.com", price: 9.99, cycle: "Monthly", color: "blue", category: "Productivity" },
  { name: "Notion", domain: "notion.so", price: 12, cycle: "Monthly", color: "slate", category: "Productivity" },
  { name: "Slack", domain: "slack.com", price: 8.75, cycle: "Monthly", color: "purple", category: "Productivity" },
  { name: "Linear", domain: "linear.app", price: 10, cycle: "Monthly", color: "indigo", category: "Productivity" },
  { name: "Canva Pro", domain: "canva.com", price: 15, cycle: "Monthly", color: "cyan", category: "Productivity" },
  { name: "Figma", domain: "figma.com", price: 15, cycle: "Monthly", color: "purple", category: "Productivity" },
  { name: "Adobe Creative Cloud", domain: "adobe.com", price: 59.99, cycle: "Monthly", color: "rose", category: "Productivity" }, // ouch

  // cloud storage
  { name: "iCloud+", domain: "icloud.com", price: 2.99, cycle: "Monthly", color: "blue", category: "Cloud" },
  { name: "Google One", domain: "one.google.com", price: 2.99, cycle: "Monthly", color: "cyan", category: "Cloud" },
  { name: "Dropbox", domain: "dropbox.com", price: 11.99, cycle: "Monthly", color: "blue", category: "Cloud" },

  // vpn / security
  { name: "NordVPN", domain: "nordvpn.com", price: 12.99, cycle: "Monthly", color: "indigo", category: "Security" },
  { name: "ExpressVPN", domain: "expressvpn.com", price: 12.95, cycle: "Monthly", color: "rose", category: "Security" },
  { name: "1Password", domain: "1password.com", price: 2.99, cycle: "Monthly", color: "blue", category: "Security" },

  // fitness
  { name: "Peloton", domain: "onepeloton.com", price: 12.99, cycle: "Monthly", color: "rose", category: "Fitness" },
  { name: "Apple Fitness+", domain: "fitness.apple.com", price: 9.99, cycle: "Monthly", color: "pink", category: "Fitness" },
  { name: "Strava", domain: "strava.com", price: 11.99, cycle: "Monthly", color: "orange", category: "Fitness" },

  // news / reading
  { name: "The Athletic", domain: "theathletic.com", price: 9.99, cycle: "Monthly", color: "slate", category: "News" },
  { name: "Kindle Unlimited", domain: "amazon.com/kindle", price: 11.99, cycle: "Monthly", color: "orange", category: "News" },
  { name: "Medium", domain: "medium.com", price: 5, cycle: "Monthly", color: "slate", category: "News" },

  // learning platforms
  { name: "Duolingo", domain: "duolingo.com", price: 12.99, cycle: "Monthly", color: "green", category: "Learning" },
  { name: "Skillshare", domain: "skillshare.com", price: 13.99, cycle: "Monthly", color: "teal", category: "Learning" },
  { name: "Coursera Plus", domain: "coursera.org", price: 59, cycle: "Monthly", color: "blue", category: "Learning" }
];

function getCategories() {
  const cats = [];
  for (let i = 0; i < presets.length; i++) {
    const cat = presets[i].category;
    if (cats.indexOf(cat) === -1) {
      cats.push(cat);
    }
  }
  return cats;
}
