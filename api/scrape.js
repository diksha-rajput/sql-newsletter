const express = require('express');
const router = express.Router();
const axios = require('axios');
const cheerio = require('cheerio');
const Newsletter = require('../src/models/Newsletter');

// SQL interview questions sources
const SCRAPE_SOURCES = [
  {
    name: 'GeeksforGeeks SQL',
    url: 'https://www.geeksforgeeks.org/sql-interview-questions/',
    selector: '.text'
  },
  {
    name: 'InterviewBit SQL',
    url: 'https://www.interviewbit.com/sql-interview-questions/',
    selector: '.ibpage-article-content'
  },
  {
    name: 'JavaTpoint SQL',
    url: 'https://www.javatpoint.com/sql-interview-questions',
    selector: '.onlycontentcenter'
  }
];

// Scrape SQL content
router.post('/sql-content', async (req, res) => {
  try {
    const scrapedContent = [];

    for (const source of SCRAPE_SOURCES) {
      try {
        const response = await axios.get(source.url, {
          timeout: 10000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });

        const $ = cheerio.load(response.data);
        const content = $(source.selector).first().text().trim();

        if (content && content.length > 200) {
          scrapedContent.push({
            source: source.name,
            content: content.substring(0, 1000) + '...',
            url: source.url,
            scrapedAt: new Date()
          });
        }
      } catch (error) {
        console.error(`Failed to scrape ${source.name}:`, error.message);
        scrapedContent.push({
          source: source.name,
          error: error.message,
          scrapedAt: new Date()
        });
      }
    }

    // Generate newsletter content from scraped data
    const validContent = scrapedContent.filter(item => !item.error);

    if (validContent.length > 0) {
      const title = `Daily SQL Interview Tips - ${new Date().toLocaleDateString()}`;
      const content = validContent.map((item, index) => 
        `## Tip ${index + 1}: From ${item.source}\n\n${item.content}\n\n[Read more](${item.url})`
      ).join('\n\n---\n\n');

      const htmlContent = `
        <h2>${title}</h2>
        ${validContent.map((item, index) => `
          <div style="margin-bottom: 30px; padding: 20px; border-left: 4px solid #007acc;">
            <h3>Tip ${index + 1}: From ${item.source}</h3>
            <p>${item.content.replace(/\n/g, '<br>')}</p>
            <a href="${item.url}" style="color: #007acc;">Read more</a>
          </div>
        `).join('')}
        <hr>
        <p style="color: #666; font-size: 14px;">
          This newsletter was automatically generated from various SQL learning resources.
          <br>© SQL Newsletter Platform
        </p>
      `;

      // Save as draft newsletter
      const newsletter = new Newsletter({
        title,
        content,
        htmlContent,
        category: 'interview-tips',
        tags: ['daily', 'scraped', 'interview'],
        targetSubscribers: 'all'
      });

      await newsletter.save();

      res.json({
        message: 'Content scraped and newsletter created successfully',
        scrapedSources: scrapedContent.length,
        validSources: validContent.length,
        newsletter: {
          id: newsletter._id,
          title: newsletter.title
        }
      });
    } else {
      res.status(400).json({
        error: 'No valid content scraped',
        details: scrapedContent
      });
    }
  } catch (error) {
    console.error('Scraping error:', error);
    res.status(500).json({ error: 'Failed to scrape content' });
  }
});

// Manual SQL tips (fallback when scraping fails)
const SQL_TIPS = [
  {
    title: "Understanding SQL Joins",
    content: "Master INNER, LEFT, RIGHT, and FULL OUTER joins. Practice with different scenarios and understand when to use each type.",
    category: "sql-basics"
  },
  {
    title: "Query Optimization Techniques",
    content: "Use EXPLAIN PLAN to analyze query performance. Index frequently queried columns and avoid SELECT * in production.",
    category: "advanced-queries"
  },
  {
    title: "Common Interview Questions",
    content: "Be ready to explain the difference between WHERE and HAVING, and demonstrate writing subqueries and window functions.",
    category: "interview-tips"
  }
];

// Generate manual newsletter
router.post('/manual-content', async (req, res) => {
  try {
    const randomTips = SQL_TIPS.sort(() => 0.5 - Math.random()).slice(0, 2);

    const title = `SQL Interview Preparation - ${new Date().toLocaleDateString()}`;
    const content = randomTips.map((tip, index) => 
      `## ${tip.title}\n\n${tip.content}`
    ).join('\n\n---\n\n');

    const htmlContent = `
      <h2>${title}</h2>
      ${randomTips.map(tip => `
        <div style="margin-bottom: 30px; padding: 20px; background: #f8f9fa; border-radius: 8px;">
          <h3 style="color: #007acc;">${tip.title}</h3>
          <p>${tip.content}</p>
          <small style="color: #666;">Category: ${tip.category}</small>
        </div>
      `).join('')}
      <hr>
      <p style="color: #666; font-size: 14px;">
        Keep practicing and good luck with your SQL interviews!
        <br>© SQL Newsletter Platform
      </p>
    `;

    const newsletter = new Newsletter({
      title,
      content,
      htmlContent,
      category: 'interview-tips',
      tags: ['manual', 'tips'],
      targetSubscribers: 'all'
    });

    await newsletter.save();

    res.json({
      message: 'Manual newsletter created successfully',
      newsletter: {
        id: newsletter._id,
        title: newsletter.title
      }
    });
  } catch (error) {
    console.error('Manual content error:', error);
    res.status(500).json({ error: 'Failed to create manual content' });
  }
});

module.exports = router;
