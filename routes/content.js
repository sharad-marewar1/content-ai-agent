const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Content generation endpoint
router.post('/generate', auth, async (req, res) => {
  try {
    const { contentType, topic, tone, length, keywords, industry, targetAudience } = req.body;
    const userId = req.user.id;

    // Validate subscription and usage limits
    const user = await User.findById(userId);
    if (!user.subscription || user.subscription.status !== 'active') {
      return res.status(403).json({ error: 'Active subscription required' });
    }

    // Check usage limits
    if (user.usageCount >= user.subscription.monthlyLimit) {
      return res.status(429).json({ error: 'Monthly usage limit reached' });
    }

    let prompt = '';
    let maxTokens = 1000;

    switch (contentType) {
      case 'blog':
        prompt = `Write a professional blog post about "${topic}" for the ${industry} industry. 
        Target audience: ${targetAudience}. 
        Tone: ${tone}. 
        Length: ${length} words. 
        Include these keywords naturally: ${keywords.join(', ')}. 
        Structure: Introduction, 3-4 main points with subheadings, conclusion with call-to-action.`;
        maxTokens = 2000;
        break;
      
      case 'social':
        prompt = `Create ${length} engaging social media posts about "${topic}" for ${industry} business. 
        Tone: ${tone}. 
        Include hashtags and emojis. 
        Keywords: ${keywords.join(', ')}. 
        Make it shareable and engaging.`;
        maxTokens = 800;
        break;
      
      case 'email':
        prompt = `Write a professional email about "${topic}" for ${industry} business. 
        Tone: ${tone}. 
        Length: ${length} words. 
        Include these keywords: ${keywords.join(', ')}. 
        Purpose: ${req.body.emailPurpose || 'general communication'}.`;
        maxTokens = 1000;
        break;
      
      case 'seo':
        prompt = `Create SEO-optimized content about "${topic}" for ${industry} business. 
        Target keywords: ${keywords.join(', ')}. 
        Length: ${length} words. 
        Include meta description, H1, H2 tags, and internal linking suggestions.`;
        maxTokens = 2500;
        break;
      
      default:
        return res.status(400).json({ error: 'Invalid content type' });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a professional content writer specializing in business and marketing content. Create high-quality, engaging content that drives results."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: maxTokens,
      temperature: 0.7,
    });

    const generatedContent = completion.choices[0].message.content;

    // Save content to database
    const content = new Content({
      userId,
      contentType,
      topic,
      generatedContent,
      keywords,
      industry,
      targetAudience,
      tone,
      length,
      createdAt: new Date()
    });

    await content.save();

    // Update user usage
    user.usageCount += 1;
    await user.save();

    // Track analytics
    await Analytics.create({
      userId,
      action: 'content_generated',
      contentType,
      timestamp: new Date()
    });

    res.json({
      success: true,
      content: generatedContent,
      contentId: content._id,
      usageCount: user.usageCount,
      monthlyLimit: user.subscription.monthlyLimit
    });

  } catch (error) {
    console.error('Content generation error:', error);
    res.status(500).json({ error: 'Failed to generate content' });
  }
});

// Get user's content history
router.get('/history', auth, async (req, res) => {
  try {
    const content = await Content.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json(content);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch content history' });
  }
});

// Get content by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const content = await Content.findOne({ _id: req.params.id, userId: req.user.id });
    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }
    res.json(content);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch content' });
  }
});

// Delete content
router.delete('/:id', auth, async (req, res) => {
  try {
    const content = await Content.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete content' });
  }
});

module.exports = router;
