const express = require('express');
const multer = require('multer');
const fs = require('fs');
const cors = require('cors');

require('dotenv').config();

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.static('public'));
app.use(express.json());

// File Upload Config
const upload = multer({ dest: 'uploads/' });

// Initialize OpenAI
const OpenAI = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// API Endpoint
app.post('/api/generate', upload.single('image'), async (req, res) => {
  console.log('Request received at /api/generate');
  if (!req.file) {
    console.log('No image uploaded');
    return res.status(400).json({ error: 'No image uploaded' });
  }

  try {
    console.log(`Processing with OpenAI: ${req.file.originalname}`);
    console.log('File path:', req.file.path);

    // Read file and convert to base64
    console.log('Reading file...');
    const fileBuffer = fs.readFileSync(req.file.path);
    console.log('File read. Buffer length:', fileBuffer.length);

    const base64Image = fileBuffer.toString('base64');
    const dataUrl = `data:${req.file.mimetype};base64,${base64Image}`;
    console.log('Data URL prepared.');

    const mode = req.body.mode || 'slider';
    console.log(`Generating code for mode: ${mode}`);

    let prompt = '';

    const sliderPrompt = `You are an expert web developer specializing in high-fidelity Slick.js sliders. Analyze this screenshot of a UI slider/carousel with extreme attention to visual structure and layout.

Generate production-ready HTML, CSS, and JavaScript (jQuery + Slick.js) to replicate the design as closely as possible.

Requirements:
1. Styling Fidelity:
- Colors: Approximate the dominant visible colors and express them as hex values; never default to pure black unless the design is clearly black.
- Typography: Match font weight hierarchy (bold, semibold, regular), font sizes, and line-heights as closely as possible; use system fonts when the exact font is unclear.
- Borders & Shadows: Accurately infer border-radius and shadow depth (subtle vs strong).
- Spacing: Preserve visual whitespace and padding proportions; avoid cramped layouts.
- Spacing between testimonial cards must be exactly 8px and must be implemented in a way that works with Slick.js layouts.


2. Images & Aspect Ratios:
- Use https://placehold.co/{width}x{height} for all images.
- Infer the closest common aspect ratio visible in the design (e.g. 1:1, 4:3, 16:9) and size placeholders accordingly.
- Apply object-fit: cover and border-radius where visible.

3. Robust Slick Logic:
- Wrap initialization in $(document).ready(...)
- Calculate totalSlides before initializing.
- Use the following logic pattern and adjust slidesToShow to match the design:

var $slider = $('.your-slider-class');
var totalSlides = $slider.children().length;

if (totalSlides > 1) {
  var slidesToShow = 3;

  if (totalSlides <= slidesToShow) {
    slidesToShow = totalSlides - 1;
    if (slidesToShow < 1) slidesToShow = 1;
  }

  $slider.slick({
    slidesToShow: slidesToShow,
    autoplay: true,
    autoplaySpeed: 1000,
    dots: true,
    arrows: true,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: Math.min(2, totalSlides) } },
      { breakpoint: 640, settings: { slidesToShow: 1 } }
    ]
  });
}

4. Dependencies:
- Return valid CDN <link> and <script> tags for jQuery and Slick.js in the "cdns" field.

5. Output Rules:
- The "markup" field must contain only the slider wrapper and slides.
- Do not include <html>, <body>, or CDN tags inside markup.
- Do not include explanations, markdown, or comments.
- Format all HTML, CSS, and JavaScript using clean multi-line formatting with indentation and line breaks exactly as a human developer would write it; never return minified or single-line code.


Return ONLY valid JSON in this exact schema:
{
  "cdns": "string",
  "markup": "string",
  "css": "string",
  "js": "string"
}`;

    const faqPrompt = `You are an expert web developer specializing in high-fidelity FAQ/Accordion components. Analyze this screenshot of an FAQ section with extreme attention to visual structure and layout.

Generate production-ready HTML, CSS, and JavaScript (jQuery) to replicate the design as closely as possible.

Requirements:
1. Styling Fidelity:
- Colors: Approximate the dominant visible colors and express them as hex values.
- Typography: Match font weight hierarchy (bold questions, regular answers).
- Borders & Shadows: Accurately infer border-radius and styling of accordion items.
- Spacing: Preserve visual whitespace and padding proportions.

2. Structure & Logic:
- Generate semantic HTML: .accordion-container, .accordion-item, .accordion-header, .accordion-content.
- **IMPORTANT**: The icon/arrow must be an <img> tag with class "icon". Use this specific SVG URL for a chevron down: "https://api.iconify.design/lucide:chevron-down.svg".
    - If one item appears open in the screenshot, make that item open by default (or the first one if unsure).
- Implement jQuery logic for the accordion effect:
      - Click on header toggles the content(slideToggle).
    - Close other open items if appropriate(accordion behavior) or allow multiple open(if proper for the design).
    - Toggle an 'active' class on the header.
- **CSS Animation Requirements**:
    - The ".icon" must have "transition: transform 0.3s ease;".
    - When the item is active (".accordion-header.active .icon"), apply "transform: rotate(180deg);".
    - Default state: arrow points down. Active state: arrow points up.

3. Output Rules:
    - The "markup" field must contain only the accordion container and items.
- Do not include < html >, <body>, or CDN tags inside markup.
      - Do not include explanations, markdown, or comments.
      - Format all HTML, CSS, and JavaScript using clean multi-line formatting.

      Return ONLY valid JSON in this exact schema:
      {
        "cdns": "string", // Return jQuery CDN here
      "markup": "string",
      "css": "string",
      "js": "string"
}`;

    if (mode === 'faq') {
      prompt = faqPrompt;
    } else {
      prompt = sliderPrompt;
    }

    console.log('Prompt prepared. Length:', prompt.length);
    console.log('Initializing OpenAI completion...');

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: {
                url: dataUrl,
              },
            },
          ],
        },
      ],
      response_format: { type: "json_object" },
    });

    console.log("OpenAI Response received.");

    const content = completion.choices[0].message.content;
    const codeData = JSON.parse(content);

    // Hardcode reliable CDNs
    codeData.cdns = `<!-- jQuery -->
      <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
      <!-- Slick Carousel -->
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick.css" />
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick-theme.css" />
      <script src="https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick.min.js"></script>`;

    // Cleanup
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

    res.json(codeData);

  } catch (error) {
    console.error("OpenAI Error:", error);
    res.status(500).json({ error: 'AI Generation Failed', details: error.message });

    // Cleanup on error
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});