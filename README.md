# Mystyc.app
[Live Site](https://mystyc.app)
Full-stack astrology application providing personalized birth charts, daily horoscopes, and AI-generated astrological insights.


## Overview
Mystyc is a comprehensive astrology platform consisting of three main components: a NestJS backend server, a React/Next.js client application, and a shared TypeScript library. The platform delivers personalized astrological experiences through precise astronomical calculations, AI-powered content generation, and an intuitive user interface.

---

## Mystyc Server
Backend API for the Mystyc astrology platform. Provides personalized birth charts, daily horoscopes, and AI-generated astrological insights.

### Core Features

**Astrology Engine**
* Swiss Ephemeris integration for precise astronomical calculations
* Birth chart generation with planetary positions and interactions
* Daily cosmic energy analysis compared to individual birth charts
* Comprehensive astrological knowledge base (signs, planets, houses, aspects)

**AI Content Generation**
* OpenAI integration for personalized horoscope text
* Birth chart summaries and planetary interaction explanations
* Usage tracking and budget management

**User Management**
* Firebase Authentication with role-based access control
* Subscription tiers (Free/Plus/Pro) with Stripe integration
* Multi-device support with push notifications via FCM

**Scheduling & Notifications**
* Timezone-aware cron jobs for global horoscope delivery
* Event-driven notification system
* Astronomical events tracking (moon phases, mercury retrograde, etc.)

**Admin System**
* User management and analytics
* Content moderation and subscription management
* System monitoring and usage statistics

### Tech Stack
* **Framework**: NestJS with TypeScript
* **Database**: MongoDB with Mongoose
* **Authentication**: Firebase Admin SDK
* **Payments**: Stripe
* **AI**: OpenAI GPT-4
* **Astronomy**: Swiss Ephemeris
* **Notifications**: Firebase Cloud Messaging

### Architecture
The application follows a modular architecture with clear separation of concerns:
* `astrology/` - Core astronomical calculations and astrological knowledge
* `auth/` - Authentication middleware and validation
* `auth-events/` - Authentication event handling and user lifecycle
* `users/` - User profiles and subscription management
* `horoscopes/` - Daily horoscope generation and cosmic energy analysis
* `notifications/` - Push notification system with timezone support
* `schedules/` - Cron job management and execution tracking
* `openai/` - AI content generation with usage monitoring
* `payments/` - Payment processing and subscription logic
* `stripe/` - Stripe integration and webhook handling
* `devices/` - Device registration and push notification targeting
* `common/` - Shared utilities and configuration

### Key Components
**Astrology Service**: Calculates precise planetary positions using Swiss Ephemeris, generates birth charts, and analyzes planetary interactions with compatibility scoring.

**Horoscope Service**: Compares daily cosmic positions against user birth charts to generate personalized energy readings and actionable insights.

**Scheduling System**: Runs timezone-aware cron jobs to deliver daily horoscopes at appropriate local times for users worldwide.

**AI Integration**: Uses OpenAI to transform raw astrological data into readable, personalized content with built-in cost controls and usage tracking.

---

## Mystyc Client
Frontend web application for the Mystyc astrology platform. Provides an intuitive interface for users to explore their birth charts, receive daily insights, and discover astrological compatibility.

### Core Features

**Personalized Dashboard**
* Daily horoscope delivery with cosmic energy analysis
* Interactive birth chart visualization with planetary aspects
* Weekly energy trends and calendar integration
* Real-time insights based on current planetary transits

**User Onboarding**
* Multi-step wizard for collecting birth information
* Places API integration for accurate birth location data
* Automatic birth chart generation and profile creation
* Guided tour of platform features

**Astrological Tools**
* Detailed birth chart analysis with planetary interactions
* Relationship compatibility calculator between any two signs
* Comprehensive astrology reference library (signs, planets, houses)
* Interactive constellation visualizations

**Calendar & Events**
* Monthly view with moon phases and astronomical events
* Daily energy breakdowns with planetary influences
* Upcoming cosmic events and their personal impact
* Historical energy tracking and trends

### Tech Stack
* **Framework**: Next.js 14 with TypeScript
* **Styling**: Tailwind CSS with custom design system
* **Forms**: React Hook Form with Zod validation
* **Charts**: Recharts for data visualization
* **Maps**: Google Places API for location services
* **State Management**: Zustand for client-side caching
* **Authentication**: Firebase Auth integration

### Architecture
The client follows a component-based architecture with clear feature separation:

* `app/` - Next.js app router and page structure
* `components/` - Reusable UI components organized by domain:
  * `auth/` - Authentication flows and session management
  * `mystyc/` - Core astrology application features:
    * `pages/insights/` - Daily horoscope and energy analysis dashboard
    * `pages/profile/` - Birth chart exploration and planetary interactions
    * `pages/relationships/` - Sign compatibility and relationship analysis
    * `pages/calendar/` - Astronomical events and energy calendar
    * `pages/astrology/` - Reference library and educational content
    * `pages/onboard/` - Multi-step user setup and profile creation
  * `admin/` - Administrative interface for platform management
  * `website/` - Marketing and public-facing pages
* `hooks/` - Custom React hooks and business logic
* `server/` - Server actions and API integration
* `store/` - Client-side state management
* `schemas/` - Form validation and type definitions
* `interfaces/` - TypeScript type definitions
* `util/` - Utility functions and helpers

### Key Components

**Responsive Design**: Mobile-first approach with adaptive navigation that transforms from bottom tabs on mobile to sidebar on desktop.

**Interactive Visualizations**: Custom star chart renderer, constellation displays, and energy gauges built with SVG and canvas for smooth animations.

**Smart Caching**: Client-side data store that caches astrology calculations and daily insights to minimize API calls and improve performance.

**Progressive Enhancement**: Works offline for cached content with graceful degradation when network is unavailable.

---

## Mystyc Common
Shared TypeScript library containing interfaces, Zod schemas, and type definitions used across both server and client applications. Ensures type safety and consistency between frontend and backend implementations.

### Features
* **Type Definitions**: Comprehensive TypeScript interfaces for all astrological entities
* **Validation Schemas**: Zod schemas for runtime type checking and API validation
* **Shared Constants**: Astrological constants, enums, and reference data
* **Utility Types**: Helper types for common operations across both applications

### Key Components
* User profile and authentication types
* Astrological calculation interfaces (planets, signs, houses, aspects)
* Horoscope and energy analysis types
* API request/response schemas
* Subscription and billing interfaces

## Deployment
The server is designed for production deployment with comprehensive logging, error handling, rate limiting, and security measures. The client is optimized for static deployment on platforms like Vercel or Netlify.
