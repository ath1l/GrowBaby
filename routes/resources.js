const express = require('express');
const router = express.Router();
const Baby = require('../models/Baby');
const ytSearch = require('yt-search');
const RSSParser = require('rss-parser');
const rssParser = new RSSParser(); 


// List of feeds
const feeds = [
  'https://www.sciencedaily.com/rss/parenting.xml',
  'https://www.healthychildren.org/English/Pages/rss.aspx',
  'https://www.mother.ly/feed/',
  'https://wehavekids.com/.rss/full/'
];


// Helper: YouTube search for videos
async function getVideos(ageMonths) {
  const searchTerm = `parenting tips for ${ageMonths} month old baby`;
  const ytResults = await ytSearch(searchTerm);
  return ytResults.videos.slice(0, 6).map(video => ({
    title: video.title,
    description: video.description || "No description available",
    link: video.url
  }));
}

// Helper: Fetch latest RSS articles
async function getArticles() {
  let articles = [];

  for (const feed of feeds) {
    try {
      const parsed = await rssParser.parseURL(feed);
      articles = articles.concat(
        parsed.items.map(item => ({
          title: item.title,
          description: item.contentSnippet || item.title,
          link: item.link
        }))
      );
    } catch (err) {
      console.error(`Error fetching feed ${feed}:`, err.message);
    }
  }

  return articles.sort(() => 0.5 - Math.random()).slice(0, 6);
}

router.get('/resources', async (req, res) => {
  try {
    const baby = await Baby.findOne();
    let ageMonths = 0;

    if (baby) {
      const dob = new Date(baby.dob);
      const today = new Date();
      ageMonths =
        (today.getFullYear() - dob.getFullYear()) * 12 +
        (today.getMonth() - dob.getMonth());
    }

    const [videos, articles] = await Promise.all([
      getVideos(ageMonths),
      getArticles()
    ]);

    res.render('resources', { resources: { videos, articles }, ageMonths });

  } catch (err) {
    console.error('Error fetching resources:', err);
    res.render('resources', {
      resources: { videos: [], articles: [] },
      ageMonths: 0
    });
  }
});

module.exports = router;
