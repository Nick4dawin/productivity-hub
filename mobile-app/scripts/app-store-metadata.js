#!/usr/bin/env node

/**
 * App Store Metadata Generator
 * 
 * This script generates metadata files for both iOS App Store and Google Play Store
 * including descriptions, keywords, and release notes.
 */

const fs = require('fs');
const path = require('path');

class AppStoreMetadataGenerator {
  constructor() {
    this.outputDir = path.join(__dirname, '../store-metadata');
    this.appInfo = {
      name: 'ProductivityHub',
      shortDescription: 'Your all-in-one productivity companion',
      version: '1.0.0',
      category: 'Productivity',
      contentRating: '4+', // iOS / Everyone (Android)
      website: 'https://productivityhub.app',
      supportEmail: 'support@productivityhub.app',
      privacyPolicy: 'https://productivityhub.app/privacy',
      termsOfService: 'https://productivityhub.app/terms'
    };
  }

  generateAllMetadata() {
    console.log('📝 Generating app store metadata...');
    
    // Create output directory
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }

    // Generate iOS metadata
    this.generateIOSMetadata();
    
    // Generate Android metadata
    this.generateAndroidMetadata();
    
    // Generate common assets
    this.generateCommonAssets();
    
    console.log('✅ App store metadata generated successfully!');
    console.log(`📁 Output directory: ${this.outputDir}`);
  }

  generateIOSMetadata() {
    console.log('🍎 Generating iOS App Store metadata...');
    
    const iosDir = path.join(this.outputDir, 'ios');
    if (!fs.existsSync(iosDir)) {
      fs.mkdirSync(iosDir, { recursive: true });
    }

    // App Store description
    const description = `Transform your daily routine with ProductivityHub - the comprehensive productivity app that brings together habit tracking, mood monitoring, journaling, task management, and goal setting in one beautiful, intuitive interface.

🎯 KEY FEATURES

• Habit Tracking: Build lasting habits with visual progress tracking, streak counters, and intelligent reminders
• Mood & Journal: Track your emotional well-being with mood logging and AI-powered journal analysis
• Smart Tasks: Organize your todos with priority levels, categories, and due date management
• Goal Setting: Set and achieve SMART goals with milestone tracking and progress visualization
• Media Tracking: Keep track of books, movies, podcasts, and games you want to consume
• Finance Tracker: Monitor expenses, budgets, and subscriptions to stay on top of your finances
• AI Coach: Get personalized insights and recommendations based on your productivity patterns
• Offline Support: Access your data and continue tracking even without internet connection

✨ WHAT MAKES US DIFFERENT

• Holistic Approach: Unlike single-purpose apps, ProductivityHub connects all aspects of your productive life
• AI-Powered Insights: Our intelligent coach learns from your patterns to provide personalized guidance
• Beautiful Design: Clean, intuitive interface that makes productivity tracking enjoyable
• Privacy First: Your data stays secure with end-to-end encryption and local storage options
• Cross-Platform Sync: Seamlessly sync between your phone and web dashboard

🚀 PERFECT FOR

• Students managing coursework and personal development
• Professionals balancing work and life goals
• Anyone looking to build better habits and track progress
• People interested in mindful living and self-improvement
• Individuals who want an all-in-one productivity solution

📊 TRACK YOUR PROGRESS

Watch your productivity soar with detailed analytics, progress charts, and achievement celebrations. Set daily, weekly, and monthly goals, then watch as ProductivityHub helps you achieve them consistently.

🔒 YOUR PRIVACY MATTERS

We believe your personal data should stay personal. ProductivityHub uses advanced encryption and gives you full control over your data with local storage and secure cloud sync options.

Start your productivity journey today with ProductivityHub - where every day is an opportunity to become your best self.`;

    // Keywords for App Store Optimization
    const keywords = [
      'productivity', 'habits', 'goals', 'journal', 'mood tracker',
      'task manager', 'todo list', 'habit tracker', 'self improvement',
      'personal development', 'mindfulness', 'wellness', 'organization',
      'planning', 'motivation', 'progress tracking', 'daily routine',
      'life coach', 'analytics', 'insights'
    ].join(', ');

    // Release notes
    const releaseNotes = `🎉 Welcome to ProductivityHub v1.0!

We're excited to introduce your new all-in-one productivity companion:

✨ NEW FEATURES
• Complete habit tracking system with streaks and analytics
• Mood logging with AI-powered journal analysis
• Smart task management with priorities and categories
• SMART goal setting with milestone tracking
• Media consumption tracking for books, movies, and more
• Personal finance tracking with budgets and expenses
• AI coach providing personalized productivity insights
• Beautiful, intuitive interface designed for daily use

🔧 TECHNICAL HIGHLIGHTS
• Offline support - track your progress anywhere
• Secure data encryption and privacy protection
• Cross-platform synchronization
• Fast, responsive native performance
• Comprehensive analytics and progress visualization

📱 GETTING STARTED
1. Set up your first habit or goal
2. Log your daily mood and activities
3. Add tasks to stay organized
4. Explore the AI coach for personalized insights
5. Watch your productivity patterns emerge in analytics

Thank you for choosing ProductivityHub! We're committed to helping you achieve your goals and build lasting positive habits.

Have feedback? Contact us at support@productivityhub.app`;

    // Write iOS metadata files
    fs.writeFileSync(path.join(iosDir, 'description.txt'), description);
    fs.writeFileSync(path.join(iosDir, 'keywords.txt'), keywords);
    fs.writeFileSync(path.join(iosDir, 'release-notes.txt'), releaseNotes);
    
    // App Store Connect metadata
    const appStoreMetadata = {
      name: this.appInfo.name,
      subtitle: 'All-in-One Productivity Tracker',
      description: description,
      keywords: keywords,
      releaseNotes: releaseNotes,
      category: 'Productivity',
      contentRating: '4+',
      website: this.appInfo.website,
      supportURL: this.appInfo.website + '/support',
      privacyPolicyURL: this.appInfo.privacyPolicy,
      version: this.appInfo.version,
      copyright: `© ${new Date().getFullYear()} ProductivityHub. All rights reserved.`,
      reviewNotes: 'This app helps users track habits, mood, tasks, and goals. All features work offline and data is stored securely. No sensitive content or user-generated content sharing.'
    };

    fs.writeFileSync(
      path.join(iosDir, 'app-store-metadata.json'),
      JSON.stringify(appStoreMetadata, null, 2)
    );

    console.log('  ✓ iOS metadata files generated');
  }

  generateAndroidMetadata() {
    console.log('🤖 Generating Google Play Store metadata...');
    
    const androidDir = path.join(this.outputDir, 'android');
    if (!fs.existsSync(androidDir)) {
      fs.mkdirSync(androidDir, { recursive: true });
    }

    // Short description (80 characters max)
    const shortDescription = 'Track habits, mood, tasks & goals. Your all-in-one productivity companion.';

    // Full description (4000 characters max)
    const fullDescription = `🚀 Transform Your Productivity with ProductivityHub

The only app you need to track habits, monitor mood, manage tasks, and achieve your goals. ProductivityHub brings together all aspects of personal productivity in one beautiful, easy-to-use app.

🎯 COMPREHENSIVE TRACKING
• Habit Tracker: Build lasting habits with visual progress and streak tracking
• Mood & Journal: Monitor emotional well-being with AI-powered insights
• Task Manager: Organize todos with smart prioritization and categories
• Goal Setting: Set and achieve SMART goals with milestone tracking
• Media Tracker: Keep track of books, movies, podcasts, and games
• Finance Tracker: Monitor expenses, budgets, and subscriptions
• AI Coach: Get personalized productivity insights and recommendations

✨ KEY BENEFITS
• All-in-One Solution: Replace multiple apps with one comprehensive platform
• Offline Support: Track progress anywhere, sync when connected
• Privacy First: Your data stays secure with encryption and local storage
• Beautiful Design: Intuitive interface that makes tracking enjoyable
• Smart Analytics: Understand your patterns with detailed insights
• Cross-Platform: Seamlessly sync between mobile and web

🏆 PERFECT FOR
• Students managing coursework and personal development
• Professionals balancing work-life productivity
• Anyone building better habits and tracking progress
• People interested in mindful living and self-improvement
• Individuals seeking an integrated productivity solution

📊 TRACK & IMPROVE
Watch your productivity soar with detailed analytics, progress charts, and achievement celebrations. Set daily, weekly, and monthly goals, then let ProductivityHub guide you to consistent success.

🔒 YOUR PRIVACY MATTERS
Advanced encryption keeps your personal data secure. Full control over data storage with local and secure cloud sync options.

Download ProductivityHub today and start your journey to becoming your most productive self!`;

    // What's new (500 characters max)
    const whatsNew = `🎉 ProductivityHub v1.0 Launch!

✨ Complete habit tracking with streaks & analytics
📝 Mood logging with AI-powered journal analysis  
✅ Smart task management with priorities
🎯 SMART goal setting with milestones
📚 Media consumption tracking
💰 Personal finance tracking
🤖 AI coach with personalized insights
📱 Beautiful, intuitive design
🔒 Offline support & secure sync

Start building better habits today!`;

    // Write Android metadata files
    fs.writeFileSync(path.join(androidDir, 'short-description.txt'), shortDescription);
    fs.writeFileSync(path.join(androidDir, 'full-description.txt'), fullDescription);
    fs.writeFileSync(path.join(androidDir, 'whats-new.txt'), whatsNew);

    // Google Play Console metadata
    const playStoreMetadata = {
      title: this.appInfo.name,
      shortDescription: shortDescription,
      fullDescription: fullDescription,
      whatsNew: whatsNew,
      category: 'Productivity',
      contentRating: 'Everyone',
      website: this.appInfo.website,
      email: this.appInfo.supportEmail,
      privacyPolicy: this.appInfo.privacyPolicy,
      version: this.appInfo.version,
      tags: [
        'productivity', 'habits', 'goals', 'journal', 'mood',
        'tasks', 'tracker', 'self-improvement', 'wellness',
        'organization', 'planning', 'analytics'
      ]
    };

    fs.writeFileSync(
      path.join(androidDir, 'play-store-metadata.json'),
      JSON.stringify(playStoreMetadata, null, 2)
    );

    console.log('  ✓ Android metadata files generated');
  }

  generateCommonAssets() {
    console.log('📄 Generating common assets...');
    
    // Privacy Policy
    const privacyPolicy = `# Privacy Policy for ProductivityHub

**Last updated:** ${new Date().toLocaleDateString()}

## Information We Collect

ProductivityHub is designed with privacy in mind. We collect minimal information necessary to provide our services:

### Information You Provide
- Account information (email, name)
- Productivity data (habits, tasks, goals, journal entries, mood logs)
- Usage preferences and settings

### Automatically Collected Information
- App usage analytics (anonymized)
- Device information for app optimization
- Crash reports for bug fixes

## How We Use Your Information

- Provide and improve our productivity tracking services
- Sync your data across devices
- Generate personalized insights and recommendations
- Send important service updates
- Provide customer support

## Data Storage and Security

- All personal data is encrypted in transit and at rest
- Local storage option available for sensitive data
- Regular security audits and updates
- No data sharing with third parties without consent

## Your Rights

- Access, update, or delete your personal data
- Export your data in standard formats
- Opt-out of analytics and marketing communications
- Request data portability

## Contact Us

For privacy questions or concerns:
- Email: privacy@productivityhub.app
- Website: ${this.appInfo.website}/privacy

This policy may be updated periodically. We'll notify users of significant changes.`;

    // Terms of Service
    const termsOfService = `# Terms of Service for ProductivityHub

**Last updated:** ${new Date().toLocaleDateString()}

## Acceptance of Terms

By using ProductivityHub, you agree to these terms of service.

## Description of Service

ProductivityHub is a personal productivity tracking application that helps users monitor habits, mood, tasks, goals, and other productivity metrics.

## User Accounts

- You are responsible for maintaining account security
- Provide accurate and complete information
- One account per person
- Notify us of unauthorized access

## Acceptable Use

You agree to use ProductivityHub only for lawful purposes and in accordance with these terms.

### Prohibited Uses
- Violating laws or regulations
- Sharing inappropriate content
- Attempting to breach security
- Reverse engineering the application

## Data and Privacy

- You retain ownership of your personal data
- We process data according to our Privacy Policy
- You're responsible for backing up important data
- We may anonymize data for service improvement

## Service Availability

- We strive for high availability but cannot guarantee 100% uptime
- Scheduled maintenance will be announced in advance
- We reserve the right to modify or discontinue features

## Limitation of Liability

ProductivityHub is provided "as is" without warranties. We are not liable for indirect, incidental, or consequential damages.

## Changes to Terms

We may update these terms periodically. Continued use constitutes acceptance of updated terms.

## Contact Information

For questions about these terms:
- Email: legal@productivityhub.app
- Website: ${this.appInfo.website}/terms`;

    // Support Documentation
    const supportDoc = `# ProductivityHub Support

## Getting Started

### First Time Setup
1. Create your account with email or Google sign-in
2. Set up your first habit or goal
3. Explore the different tracking features
4. Customize your dashboard and preferences

### Key Features Overview
- **Habits**: Track daily habits with streaks and analytics
- **Mood & Journal**: Log emotions and thoughts with AI insights
- **Tasks**: Manage todos with priorities and due dates
- **Goals**: Set SMART goals with milestone tracking
- **Media**: Track books, movies, podcasts, and games
- **Finance**: Monitor expenses, budgets, and subscriptions
- **AI Coach**: Get personalized productivity recommendations

## Frequently Asked Questions

### Data and Sync
**Q: Is my data secure?**
A: Yes, all data is encrypted and you control where it's stored.

**Q: Can I use the app offline?**
A: Yes, all features work offline and sync when connected.

**Q: How do I backup my data?**
A: Use the export feature in Settings to download your data.

### Features
**Q: How does habit tracking work?**
A: Mark habits complete each day to build streaks and see progress.

**Q: What is the AI Coach?**
A: It analyzes your patterns to provide personalized productivity insights.

**Q: Can I customize categories?**
A: Yes, create custom categories for habits, tasks, and goals.

## Troubleshooting

### Common Issues
- **Sync problems**: Check internet connection and try manual sync
- **Missing data**: Check if you're logged into the correct account
- **App crashes**: Update to the latest version and restart

### Getting Help
- Email: support@productivityhub.app
- Website: ${this.appInfo.website}/support
- In-app feedback: Settings > Send Feedback

## Feature Requests

We love hearing from users! Send feature requests to:
- Email: feedback@productivityhub.app
- In-app: Settings > Request Feature

## Updates and Changelog

Stay updated with new features and improvements:
- Check the app store for updates
- Follow our blog at ${this.appInfo.website}/blog
- Join our community for early access to new features`;

    // Write common assets
    fs.writeFileSync(path.join(this.outputDir, 'privacy-policy.md'), privacyPolicy);
    fs.writeFileSync(path.join(this.outputDir, 'terms-of-service.md'), termsOfService);
    fs.writeFileSync(path.join(this.outputDir, 'support-documentation.md'), supportDoc);

    // App information summary
    const appSummary = {
      ...this.appInfo,
      generatedDate: new Date().toISOString(),
      files: {
        ios: [
          'description.txt',
          'keywords.txt', 
          'release-notes.txt',
          'app-store-metadata.json'
        ],
        android: [
          'short-description.txt',
          'full-description.txt',
          'whats-new.txt',
          'play-store-metadata.json'
        ],
        common: [
          'privacy-policy.md',
          'terms-of-service.md',
          'support-documentation.md'
        ]
      }
    };

    fs.writeFileSync(
      path.join(this.outputDir, 'app-info.json'),
      JSON.stringify(appSummary, null, 2)
    );

    console.log('  ✓ Common assets generated');
  }
}

// CLI usage
if (require.main === module) {
  const generator = new AppStoreMetadataGenerator();
  generator.generateAllMetadata();
}

module.exports = AppStoreMetadataGenerator;