# 🧶 Yarn Penguin Rails Backend API

Ruby on Rails API-only backend for the Yarn Penguin AI World game.

## 🚀 Quick Start

### Prerequisites
- Ruby 3.2+
- Bundler 2.0+
- SQLite3

### Installation

```bash
cd rails-backend
bundle install
```

### Database Setup

```bash
# Create database
bin/rails db:create

# Run migrations
bin/rails db:migrate

# Seed database (optional)
bin/rails db:seed
```

### Running the Server

```bash
# Development server (port 3000 by default)
bin/rails server

# Or specify a different port
bin/rails server -p 5000
```

The API will be available at `http://localhost:3000`

## 📋 API Endpoints

### Health Check
```
GET /api/v1/health
```
Returns server health status.

**Response:**
```json
{
  "status": "OK",
  "message": "🧶 Yarn Penguin Rails API Server is running!",
  "timestamp": "2025-12-29T12:00:00.000Z",
  "version": "1.0.0"
}
```

### Game Status
```
GET /api/v1/game/status
```
Returns current game state and penguin count.

**Response:**
```json
{
  "penguins_count": 2,
  "penguins": [
    {
      "id": 1,
      "name": "Fluffy",
      "position": { "x": 100.0, "y": 200.0 },
      "type": "yarn",
      "behavior": "exploring",
      "happiness": 75,
      "energy": 60
    }
  ],
  "game_state": "active",
  "timestamp": "2025-12-29T12:00:00.000Z"
}
```

### Create Penguin
```
POST /api/v1/game/penguins
```
Creates a new penguin.

**Request Body:**
```json
{
  "penguin": {
    "name": "New Penguin",
    "x": 150.0,
    "y": 250.0,
    "penguin_type": "yarn",
    "behavior": "collecting"
  }
}
```

## 🧪 Testing

### Run All Tests
```bash
bundle exec rspec
```

### Run Specific Tests
```bash
# Model tests
bundle exec rspec spec/models

# Request tests
bundle exec rspec spec/requests
```

## 🔍 Code Quality

### Linting (RuboCop)
```bash
bundle exec rubocop
```

### Security Scanning
```bash
# Brakeman - Static analysis security scanner
bundle exec brakeman

# Bundler Audit - Check for vulnerable dependencies
bundle exec bundler-audit check --update
```

## 🚀 Deployment

### Production Build

```bash
RAILS_ENV=production bundle install
RAILS_ENV=production bin/rails db:migrate
```

### Start Production Server

```bash
RAILS_ENV=production bin/rails server
```

## 📚 Technologies

- **Framework:** Ruby on Rails 8.1 (API-only)
- **Database:** SQLite3 (Development)
- **Testing:** RSpec 7.0
- **Code Quality:** RuboCop
- **Security:** Brakeman, Bundler Audit
- **CORS:** Rack CORS

## 📝 License

MIT License - See main project LICENSE file.
