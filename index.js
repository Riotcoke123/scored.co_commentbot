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
const requiredEnv = ['X_API_KEY', 'X_API_PLATFORM', 'X_API_SECRET', 'X_XSRF_TOKEN', 'COMMUNITY', 'REFERER', 'USER_AGENT'];
for (const key of requiredEnv) {
    if (!process.env[key]) {
        console.error(`❌ FATAL ERROR: Missing required environment variable: ${key}`);
        process.exit(1);
    }
}

const COMMUNITIES = COMMUNITY.split(',').map(c => c.trim());

// --- CONSTANTS ---
const API_BASE_URL = 'https://api.scored.co/api/v2';
const PROCESSED_POSTS_PATH = path.join(__dirname, 'processed_posts.json');
const COMMENTS_PATH = path.join(__dirname, 'comments.txt');

// --- HELPER FUNCTIONS ---
function loadProcessedPosts() {
    let processedData = [];
    try {
        if (fs.existsSync(PROCESSED_POSTS_PATH)) {
            const fileContent = fs.readFileSync(PROCESSED_POSTS_PATH, 'utf8');
            if (fileContent) {
                processedData = JSON.parse(fileContent);
            }
        }
    } catch (error) {
        console.error('⚠️ Could not read or parse processed_posts.json. Starting fresh.', error);
        processedData = [];
    }
    const processedPostIds = new Set(processedData.map(post => post.id));
    return { processedPostIds, processedData };
}

function saveProcessedPost(postObject, processedDataArray) {
    processedDataArray.push(postObject);
    fs.writeFileSync(PROCESSED_POSTS_PATH, JSON.stringify(processedDataArray, null, 2));
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
        console.log(`🔄 Loaded ${comments.length} comments from comments.txt.`);
        return comments;
    } catch (error) {
        console.error('❌ FATAL ERROR: Could not read comments.txt.', error);
        process.exit(1);
    }
}

// --- COMMENT ROTATOR ---
let commentPool = [];

function getNextRandomComment(commentsArray) {
    // Refill and shuffle the pool if empty
    if (commentPool.length === 0) {
        commentPool = [...commentsArray];
        // Shuffle using Fisher–Yates
        for (let i = commentPool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [commentPool[i], commentPool[j]] = [commentPool[j], commentPool[i]];
        }
    }
    // Take one comment from the pool
    return commentPool.pop();
}

// --- API FUNCTIONS ---
async function fetchNewPosts(community) {
    const url = `${API_BASE_URL}/post/newv2.json?community=${community}`;
    console.log(`📡 Fetching new posts from community: ${community}...`);
    try {
        const response = await axios.get(url, {
            headers: {
                "x-api-key": X_API_KEY,
                "x-api-platform": X_API_PLATFORM,
                "x-api-secret": X_API_SECRET,
                "x-xsrf-token": X_XSRF_TOKEN,
                "user-agent": USER_AGENT,
                "referer": REFERER,
                "sec-ch-ua": '"Chromium";v="140", "Not=A?Brand";v="24", "Google Chrome";v="140"',
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": '"Windows"',
                "origin": "https://scored.co",
            },
        });
        return Array.isArray(response.data) ? response.data : response.data.posts || [];
    } catch (error) {
        console.error(`❌ Error fetching posts for ${community}:`, error.response?.data || error.message);
        return [];
    }
}

async function postComment(postId, commentContent, community) {
    const url = `${API_BASE_URL}/action/create_comment`;
    const params = new URLSearchParams({
        content: String(commentContent),
        parentId: String(postId),
        commentParentId: "0",
        community: String(community),
    });

    console.log(`💬 Posting comment to post ${postId} in ${community}: "${commentContent}"`);

    try {
        const response = await axios.post(url, params.toString(), {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "x-api-key": X_API_KEY,
                "x-api-platform": X_API_PLATFORM,
                "x-api-secret": X_API_SECRET,
                "x-xsrf-token": X_XSRF_TOKEN,
                "user-agent": USER_AGENT,
                "referer": `${REFERER.replace(/\/$/, '')}/c/${community}/${postId}`,
                "origin": "https://scored.co",
            },
        });

        if (response.data?.status === true) {
            console.log(`✅ Successfully commented on post ${postId}!`);
        } else {
            console.error(`❌ Failed to comment on post ${postId}. Response:`, response.data);
        }
    } catch (error) {
        console.error(`❌ Error posting comment to ${postId}:`, error.response?.data || error.message);
    }
}

// --- MAIN BOT LOGIC ---
async function runBot() {
    console.log('\n=====================================');
    console.log(`🤖 Starting bot run at ${new Date().toLocaleString()}`);

    const comments = loadComments();
    const { processedPostIds, processedData } = loadProcessedPosts();

    for (const community of COMMUNITIES) {
        console.log(`\n--- Processing community: ${community} ---`);

        const newPosts = await fetchNewPosts(community);
        const postsWithCommunity = newPosts.map(post => ({ ...post, community }));

        if (!postsWithCommunity || postsWithCommunity.length === 0) {
            console.log(`No new posts found for ${community}.`);
            continue;
        }

        const postsToCommentOn = postsWithCommunity.filter(post => !processedPostIds.has(post.id));

        if (postsToCommentOn.length === 0) {
            console.log(`All fetched posts for ${community} have already been processed.`);
        } else {
            console.log(`Found ${postsToCommentOn.length} new post(s) to process in ${community}.`);
            for (const post of postsToCommentOn.reverse()) {
                const randomComment = getNextRandomComment(comments);
                await postComment(post.id, randomComment, community);

                saveProcessedPost(post, processedData);

                await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_COMMENTS_MS || 3000));
            }
        }
    }

    console.log('\n✅ Bot run finished.');
}

// --- START THE BOT ---
runBot();
setInterval(runBot, POLL_INTERVAL_MS || 300000);

console.log(`🚀 Scored Comment Bot has started.`);
console.log(`Watching communities "${COMMUNITIES.join(', ')}" every ${parseInt(POLL_INTERVAL_MS || 300000) / 1000 / 60} minutes.`);
