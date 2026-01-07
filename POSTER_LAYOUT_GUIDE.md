# WealthWise - Poster Layout Guide
## Print Size: A1 or A0 Recommended

---

## POSTER LAYOUT (Top to Bottom)

```
+------------------------------------------------------------------+
|                                                                    |
|                         [LOGO + TITLE]                            |
|                          WealthWise                                |
|            AI-Powered Financial Planner for India                 |
|                                                                    |
+------------------------------------------------------------------+
|                                                                    |
|   [LEFT COLUMN - 40%]          |    [RIGHT COLUMN - 60%]         |
|                                 |                                  |
|   THE PROBLEM                   |    ARCHITECTURE DIAGRAM         |
|   +------------------------+    |    +------------------------+   |
|   | - 76% Indians do not   |    |    |   [Draw Architecture]   |   |
|   |   track expenses       |    |    |                        |   |
|   | - Apps are English-only|    |    |    User --> Next.js    |   |
|   | - Need app downloads   |    |    |           |            |   |
|   | - Require internet     |    |    |     MongoDB  Gemini AI |   |
|   +------------------------+    |    +------------------------+   |
|                                 |                                  |
+------------------------------------------------------------------+
|                                                                    |
|                    [6 FEATURE BOXES - 2 ROWS]                     |
|                                                                    |
|   +-----------+  +-----------+  +-----------+                     |
|   |  AI Budget |  | Voice    |  | 10       |                     |
|   |  Generator |  | Expense  |  | Languages|                     |
|   +-----------+  +-----------+  +-----------+                     |
|                                                                    |
|   +-----------+  +-----------+  +-----------+                     |
|   |  Offline  |  | Goal     |  | Debt     |                     |
|   |  Mode     |  | Tracking |  | Manager  |                     |
|   +-----------+  +-----------+  +-----------+                     |
|                                                                    |
+------------------------------------------------------------------+
|                                                                    |
|   [TECH STACK]                  |    [SECURITY]                   |
|   +------------------------+    |    +------------------------+   |
|   | Next.js | React | MongoDB|  |    | Passwords: Hashed     |   |
|   | Gemini AI | Tailwind CSS|   |    | OTP: 6-digit, 10 min  |   |
|   | NextAuth | Vercel       |   |    | Data: AES-256        |   |
|   +------------------------+    |    | Transport: HTTPS      |   |
|                                 |    +------------------------+   |
|                                                                    |
+------------------------------------------------------------------+
|                                                                    |
|   [SCREENSHOTS - 3 PANELS]                                        |
|   +---------------+  +---------------+  +---------------+          |
|   | Dashboard     |  | Add Expense   |  | Budget View   |          |
|   | Screenshot    |  | Screenshot    |  | Screenshot    |          |
|   +---------------+  +---------------+  +---------------+          |
|                                                                    |
+------------------------------------------------------------------+
|                                                                    |
|   [IMPACT & NUMBERS]            |    [TEAM INFO]                  |
|   +------------------------+    |    +------------------------+   |
|   | 42 API Endpoints       |    |    | Team Name              |   |
|   | 10 Languages           |    |    | Member Names           |   |
|   | 15+ Cities Data        |    |    | School/College         |   |
|   | 100% FREE              |    |    | Email                  |   |
|   +------------------------+    |    +------------------------+   |
|                                                                    |
+------------------------------------------------------------------+
|                                                                    |
|            [QR CODE - Link to Live App]     [Logo]                |
|                                                                    |
+------------------------------------------------------------------+
```

---

## SECTION DETAILS

### 1. HEADER SECTION
- **Logo**: WealthWise logo (if you have one)
- **Title**: "WealthWise" in large, bold font
- **Tagline**: "AI-Powered Financial Planner for India"
- **Colors**: Use violet/purple as primary (matches app theme)

### 2. PROBLEM SECTION
Use icons for visual appeal:
```
[Icon: Person with X] 76% Indians do not track expenses
[Icon: Language]      85% apps are English-only
[Icon: Download]      60% abandon apps needing downloads
[Icon: No Wifi]       45% lack reliable internet
```

### 3. ARCHITECTURE DIAGRAM
Draw this clearly:
```
        +-------------+
        |    USER     |
        | (Any Device)|
        +------+------+
               |
               v
     +---------+---------+
     |      NEXT.JS      |
     |  +-----+  +-----+ |
     |  | UI  |  | API | |
     |  +-----+  +-----+ |
     +---------+---------+
               |
       +-------+-------+
       |               |
       v               v
  +--------+     +--------+
  |MONGODB |     | GEMINI |
  | (Data) |     |  (AI)  |
  +--------+     +--------+
```

### 4. FEATURE BOXES
For each feature box:
- **Icon** at top (use simple icons)
- **Title** in bold
- **One-line description**

Example:
```
+------------------+
|   [Microphone]   |
|                  |
| Voice Expense    |
| Entry            |
|                  |
| Say "spent 500   |
| on Swiggy" -     |
| auto-recorded!   |
+------------------+
```

### 5. TECH STACK SECTION
Use technology logos if possible:
```
+--------------------------------------------+
| [Next.js logo] [React logo] [MongoDB logo] |
| [Tailwind logo] [Gemini logo] [Vercel logo]|
+--------------------------------------------+
```

### 6. SECURITY SECTION
Use shield icons:
```
[Shield] Passwords: bcryptjs hashing
[Shield] OTP: 6-digit, 10-min expiry
[Shield] Data: AES-256 encryption
[Shield] Transport: HTTPS/TLS
```

### 7. SCREENSHOTS
Take these screenshots from your app:
1. **Dashboard** - Show charts and statistics
2. **Add Expense** - Show voice input button
3. **Budget View** - Show AI-generated budget

Ensure screenshots are:
- High resolution (1080p minimum)
- Light mode for print visibility
- No personal data visible

### 8. IMPACT NUMBERS
Use large, bold numbers:
```
+--------+--------+--------+--------+
|   42   |   10   |  15+   |  FREE  |
|  APIs  |  Lang  | Cities |        |
+--------+--------+--------+--------+
```

### 9. QR CODE
Generate QR code linking to:
- Your live production URL
- Use qr-code-generator.com

---

## COLOR SCHEME

| Element | Color | Hex Code |
|---------|-------|----------|
| Primary | Violet | #8B5CF6 |
| Secondary | Purple | #A855F7 |
| Accent | Emerald | #10B981 |
| Background | White | #FFFFFF |
| Text | Dark Gray | #1F2937 |
| Muted | Light Gray | #6B7280 |

---

## FONTS (Recommended)

| Use | Font | Size (A1) |
|-----|------|-----------|
| Title | Poppins Bold | 72-84pt |
| Section Headings | Poppins SemiBold | 36-48pt |
| Body Text | Inter Regular | 24-28pt |
| Numbers | Poppins Bold | 48-60pt |
| Captions | Inter Light | 18-20pt |

---

## MATERIALS CHECKLIST

For printing the poster:
- [ ] A1 or A0 size poster paper (matte finish preferred)
- [ ] High-res screenshots (export from app)
- [ ] QR code image
- [ ] Technology logos (download from official sites)
- [ ] Team photo (optional)

---

## POSTER CREATION TOOLS

| Tool | Purpose | Free? |
|------|---------|-------|
| Canva | Easy poster design | Yes |
| Figma | Professional design | Yes |
| Google Slides | Simple layouts | Yes |
| PowerPoint | Familiar interface | Yes |

**Canva Template Search:** "Technology Project Poster" or "Science Fair Poster"

---

## TIPS FOR IMPACT

1. **Less text, more visuals** - Judges scan quickly
2. **Use icons** - Easier to understand than paragraphs
3. **High contrast** - Violet on white is readable
4. **QR code** - Let judges scan and see live demo
5. **Screenshots** - Show real product, not mockups
6. **Numbers stand out** - Make statistics large and bold
7. **Leave white space** - Do not crowd the poster

---

## WHAT JUDGES LOOK FOR

| Criteria | How to Show It |
|----------|----------------|
| **Innovation** | AI + Indian context section |
| **Technical Depth** | Architecture diagram |
| **Completeness** | 6 features with working demo |
| **Impact** | Problem + statistics |
| **Presentation** | Clean, organized poster |

---

## POSTER MISTAKES TO AVOID

- Too much text (judges will not read paragraphs)
- Low-resolution images (blurry looks unprofessional)
- No live demo link (QR code is essential)
- Missing team information
- Cluttered layout (white space is good)
- Using too many colors (stick to 3-4 max)

---

*Print this guide and use it while designing your poster!*
