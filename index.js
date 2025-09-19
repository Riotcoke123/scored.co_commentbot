require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// --- CONFIGURATION ---
const {
    X_API_KEY,
    X_API_PLATFORM,
    X_API_SECRET,
    X_XSRF_TOKEN,
    USER_AGENT,
    REFERER,
    COMMUNITY,
    POLL_INTERVAL_MS,
    DELAY_BETWEEN_COMMENTS_MS
} = process.env;

// --- VALIDATION ---
const requiredEnv = ['X_API_KEY', 'X_API_PLATFORM', 'X_API_SECRET', 'X_XSRF_TOKEN', 'COMMUNITY'];
for (const key of requiredEnv) {
    if (!process.env[key]) {
        console.error(`❌ FATAL ERROR: Missing required environment variable: ${key}`);
        process.exit(1);
    }
}

// --- CONSTANTS ---
const API_BASE_URL = 'https://scored.co/api/v2';
const PROCESSED_POSTS_PATH = path.join(__dirname, 'processed_posts.json');
const COMMENTS_PATH = path.join(__dirname, 'comments.txt');

// --- HELPER FUNCTIONS ---

function loadProcessedPosts() {
    try {
        if (fs.existsSync(PROCESSED_POSTS_PATH)) {
            const data = fs.readFileSync(PROCESSED_POSTS_PATH, 'utf8');
            return new Set(JSON.parse(data));
        }
    } catch (error) {
        console.error('⚠️ Could not read processed_posts.json. Starting fresh.', error);
    }
    return new Set();
}

function saveProcessedPost(postId, processedPostsSet) {
    processedPostsSet.add(postId);
    fs.writeFileSync(PROCESSED_POSTS_PATH, JSON.stringify(Array.from(processedPostsSet), null, 2));
}

function loadComments() {
    try {
        const comments = fs.readFileSync(COMMENTS_PATH, 'utf8')
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0);
        if (comments.length === 0) {
            console.error('❌ FATAL ERROR: comments.txt is empty. Please add comments to it.');
            process.exit(1);
        }
        return comments;
    } catch (error) {
        console.error('❌ FATAL ERROR: Could not read comments.txt.', error);
        process.exit(1);
    }
}

function getRandomComment(commentsArray) {
    return commentsArray[Math.floor(Math.random() * commentsArray.length)];
}

// --- API FUNCTIONS ---

async function fetchNewPosts() {
    const url = `${API_BASE_URL}/post/newv2.json?community=${COMMUNITY}`;
    console.log(`📡 Fetching new posts from community: ${COMMUNITY}...`);
    try {
        const response = await axios.get(url, {
            headers: {
                'x-api-key': X_API_KEY,
                'x-api-platform': X_API_PLATFORM,
                'x-api-secret': X_API_SECRET,
                'x-xsrf-token': X_XSRF_TOKEN,
                'user-agent': USER_AGENT,
                'referer': REFERER,
                'sec-ch-ua': '"Chromium";v="140", "Not=A?Brand";v="24", "Google Chrome";v="140"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
            }
        });
        return Array.isArray(response.data) ? response.data : response.data.posts || [];
    } catch (error) {
        console.error('❌ Error fetching posts:', error.response?.data || error.message);
        return [];
    }
}

async function postComment(postId, commentContent) {
    const url = `${API_BASE_URL}/action/create_comment`;
    const params = new URLSearchParams({
        content: commentContent,
        parentId: postId,
        commentParentId: "0",
        community: COMMUNITY,
    });

    console.log(`💬 Posting comment to post ${postId}: "${commentContent}"`);
    try {
        const response = await axios.post(url, params.toString(), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'x-api-key': X_API_KEY,
                'x-api-platform': X_API_PLATFORM,
                'x-api-secret': X_API_SECRET,
                'x-xsrf-token': X_XSRF_TOKEN,
                'user-agent': USER_AGENT,
                'referer': `${REFERER}c/${COMMUNITY}/${postId}`,
            }
        });

        // <<< --- THIS IS THE FIX --- >>>
        // The API returns 'status: true' on success, not 'success: true'.
        if (response.data?.status === true) {
            console.log(`✅ Successfully commented on post ${postId}!`);
        } else {
            console.error(`❌ Failed to comment on post ${postId}. Response:`, response.data);
        }
    } catch (error) {
        console.error(`❌ Error posting comment to ${postId}:`, error.response?.data || error.message);
    }
}

// --- MAIN LOGIC ---

async function runBot() {
    console.log('\n=====================================');
    console.log(`🤖 Starting bot run at ${new Date().toLocaleString()}`);

    const comments = loadComments();
    const processedPosts = loadProcessedPosts();
    const newPosts = await fetchNewPosts();

    if (!newPosts || newPosts.length === 0) {
        console.log('No new posts found.');
        return;
    }

    const postsToCommentOn = newPosts.filter(post => !processedPosts.has(post.id));

    if (postsToCommentOn.length === 0) {
        console.log('All fetched posts have already been processed.');
    } else {
        console.log(`Found ${postsToCommentOn.length} new post(s) to process.`);
        for (const post of postsToCommentOn.reverse()) {
            const randomComment = getRandomComment(comments);
            await postComment(post.id, randomComment);
            saveProcessedPost(post.id, processedPosts);
            await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_COMMENTS_MS || 3000));
        }
    }
    console.log('✅ Bot run finished.');
}

// --- START THE BOT ---
runBot();
setInterval(runBot, POLL_INTERVAL_MS || 300000);

console.log(`🚀 Scored Comment Bot has started.`);
console.log(`Watching community "${COMMUNITY}" every ${parseInt(POLL_INTERVAL_MS || 300000) / 1000 / 60} minutes.`);