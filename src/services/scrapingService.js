const axios = require('axios');
const cheerio = require('cheerio');
const Newsletter = require('../models/Newsletter');

class ScrapingService {
  constructor() {
    this.sources = [
      {
        name: 'GeeksforGeeks SQL',
        url: 'https://www.geeksforgeeks.org/sql-interview-questions/',
        selectors: ['.text', 'article', '.content'],
        category: 'interview-tips'
      },
      {
        name: 'InterviewBit SQL',
        url: 'https://www.interviewbit.com/sql-interview-questions/',
        selectors: ['.ibpage-article-content', 'article', '.content'],
        category: 'interview-tips'
      },
      {
        name: 'JavaTpoint SQL',
        url: 'https://www.javatpoint.com/sql-interview-questions',
        selectors: ['.onlycontentcenter', 'article', '.content'],
        category: 'interview-tips'
      }
    ];

    this.fallbackContent = [
      {
        title: "Master SQL Joins",
        content: `Understanding different types of SQL joins is crucial for interviews:

**INNER JOIN**: Returns records that have matching values in both tables
**LEFT JOIN**: Returns all records from left table, matched records from right
**RIGHT JOIN**: Returns all records from right table, matched records from left
**FULL OUTER JOIN**: Returns all records when there's a match in either table

Practice these with real examples and understand when to use each type.`,
        category: 'sql-basics'
      },
      {
        title: "Query Optimization Tips",
        content: `Key strategies for optimizing SQL queries:

1. **Use indexes wisely**: Create indexes on frequently queried columns
2. **Avoid SELECT ***: Specify only needed columns
3. **Use WHERE clauses**: Filter data early in the query
4. **Optimize JOIN conditions**: Use proper indexing on join columns
5. **Use EXPLAIN PLAN**: Analyze query execution plans

Remember: Premature optimization is the root of all evil, but understanding these concepts is essential.`,
        category: 'advanced-queries'
      },
      {
        title: "Common Interview Questions",
        content: `Frequently asked SQL interview questions:

**Q: What's the difference between WHERE and HAVING?**
A: WHERE filters rows before grouping, HAVING filters groups after GROUP BY

**Q: Explain the difference between UNION and UNION ALL**
A: UNION removes duplicates, UNION ALL includes all records

**Q: What are window functions?**
A: Functions that perform calculations across a set of table rows related to the current row

Practice writing queries for these concepts with sample data.`,
        category: 'interview-tips'
      },
      {
        title: "Database Design Principles",
        content: `Essential database design concepts:

**Normalization**: Organize data to reduce redundancy
- 1NF: Atomic values, no repeating groups
- 2NF: No partial dependencies on composite keys
- 3NF: No transitive dependencies

**Indexing Strategy**: 
- Primary keys automatically indexed
- Foreign keys should be indexed
- Consider composite indexes for multi-column queries

**Performance Considerations**:
- Denormalization for read-heavy applications
- Proper data types selection
- Partitioning for large tables`,
        category: 'database-design'
      }
    ];
  }

  async scrapeContent() {
    const scrapedContent = [];

    for (const source of this.sources) {
      try {
        console.log(`Scraping content from ${source.name}...`);
        const content = await this.scrapeSource(source);
        if (content) {
          scrapedContent.push({
            source: source.name,
            content: content,
            url: source.url,
            category: source.category,
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

    return scrapedContent;
  }

  async scrapeSource(source) {
    try {
      const response = await axios.get(source.url, {
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        }
      });

      if (response.status !== 200) {
        throw new Error(`HTTP ${response.status}`);
      }

      const $ = cheerio.load(response.data);
      let content = '';

      // Try different selectors
      for (const selector of source.selectors) {
        const elements = $(selector);
        if (elements.length > 0) {
          content = elements.first().text().trim();
          break;
        }
      }

      // Extract meaningful content
      if (content && content.length > 200) {
        // Clean up the content
        content = content
          .replace(/\s+/g, ' ')
          .replace(/\n+/g, '\n')
          .substring(0, 1500) + '...';

        return content;
      }

      return null;
    } catch (error) {
      throw new Error(`Scraping failed: ${error.message}`);
    }
  }

  async createNewsletterFromScrapedContent(scrapedContent) {
    const validContent = scrapedContent.filter(item => !item.error && item.content);

    if (validContent.length === 0) {
      // Use fallback content if scraping fails
      return this.createFallbackNewsletter();
    }

    const title = `Daily SQL Tips - ${new Date().toLocaleDateString()}`;

    // Create markdown content
    const content = validContent.map((item, index) => 
      `## Tip ${index + 1}: From ${item.source}\n\n${item.content}\n\n[Read more](${item.url})`
    ).join('\n\n---\n\n');

    // Create HTML content
    const htmlContent = `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">${title}</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">
            Your daily dose of SQL knowledge
          </p>
        </div>

        <div style="background: white; padding: 30px 20px;">
          ${validContent.map((item, index) => `
            <div style="margin-bottom: 40px; padding: 25px; background: #f8f9fa; border-left: 4px solid #667eea; border-radius: 0 8px 8px 0;">
              <h2 style="color: #333; margin: 0 0 15px 0; font-size: 18px;">
                📚 Tip ${index + 1}: From ${item.source}
              </h2>
              <div style="color: #555; line-height: 1.6; margin-bottom: 15px;">
                ${item.content.substring(0, 500).replace(/\n/g, '<br>')}...
              </div>
              <a href="${item.url}" style="color: #667eea; text-decoration: none; font-weight: bold;">
                📖 Read full article →
              </a>
            </div>
          `).join('')}

          <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; text-align: center; margin-top: 30px;">
            <h3 style="color: #333; margin: 0 0 10px 0;">💡 Pro Tip</h3>
            <p style="color: #666; margin: 0; line-height: 1.6;">
              Practice these concepts with real databases. Set up a local environment 
              and try implementing these techniques with sample data!
            </p>
          </div>
        </div>

        <div style="background: #f1f3f4; padding: 20px; text-align: center;">
          <p style="color: #666; font-size: 12px; margin: 0;">
            This newsletter was automatically curated from various SQL learning resources.
            <br>© ${new Date().getFullYear()} SQL Newsletter Platform
          </p>
        </div>
      </div>
    `;

    const newsletter = new Newsletter({
      title,
      content,
      htmlContent,
      excerpt: `Curated SQL tips from ${validContent.length} sources`,
      category: 'interview-tips',
      tags: ['daily', 'scraped', 'curated'],
      targetSubscribers: 'all',
      status: 'draft'
    });

    await newsletter.save();
    return newsletter;
  }

  async createFallbackNewsletter() {
    const randomTip = this.fallbackContent[Math.floor(Math.random() * this.fallbackContent.length)];
    const title = `${randomTip.title} - ${new Date().toLocaleDateString()}`;

    const htmlContent = `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">${title}</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">
            Expert SQL knowledge for interview success
          </p>
        </div>

        <div style="background: white; padding: 30px 20px;">
          <div style="color: #555; line-height: 1.8; font-size: 16px;">
            ${randomTip.content.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}
          </div>

          <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin-top: 30px;">
            <h3 style="color: #2e7d32; margin: 0 0 10px 0;">🎯 Interview Success Tip</h3>
            <p style="color: #2e7d32; margin: 0; line-height: 1.6;">
              When discussing this topic in interviews, always provide concrete examples 
              and explain your reasoning step by step.
            </p>
          </div>
        </div>

        <div style="background: #f1f3f4; padding: 20px; text-align: center;">
          <p style="color: #666; font-size: 12px; margin: 0;">
            Keep learning and practicing! Your next opportunity is just around the corner.
            <br>© ${new Date().getFullYear()} SQL Newsletter Platform
          </p>
        </div>
      </div>
    `;

    const newsletter = new Newsletter({
      title,
      content: randomTip.content,
      htmlContent,
      excerpt: randomTip.content.substring(0, 150) + '...',
      category: randomTip.category,
      tags: ['manual', 'curated'],
      targetSubscribers: 'all',
      status: 'draft'
    });

    await newsletter.save();
    return newsletter;
  }

  async getLatestSQLTrends() {
    // This could be expanded to scrape trending SQL topics, new features, etc.
    const trends = [
      'Window Functions in SQL',
      'Common Table Expressions (CTEs)',
      'JSON functions in modern SQL',
      'Query performance optimization',
      'Database indexing strategies',
      'SQL for data analysis',
      'NoSQL vs SQL comparison',
      'Database security best practices'
    ];

    return trends[Math.floor(Math.random() * trends.length)];
  }
}

module.exports = new ScrapingService();
