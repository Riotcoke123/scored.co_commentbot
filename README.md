<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Scored.co Comment Bot</title>
</head>
<body>
    <h1>Scored.co Comment Bot</h1>
    <p>A Node.js bot for automatically commenting on new posts in specified Scored.co communities.</p>
    <h2>License</h2>
    <p>This project is licensed under the <strong>GNU General Public License v3.0</strong>. You are free to use, modify, and distribute this software under the terms of the GPLv3.</p>
    <h2>Features</h2>
    <ul>
        <li>Automatically fetches new posts from specified communities.</li>
        <li>Posts randomized comments from a predefined list.</li>
        <li>Keeps track of processed posts to avoid duplicate comments.</li>
        <li>Configurable polling interval and delay between comments.</li>
    </ul>
    <h2>Installation</h2>
    <pre><code>git clone https://github.com/Riotcoke123/scored.co_commentbot.git
cd scored.co_commentbot
npm install
</code></pre>

    <h2>Configuration</h2>
    <p>Create a <code>.env</code> file in the project root with the following variables:</p>
    <pre><code>X_API_KEY=your_api_key
X_API_PLATFORM=your_platform
X_API_SECRET=your_api_secret
X_XSRF_TOKEN=your_xsrf_token
USER_AGENT=your_user_agent
REFERER=https://scored.co
COMMUNITY=community1,community2
POLL_INTERVAL_MS=300000
DELAY_BETWEEN_COMMENTS_MS=3000
</code></pre>
    <p>Also, add comments to <code>comments.txt</code>, one comment per line.</p>
    <h2>Usage</h2>
    <pre><code>node index.js</code></pre>
    <p>The bot will start running and automatically check for new posts at the configured interval.</p>
    <h2>File Structure</h2>
    <ul>
        <li><code>index.js</code> - Main bot logic</li>
        <li><code>comments.txt</code> - List of comments to post</li>
        <li><code>processed_posts.json</code> - Keeps track of posts the bot has already commented on</li>
        <li><code>.env</code> - Environment configuration</li>
    </ul>
    <h2>Dependencies</h2>
    <ul>
        <li><code>axios</code> - HTTP client for API requests</li>
        <li><code>dotenv</code> - Loads environment variables</li>
        <li><code>fs</code> and <code>path</code> - Node.js file system utilities</li>
    </ul>
    <h2>How It Works</h2>
    <ol>
        <li>Load environment variables and validate required config.</li>
        <li>Load processed posts from <code>processed_posts.json</code>.</li>
        <li>Load comments from <code>comments.txt</code> and shuffle them.</li>
        <li>Fetch new posts from specified communities via Scored.co API.</li>
        <li>Post a random comment to each new post.</li>
        <li>Save the post to <code>processed_posts.json</code> to prevent duplicates.</li>
        <li>Repeat at the interval specified in <code>POLL_INTERVAL_MS</code>.</li>
    </ol>
    <h2>Important Notes</h2>
    <ul>
        <li>Ensure <code>comments.txt</code> is not empty; the bot will exit otherwise.</li>
        <li>Missing environment variables will cause the bot to stop immediately.</li>
        <li>Be respectful of community guidelines to avoid spamming.</li>
    </ul>
    <h2>Contributing</h2>
    <p>Feel free to fork the project and submit pull requests. Make sure your contributions follow the GPLv3 license.</p>

