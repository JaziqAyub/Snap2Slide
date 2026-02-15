
const fs = require('fs');

try {
    console.log('Starting repro...');
    const req = { file: { mimetype: 'image/png' } };
    const base64Image = 'testbase64';

    const dataUrl = `data:${req.file.mimetype};base64,${base64Image}`;
    console.log('Data URL prepared.');

    const prompt = `You are an expert web developer specializing in creating pixel-perfect Slick.js sliders from design screenshots.

Analyze this screenshot and generate production-ready code that replicates it as closely as possible.

VISUAL ANALYSIS REQUIREMENTS:
1. Colors: Extract exact hex values from the design. Never default to pure black (#000000) unless explicitly black in the design.

2. Typography:
   - Match font weight hierarchy (100-900)
   - Replicate font sizes and line heights proportionally
   - Use system font stack: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif

3. Layout & Spacing:
   - Preserve exact spacing ratios between elements
   - For testimonial cards: use approximately 16-24px horizontal gap
   - Match padding inside cards/slides
   - Replicate vertical rhythm

4. Visual Details:
   - Border radius: match curves precisely
   - Shadows: replicate depth and color (use rgba for transparency)
   - Borders: match thickness and color
   - Background colors/gradients

5. Images:
   - Use https://placehold.co/{width}x{height}
   - Infer aspect ratio from design (1:1, 4:3, 16:9, etc.)
   - Apply object-fit: cover
   - Match border-radius on images

6. Slider Components:
   - Analyze number of visible slides
   - Match arrow button styling (color, size, position)
   - Match dot/pagination styling
   - Note any hover states or transitions

TECHNICAL REQUIREMENTS:

1. Slick.js Configuration:
   - Detect optimal slidesToShow from design
   - Enable infinite loop if design suggests it
   - Set appropriate autoplay speed (3-5 seconds)
   - Include responsive breakpoints:
     * Desktop (>1024px): full slidesToShow
     * Tablet (640-1024px): reduce by 1-2 slides
     * Mobile (<640px): usually 1 slide

2. JavaScript Pattern:
\```javascript
    $(document).ready(function () {
      var $slider = $('.slider');
      var totalSlides = $slider.children().length;

      if (totalSlides > 1) {
        // Calculate slidesToShow based on design
        var slidesToShow = X; // infer from screenshot

        // Adjust if not enough slides
        if (totalSlides < slidesToShow) {
          slidesToShow = totalSlides;
        }

        $slider.slick({
          slidesToShow: slidesToShow,
          slidesToScroll: 1,
          infinite: totalSlides > slidesToShow,
          autoplay: true,
          autoplaySpeed: 4000,
          dots: true,
          arrows: true,
          cssEase: 'ease-in-out',
          speed: 500,
          responsive: [
            {
              breakpoint: 1024,
              settings: {
                slidesToShow: Math.max(1, slidesToShow - 1),
                slidesToScroll: 1
              }
            },
            {
              breakpoint: 640,
              settings: {
                slidesToShow: 1,
                slidesToScroll: 1,
                arrows: false
              }
            }
          ]
        });
      }
    });
    \```

3. CSS Requirements:
   - Use modern CSS (flexbox/grid where appropriate)
   - Include :hover states for interactive elements
   - Add smooth transitions (0.3s ease)
   - Custom style Slick arrows and dots to match design
   - Ensure responsive behavior

4. Dependencies (CDNs):
   - jQuery 3.6.0 or higher
   - Slick Carousel 1.8.1
   - Include both CSS and JS CDN links

OUTPUT FORMAT:

Return ONLY valid JSON with NO markdown code blocks, NO backticks, NO explanations.

Schema:
{
  "cdns": "Complete HTML for all CDN links (both CSS and JS)",
  "markup": "Only the slider container and slides HTML (no <html>, <head>, <body>)",
  "css": "All styles including custom Slick overrides",
  "js": "Complete jQuery + Slick initialization code"
}

CRITICAL RULES:
- Return ONLY the JSON object
- Do NOT wrap in \```json or\``` blocks
- Do NOT include comments in code
- Do NOT add explanatory text before/after JSON
- Ensure all code is production-ready and tested patterns`;

    console.log('Prompt created successfully. Length:', prompt.length);

} catch (e) {
    console.error('Error:', e);
}
