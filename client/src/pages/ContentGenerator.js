import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  MessageSquare, 
  Share2, 
  Search, 
  Sparkles, 
  Copy, 
  Download,
  Save,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import api from '../utils/api';

const ContentGenerator = () => {
  const { user } = useAuth();
  const { subscription, usageCount, monthlyLimit } = useSubscription();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [contentHistory, setContentHistory] = useState([]);
  
  const [formData, setFormData] = useState({
    contentType: 'blog',
    topic: '',
    tone: 'professional',
    length: 500,
    keywords: '',
    industry: '',
    targetAudience: '',
    emailPurpose: ''
  });

  const contentTypes = [
    { id: 'blog', name: 'Blog Post', icon: FileText, description: 'Long-form articles and blog posts' },
    { id: 'social', name: 'Social Media', icon: Share2, description: 'Social media posts and captions' },
    { id: 'email', name: 'Email', icon: MessageSquare, description: 'Professional emails and newsletters' },
    { id: 'seo', name: 'SEO Content', icon: Search, description: 'SEO-optimized content with meta tags' }
  ];

  const tones = [
    'professional', 'casual', 'friendly', 'authoritative', 'conversational', 'enthusiastic'
  ];

  const industries = [
    'Technology', 'Healthcare', 'Finance', 'Education', 'E-commerce', 'Marketing', 
    'Real Estate', 'Legal', 'Consulting', 'Manufacturing', 'Retail', 'Other'
  ];

  useEffect(() => {
    loadContentHistory();
  }, []);

  const loadContentHistory = async () => {
    try {
      const response = await api.get('/content/history');
      setContentHistory(response.data);
    } catch (error) {
      console.error('Failed to load content history:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleKeywordsChange = (e) => {
    const keywords = e.target.value.split(',').map(k => k.trim()).filter(k => k);
    setFormData(prev => ({
      ...prev,
      keywords: keywords
    }));
  };

  const generateContent = async () => {
    if (!formData.topic.trim()) {
      toast.error('Please enter a topic');
      return;
    }

    if (usageCount >= monthlyLimit) {
      toast.error('Monthly usage limit reached. Please upgrade your plan.');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await api.post('/content/generate', {
        ...formData,
        keywords: formData.keywords.split(',').map(k => k.trim()).filter(k => k)
      });

      setGeneratedContent(response.data.content);
      toast.success('Content generated successfully!');
      
      // Reload content history
      await loadContentHistory();
      
    } catch (error) {
      console.error('Content generation failed:', error);
      toast.error(error.response?.data?.error || 'Failed to generate content');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent);
    toast.success('Content copied to clipboard!');
  };

  const downloadContent = () => {
    const element = document.createElement('a');
    const file = new Blob([generatedContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${formData.contentType}-${formData.topic}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('Content downloaded!');
  };

  const saveContent = async () => {
    try {
      await api.post('/content/save', {
        contentType: formData.contentType,
        topic: formData.topic,
        generatedContent,
        keywords: formData.keywords.split(',').map(k => k.trim()).filter(k => k),
        industry: formData.industry,
        targetAudience: formData.targetAudience,
        tone: formData.tone,
        length: formData.length
      });
      toast.success('Content saved to history!');
    } catch (error) {
      toast.error('Failed to save content');
    }
  };

  const resetForm = () => {
    setFormData({
      contentType: 'blog',
      topic: '',
      tone: 'professional',
      length: 500,
      keywords: '',
      industry: '',
      targetAudience: '',
      emailPurpose: ''
    });
    setGeneratedContent('');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            AI Content Generator
          </h1>
          <p className="text-xl text-gray-300">
            Create professional content in seconds with AI-powered writing assistance
          </p>
          <div className="mt-4 p-4 bg-blue-900/20 rounded-lg border border-blue-500/30">
            <p className="text-blue-200">
              Usage: {usageCount} / {monthlyLimit} this month
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Content Generation Form */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10"
          >
            <h2 className="text-2xl font-semibold text-white mb-6">Generate Content</h2>
            
            {/* Content Type Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Content Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                {contentTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setFormData(prev => ({ ...prev, contentType: type.id }))}
                    className={`p-4 rounded-lg border transition-all ${
                      formData.contentType === type.id
                        ? 'border-blue-500 bg-blue-500/20 text-blue-200'
                        : 'border-gray-600 bg-gray-800/50 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    <type.icon className="w-6 h-6 mx-auto mb-2" />
                    <div className="text-sm font-medium">{type.name}</div>
                    <div className="text-xs text-gray-400">{type.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Topic Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Topic *
              </label>
              <input
                type="text"
                name="topic"
                value={formData.topic}
                onChange={handleInputChange}
                placeholder="Enter your content topic..."
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>

            {/* Industry and Target Audience */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Industry
                </label>
                <select
                  name="industry"
                  value={formData.industry}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="">Select Industry</option>
                  {industries.map(industry => (
                    <option key={industry} value={industry}>{industry}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Target Audience
                </label>
                <input
                  type="text"
                  name="targetAudience"
                  value={formData.targetAudience}
                  onChange={handleInputChange}
                  placeholder="e.g., Small business owners"
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            {/* Tone and Length */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tone
                </label>
                <select
                  name="tone"
                  value={formData.tone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                >
                  {tones.map(tone => (
                    <option key={tone} value={tone}>{tone.charAt(0).toUpperCase() + tone.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Length (words)
                </label>
                <input
                  type="number"
                  name="length"
                  value={formData.length}
                  onChange={handleInputChange}
                  min="100"
                  max="2000"
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            {/* Keywords */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Keywords (comma-separated)
              </label>
              <input
                type="text"
                name="keywords"
                value={formData.keywords}
                onChange={handleKeywordsChange}
                placeholder="keyword1, keyword2, keyword3"
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* Email Purpose (for email content type) */}
            {formData.contentType === 'email' && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Purpose
                </label>
                <input
                  type="text"
                  name="emailPurpose"
                  value={formData.emailPurpose}
                  onChange={handleInputChange}
                  placeholder="e.g., Newsletter, Sales pitch, Customer support"
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            )}

            {/* Generate Button */}
            <button
              onClick={generateContent}
              disabled={isGenerating || !formData.topic.trim()}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Content
                </>
              )}
            </button>
          </motion.div>

          {/* Generated Content Display */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-white">Generated Content</h2>
              {generatedContent && (
                <div className="flex gap-2">
                  <button
                    onClick={copyToClipboard}
                    className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300 hover:text-white transition-colors"
                    title="Copy to clipboard"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={downloadContent}
                    className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300 hover:text-white transition-colors"
                    title="Download content"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={saveContent}
                    className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors"
                    title="Save to history"
                  >
                    <Save className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {generatedContent ? (
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600">
                <div className="prose prose-invert max-w-none">
                  <pre className="whitespace-pre-wrap text-gray-200 font-sans text-sm leading-relaxed">
                    {generatedContent}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="bg-gray-800/50 rounded-lg p-8 border border-gray-600 border-dashed text-center">
                <Sparkles className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">
                  Your AI-generated content will appear here
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Fill out the form and click generate to get started
                </p>
              </div>
            )}

            {/* Reset Button */}
            {generatedContent && (
              <button
                onClick={resetForm}
                className="w-full mt-4 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                Start Over
              </button>
            )}
          </motion.div>
        </div>

        {/* Content History */}
        {contentHistory.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12"
          >
            <h3 className="text-2xl font-semibold text-white mb-6">Recent Content</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {contentHistory.slice(0, 6).map((content) => (
                <div key={content._id} className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    {contentTypes.find(t => t.id === content.contentType)?.icon && 
                      React.createElement(contentTypes.find(t => t.id === content.contentType).icon, { className: "w-4 h-4 text-blue-400" })
                    }
                    <span className="text-xs text-blue-400 uppercase font-medium">
                      {content.contentType}
                    </span>
                  </div>
                  <h4 className="font-medium text-white mb-2 line-clamp-2">
                    {content.topic}
                  </h4>
                  <p className="text-sm text-gray-400 mb-3 line-clamp-3">
                    {content.generatedContent}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{new Date(content.createdAt).toLocaleDateString()}</span>
                    <span>{content.length} words</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ContentGenerator;
