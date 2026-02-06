# World Build Korea 2026 - Submission Checklist

## Submission Deadline

**Submission Opens**: February 3, 2026, 21:00  
**Submission Deadline**: February 7, 2026, 13:00  
⚠️ **Late submissions are NOT accepted**

## Submission Link

https://forms.gle/24sfFCZ1Xa4PZWQQ6

## Required Submission Materials

### 1. Source Code (ZIP file)

**Requirements**:
- All source code in a ZIP file
- Exclude: `node_modules/`, `venv/`, `.env`, `dist/`, `__pycache__/`, `.git/`
- Include: All source files, documentation, README

**Preparation**:
```bash
# Run the preparation script
./scripts/prepare-submission.sh

# This will create: worldid-rewards-submission.zip
```

**File Name**: `worldid-rewards-submission.zip`

### 2. Mini-App Demo Video

**Requirements**:
- ✅ Recorded on a **real iOS or Android device**
- ✅ Must show the app **actually running**
- ✅ Show complete flow: onboarding → verification → action
- ✅ Demonstrate duplicate prevention
- ✅ Show privacy indicators

**Recommended Length**: 2-3 minutes

**Script**: See `docs/demo-script.md` for detailed script

**File Format**: MP4 or MOV

**File Name**: `worldid-rewards-demo.mp4`

### 3. Presentation Deck

**Requirements**:
- ✅ Google Slides only
- ✅ View access must be **public**
- ✅ Maximum 6 slides (mandatory order)
- ✅ English slides recommended

**Slide Structure** (See `presentation/presentation-template.md`):
1. Problem (One Sentence)
2. Solution (One Sentence + Visual)
3. Why Human-Only / Why World ID
4. Demo (GIF/Video)
5. Privacy & Risk Mitigation
6. Future Plans (Including Go-to-Market)

**Template**: See `presentation/presentation-template.md`

**File Name**: Share Google Slides link (public access)

### 4. Mini-App Access QR Code

**Requirements**:
- ✅ Judges must be able to access and test the mini-app directly
- ✅ QR code must be accessible and working
- ✅ Mini-app must be deployed to a public URL
- ✅ Must work on both iOS and Android devices

**Deployment Options**:

**Option 1: Vercel (Recommended)**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy frontend
cd frontend
vercel

# Follow prompts and deploy
# Get deployment URL (e.g., https://worldid-rewards.vercel.app)
```

**Option 2: Netlify**
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Build frontend
cd frontend
npm run build

# Deploy
netlify deploy --prod --dir=dist
```

**Option 3: GitHub Pages**
```bash
# Build frontend
cd frontend
npm run build

# Deploy to GitHub Pages
# Configure in repository settings
# URL: https://yourusername.github.io/worldid-rewards
```

**Option 4: Docker + Cloud Provider**
```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy to cloud provider (AWS, GCP, Azure, etc.)
# Configure domain and SSL
```

**Environment Variables for Production**:
```bash
# Frontend (.env.production)
VITE_API_BASE_URL=https://your-backend-url.com
VITE_WORLDID_APP_ID=your_worldid_app_id
VITE_WORLDID_ACTION=worldid-reward-claim

# Backend (.env)
DATABASE_URL=postgresql://...
WORLDID_APP_ID=your_worldid_app_id
WORLDID_ACTION=worldid-reward-claim
WORLDID_VERIFY_URL=https://developer.worldcoin.org/api/v1/verify
ETHEREUM_RPC_URL=your_rpc_url
```

**QR Code Generation**:

1. **Online QR Code Generator**:
   - Visit: https://www.qr-code-generator.com/
   - Enter your deployed URL
   - Download QR code image
   - Test by scanning with phone

2. **Command Line** (if you have qrcode package):
   ```bash
   npm install -g qrcode
   qrcode https://your-deployed-url.com -o qr-code.png
   ```

3. **Include in Presentation**:
   - Add QR code to Slide 4 (Demo) or create separate slide
   - Ensure QR code is large enough to scan
   - Test QR code before submission

**Testing QR Code**:
1. Generate QR code
2. Scan with iOS device (Camera app)
3. Scan with Android device (Camera app or QR scanner)
4. Verify app loads correctly
5. Test complete flow (connect wallet, verify, claim)

**File Name**: `qr-code.png` or include in presentation

**Important Notes**:
- ⚠️ Ensure backend API is also deployed and accessible
- ⚠️ Test CORS settings if frontend and backend are on different domains
- ⚠️ Use HTTPS (required for WorldID)
- ⚠️ Test on real devices before submitting

## Pre-Submission Checklist

### Code & Documentation
- [ ] Source code ZIP file prepared (exclude node_modules, venv, .env)
- [ ] README.md is complete and clear
- [ ] PRIVACY.md documents privacy-by-design
- [ ] PROBLEM.md clearly states the problem
- [ ] All documentation is complete

### Demo Video
- [ ] Video recorded on real iOS/Android device
- [ ] Shows complete user flow
- [ ] Demonstrates duplicate prevention
- [ ] Shows privacy indicators
- [ ] Video is clear and under 3 minutes

### Presentation
- [ ] 6 slides created in Google Slides
- [ ] Slides follow mandatory order
- [ ] Problem statement is one clear sentence
- [ ] Solution includes visual (diagram/mockup)
- [ ] Why WorldID section clearly explains dependency
- [ ] Demo slide includes GIF or video
- [ ] Privacy & Risk Mitigation slide is complete
- [ ] Future Plans slide includes go-to-market
- [ ] Google Slides set to public access
- [ ] Link is accessible and working

### Mini-App
- [ ] Mini-app deployed to public URL
- [ ] QR code generated and tested
- [ ] QR code accessible from mobile device
- [ ] Mini-app works on iOS and Android
- [ ] All features functional

### Testing
- [ ] Tested on iOS device
- [ ] Tested on Android device
- [ ] QR code scanning works
- [ ] WorldID verification works
- [ ] Duplicate prevention works
- [ ] All endpoints functional

## Submission Steps

1. **Prepare Source Code ZIP**
   ```bash
   ./scripts/prepare-submission.sh
   ```

2. **Upload Demo Video**
   - Upload to YouTube (unlisted) or Google Drive
   - Get shareable link

3. **Create Presentation**
   - Use `presentation/presentation-template.md` as guide
   - Create in Google Slides
   - Set to public access
   - Get shareable link

4. **Deploy Mini-App**
   - Deploy to public hosting
   - Test QR code
   - Verify accessibility

5. **Fill Submission Form**
   - Go to: https://forms.gle/24sfFCZ1Xa4PZWQQ6
   - Upload source code ZIP
   - Provide demo video link
   - Provide presentation link
   - Provide QR code or mini-app URL

## Important Notes

⚠️ **Missing files, broken links, or inaccessible QR codes may result in disqualification.**

⚠️ **Test everything before submitting!**

⚠️ **Submit early to avoid last-minute issues!**

## Post-Submission

- Keep mini-app accessible until judging is complete
- Be ready for Q&A (2 minutes after 5-minute presentation)
- Have backup links ready in case of issues

## Help & Support

If you encounter issues:
1. Check this checklist
2. Review hackathon requirements document
3. Test all components before submitting
4. Have backups ready

## Good Luck! 🚀
