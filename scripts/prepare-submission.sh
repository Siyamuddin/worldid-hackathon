#!/bin/bash

# Prepare submission ZIP file for World Build Korea 2026 Hackathon
# This script creates a clean ZIP file excluding unnecessary files

set -e

echo "📦 Preparing submission ZIP file..."

# Get the project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

# Output file name
OUTPUT_FILE="worldid-rewards-submission.zip"
TEMP_DIR=$(mktemp -d)

echo "📁 Creating temporary directory: $TEMP_DIR"

# Copy project files to temp directory
echo "📋 Copying project files..."

# Copy all files except exclusions
rsync -av \
  --exclude='node_modules' \
  --exclude='venv' \
  --exclude='.env' \
  --exclude='.env.*' \
  --exclude='dist' \
  --exclude='__pycache__' \
  --exclude='*.pyc' \
  --exclude='.git' \
  --exclude='.gitignore' \
  --exclude='.DS_Store' \
  --exclude='*.log' \
  --exclude='logs' \
  --exclude='.cursor' \
  --exclude='*.pdf' \
  --exclude='worldid-rewards-submission.zip' \
  "$PROJECT_ROOT/" "$TEMP_DIR/worldid-rewards/"

# Create .gitignore in temp directory to document exclusions
cat > "$TEMP_DIR/worldid-rewards/.gitignore" << 'EOF'
# Excluded from submission
node_modules/
venv/
.env
.env.*
dist/
__pycache__/
*.pyc
.git/
*.log
logs/
.DS_Store
EOF

# Create submission info file
cat > "$TEMP_DIR/worldid-rewards/SUBMISSION_INFO.txt" << EOF
WorldID Reward Distribution System
World Build Korea 2026 Hackathon Submission

Submission Date: $(date)
Project: WorldID Reward Distribution System
Team: [Your Team Name]

Files Included:
- Source code (backend and frontend)
- Documentation (README, PRIVACY, PROBLEM, etc.)
- Configuration files
- Submission materials

Files Excluded:
- node_modules/ (dependencies - install with npm install)
- venv/ (Python virtual environment - create with python -m venv venv)
- .env (environment variables - see .env.example)
- dist/ (build output - generate with npm run build)
- __pycache__/ (Python cache)
- .git/ (version control)
- Log files

Setup Instructions:
1. Backend:
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   # Configure .env file
   uvicorn app.main:app --reload

2. Frontend:
   cd frontend
   npm install
   # Configure .env file
   npm run dev

3. Database:
   # Set up PostgreSQL database
   # Update DATABASE_URL in backend/.env

See README.md for detailed setup instructions.

For questions, contact: [Your Contact Information]
EOF

# Create ZIP file
echo "🗜️  Creating ZIP file..."
cd "$TEMP_DIR"
zip -r "$PROJECT_ROOT/$OUTPUT_FILE" worldid-rewards/ -q

# Clean up
rm -rf "$TEMP_DIR"

# Get file size
FILE_SIZE=$(du -h "$PROJECT_ROOT/$OUTPUT_FILE" | cut -f1)

echo "✅ Submission ZIP file created: $OUTPUT_FILE"
echo "📊 File size: $FILE_SIZE"
echo ""
echo "📝 Next steps:"
echo "   1. Review the ZIP file contents"
echo "   2. Test that all necessary files are included"
echo "   3. Upload to submission form"
echo ""
echo "⚠️  Remember to:"
echo "   - Exclude sensitive information (.env files)"
echo "   - Include all source code"
echo "   - Include documentation"
echo "   - Test the ZIP file before submitting"
