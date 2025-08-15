# Requirements Document

## Introduction

This feature enhances the existing journal functionality with intelligent AI-powered categorization and contextual suggestions. The system will automatically analyze journal entries to extract actionable data (mood, todos, media, habits, and activities) and provide contextual suggestions based on user's current state and recent activities. Users maintain control over what data gets extracted through a confirmation interface.

## Requirements

### Requirement 1

**User Story:** As a journal user, I want my journal entries to be automatically analyzed for mood, todos, media, habits, and activities, so that I can efficiently organize my thoughts without manual categorization.

#### Acceptance Criteria

1. WHEN a user submits a journal entry THEN the system SHALL analyze the text for mood indicators, todo items, media references, habits, and activities
2. WHEN analysis is complete THEN the system SHALL present a confirmation dialog showing what data was extracted
3. WHEN the user reviews extracted data THEN the system SHALL allow them to approve, modify, or reject each extracted item
4. IF the user approves extracted data THEN the system SHALL automatically add items to their respective sections (mood, todos, media, habits)
5. WHEN extraction fails or finds no relevant data THEN the system SHALL save the journal entry without additional categorization

### Requirement 2

**User Story:** As a journal user, I want to receive contextual suggestions when I open my journal, so that I can be prompted with relevant activities or reflections based on my current mood and planned tasks.

#### Acceptance Criteria

1. WHEN a user opens the journal interface THEN the system SHALL analyze their current mood, active todos, recent media, and recent activities
2. WHEN contextual data exists THEN the system SHALL generate relevant writing prompts or activity suggestions
3. WHEN displaying suggestions THEN the system SHALL show suggestions related to planned todos, current mood state, recent media consumption, or habit tracking
4. IF no contextual data exists THEN the system SHALL provide generic journal prompts
5. WHEN a user selects a suggestion THEN the system SHALL pre-populate the journal entry with the suggestion as a starting point

### Requirement 3

**User Story:** As a journal user, I want the AI analysis to accurately identify different types of content in my writing, so that my data is properly categorized across mood, todos, media, and habits.

#### Acceptance Criteria

1. WHEN analyzing text for mood THEN the system SHALL identify emotional indicators and sentiment with confidence scores
2. WHEN analyzing text for todos THEN the system SHALL identify action items, deadlines, and future-oriented statements
3. WHEN analyzing text for media THEN the system SHALL identify references to books, movies, music, podcasts, articles, or other content
4. WHEN analyzing text for habits THEN the system SHALL identify recurring activities, health behaviors, or routine mentions
5. WHEN analyzing text for activities THEN the system SHALL identify completed actions, events attended, or experiences had
6. WHEN confidence in extraction is low THEN the system SHALL flag items as uncertain for user review

### Requirement 4

**User Story:** As a journal user, I want control over what extracted data gets added to my app sections, so that I can maintain accuracy and privacy in my personal data.

#### Acceptance Criteria

1. WHEN extracted data is presented THEN the system SHALL show each item with its category and confidence level
2. WHEN reviewing extracted items THEN the user SHALL be able to edit the text of any extracted item before approval
3. WHEN reviewing extracted items THEN the user SHALL be able to change the category of any extracted item
4. WHEN reviewing extracted items THEN the user SHALL be able to delete any extracted item from the list
5. WHEN the user approves the final list THEN the system SHALL add items to their respective app sections
6. WHEN the user cancels the extraction process THEN the system SHALL save only the original journal entry

### Requirement 5

**User Story:** As a journal user, I want the suggestion system to learn from my patterns and preferences, so that I receive increasingly relevant and personalized prompts over time.

#### Acceptance Criteria

1. WHEN generating suggestions THEN the system SHALL consider the user's historical mood patterns
2. WHEN generating suggestions THEN the system SHALL consider the user's todo completion patterns and upcoming deadlines
3. WHEN generating suggestions THEN the system SHALL consider the user's media consumption preferences and recent activity
4. WHEN generating suggestions THEN the system SHALL consider the user's habit tracking goals and recent progress
5. WHEN a user frequently rejects certain types of suggestions THEN the system SHALL reduce the frequency of similar suggestions
6. WHEN a user frequently accepts certain types of suggestions THEN the system SHALL prioritize similar suggestions in the future