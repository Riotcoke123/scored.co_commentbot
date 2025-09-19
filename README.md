
<body>
  <h1>🤖 Scored.co Comment Bot</h1>
  <p>
    A Node.js bot that automatically comments on new posts in a 
    <strong><a href="https://scored.co/" target="_blank">Scored.co</a></strong> community using predefined comments.  
    It fetches new posts at regular intervals, selects a random comment, and posts it.
  </p>

  <h2>🌐 Resources</h2>
  <ul>
    <li><a href="https://scored.co/" target="_blank">Scored.co Website</a></li>
    <li><a href="https://docs.scored.co/" target="_blank">Scored.co API Documentation</a></li>
  </ul>

  <h2>🚀 Features</h2>
  <ul>
    <li>Fetches new posts from a given <code>COMMUNITY</code>.</li>
    <li>Randomly selects a comment from <code>comments.txt</code>.</li>
    <li>Ensures posts are only processed once (tracked via <code>processed_posts.json</code>).</li>
    <li>Configurable polling interval and comment delay.</li>
  </ul>

  <h2>📦 Installation</h2>
  <pre>
git clone https://github.com/Riotcoke123/scored.co_commentbot.git
cd scored.co_commentbot
npm install
  </pre>

  <h2>⚙️ Configuration</h2>
  <p>Create a <code>.env</code> file in the root directory with the following variables:</p>
  <pre>
X_API_KEY=your_api_key
X_API_PLATFORM=your_api_platform
X_API_SECRET=your_api_secret
X_XSRF_TOKEN=your_xsrf_token
USER_AGENT=your_user_agent
REFERER=https://scored.co/
COMMUNITY=community_name
POLL_INTERVAL_MS=300000
DELAY_BETWEEN_COMMENTS_MS=3000
  </pre>
  <ul>
    <li><strong>POLL_INTERVAL_MS</strong> – Time between bot runs (default: 5 minutes).</li>
    <li><strong>DELAY_BETWEEN_COMMENTS_MS</strong> – Delay between posting comments (default: 3 seconds).</li>
  </ul>

  <h2>💬 Adding Comments</h2>
  <p>
    Add your desired comments (one per line) into 
    <code>comments.txt</code>.  
    The bot will randomly choose one for each post.
  </p>

  <h2>▶️ Usage</h2>
  <pre>
node index.js
  </pre>
  <p>
    The bot will then monitor the specified community and comment on new posts.
  </p>

  <h2>📂 Files</h2>
  <ul>
    <li><code>index.js</code> – Main bot logic.</li>
    <li><code>comments.txt</code> – Contains the pool of possible comments.</li>
    <li><code>processed_posts.json</code> – Keeps track of already-commented posts.</li>
    <li><code>.env</code> – Configuration file (not committed).</li>
  </ul>

  <h2>⚠️ Notes</h2>
  <ul>
    <li>Make sure <code>comments.txt</code> is not empty, otherwise the bot will fail.</li>
    <li>Use valid API keys and tokens from Scored.co.</li>
    <li>Do not abuse this tool. Excessive automated commenting may violate community rules.</li>
  </ul>

  <h2>📜 License</h2>
  <p>
    This project is licensed under the 
    <a href="https://www.gnu.org/licenses/gpl-3.0.en.html" target="_blank">GNU General Public License v3.0</a>.  
    You are free to use, modify, and distribute this software under the terms of the GPLv3.
  </p>
</body>
</html>
