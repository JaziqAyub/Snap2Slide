document.addEventListener('DOMContentLoaded', () => {
    // --- Elements ---
    const fileInput = document.getElementById('file-input');
    const dropArea = document.getElementById('drop-area');
    const previewThumbnail = document.getElementById('preview-thumbnail');
    const imagePreviewSrc = document.getElementById('image-preview-src');
    const clearUploadBtn = document.getElementById('clear-upload');
    const generateBtn = document.getElementById('generate-btn');
    const generateFaqBtn = document.getElementById('generate-faq-btn');
    const loader = document.querySelector('.loader');

    const emptyState = document.getElementById('empty-state');
    const outputContainer = document.getElementById('output-container');
    const copyAllBtn = document.getElementById('copy-all-btn');

    // Live Preview Elements
    const previewSection = document.getElementById('preview-section');
    const livePreviewFrame = document.getElementById('live-preview-frame');
    const refreshPreviewBtn = document.getElementById('refresh-preview-btn');

    let currentFile = null;
    let latestData = null; // Store latest generated data for copy buttons

    // --- GSAP Entrance ---
    const tl = gsap.timeline({ defaults: { ease: "power3.out", duration: 1 } });
    tl.from(".sidebar", { x: -30, opacity: 0 })
        .from(".main-content", { opacity: 0 }, "-=0.5")
        .from(".ambient-glows", { opacity: 0, duration: 2 }, "-=1");

    // --- Drag & Drop ---
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    dropArea.addEventListener('dragenter', () => dropArea.classList.add('drag-active'));
    dropArea.addEventListener('dragover', () => dropArea.classList.add('drag-active'));
    dropArea.addEventListener('dragleave', () => dropArea.classList.remove('drag-active'));

    dropArea.addEventListener('drop', (e) => {
        dropArea.classList.remove('drag-active');
        handleFiles(e.dataTransfer.files);
    });

    dropArea.addEventListener('click', () => fileInput.click()); // Click to upload

    fileInput.addEventListener('change', (e) => handleFiles(e.target.files));

    function handleFiles(files) {
        if (files.length > 0) {
            currentFile = files[0];
            showThumbnail(currentFile);
            generateBtn.disabled = false;
            if (generateFaqBtn) generateFaqBtn.disabled = false;
        }
    }

    function showThumbnail(file) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => {
            imagePreviewSrc.src = reader.result;
            previewThumbnail.classList.remove('hidden');
            gsap.fromTo(previewThumbnail, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.3 });
        };
    }

    // --- Clear Upload ---
    clearUploadBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent dropzone click
        currentFile = null;
        fileInput.value = '';
        previewThumbnail.classList.add('hidden');
        generateBtn.disabled = true;
        if (generateFaqBtn) generateFaqBtn.disabled = true;
    });

    // --- Generate Logic ---
    // --- Generate Logic ---
    const handleGenerate = async (mode) => {
        if (!currentFile) return;

        setLoading(true, mode);

        const formData = new FormData();
        formData.append('image', currentFile);
        formData.append('mode', mode);

        try {
            // Hide previous results if any
            if (!outputContainer.classList.contains('hidden')) {
                gsap.to(outputContainer, { opacity: 0, y: 10, duration: 0.2 });
                gsap.to(previewSection, { opacity: 0, y: 10, duration: 0.2 }); // Hide preview
            }

            const response = await fetch('/api/generate', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error('Failed');
            const data = await response.json();

            displayResults(data);

        } catch (error) {
            alert('Error: ' + error.message);
        } finally {
            setLoading(false, mode);
        }
    };

    generateBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        handleGenerate('slider');
    });

    if (generateFaqBtn) {
        generateFaqBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            handleGenerate('faq');
        });
    }

    function setLoading(isLoading, mode) {
        // Disable both buttons during load
        generateBtn.disabled = isLoading;
        if (generateFaqBtn) generateFaqBtn.disabled = isLoading;

        // Show loader on the active button
        const activeBtn = mode === 'faq' ? generateFaqBtn : generateBtn;
        const activeLoader = activeBtn.querySelector('.loader');

        if (isLoading) {
            if (activeLoader) activeLoader.classList.remove('hidden');
        } else {
            // Hide all loaders to be safe
            document.querySelectorAll('.loader').forEach(l => l.classList.add('hidden'));
            // Re-enable (if file still exists)
            if (currentFile) {
                generateBtn.disabled = false;
                if (generateFaqBtn) generateFaqBtn.disabled = false;
            }
        }
    }


    function displayResults(data) {
        latestData = data; // Store for copying

        emptyState.style.display = 'none';
        emptyState.style.display = 'none';
        outputContainer.classList.remove('hidden');
        previewSection.classList.remove('hidden'); // Show preview section

        // Handle backward compatibility (in case server not restarted)
        const cdns = data.cdns || '';
        const markup = data.markup || data.html; // Old 'html' contained both

        // Populate
        document.getElementById('code-html').textContent = (cdns ? cdns + '\n\n' : '') + markup;
        document.getElementById('code-css').textContent = data.css;
        document.getElementById('code-js').textContent = data.js;

        // Animate in
        gsap.fromTo(outputContainer,
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
        );

        gsap.fromTo(previewSection,
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.6, ease: "power2.out", delay: 0.2 }
        );

        // Stagger cards
        gsap.from(".code-card", {
            y: 20, opacity: 0, duration: 0.5, stagger: 0.1, delay: 0.1
        });

        updateLivePreview(data);
        showSuccessPopup();
    }

    // --- Copy Logic ---

    // Individual Copy Buttons
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.dataset.target;
            const text = document.getElementById(targetId).textContent;
            copyTextToClipboard(text, btn);
        });
    });

    // Copy All Button
    if (copyAllBtn) {
        copyAllBtn.addEventListener('click', () => {
            if (!latestData) return;

            const cdns = latestData.cdns || '';
            const markup = latestData.markup || latestData.html; // Fallback
            const css = latestData.css;
            const js = latestData.js;

            // Exact requested structure
            const allCode = `<!-- Libraries -->
${cdns}

<!-- HTML -->
${markup}

<!-- CSS -->
<style>
${css}
</style>

<!-- JS -->
<script>
${js}
</script>`;

            copyTextToClipboard(allCode, copyAllBtn);
        });
    }

    function copyTextToClipboard(text, btnElement) {
        navigator.clipboard.writeText(text).then(() => {
            // Visual feedback
            const originalText = btnElement.textContent; // Text only
            const originalHTML = btnElement.innerHTML; // Full HTML (icons etc)

            btnElement.style.color = 'var(--success)';

            if (btnElement.classList.contains('action-btn')) {
                btnElement.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg> Copied!`;
                btnElement.style.borderColor = 'var(--success)';
            } else {
                btnElement.textContent = 'Copied!';
            }

            setTimeout(() => {
                btnElement.style.color = '';
                if (btnElement.classList.contains('action-btn')) {
                    btnElement.innerHTML = originalHTML; // Restore icon
                    btnElement.style.borderColor = '';
                } else {
                    btnElement.textContent = 'Copy';
                }
            }, 2000);
        });
    }

    function updateLivePreview(data) {
        if (!livePreviewFrame) return;

        const cdns = data.cdns || '';
        const markup = data.markup || data.html;
        const css = data.css;
        const js = data.js;

        const fullHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Preview</title>
    <style>
        body { margin: 0; padding: 20px; font-family: sans-serif; }
    </style>
    ${cdns}
    <style>
        ${css}
    </style>
</head>
<body>
    ${markup}
    <script>
        ${js}
    <\/script>
</body>
</html>`;

        const doc = livePreviewFrame.contentWindow.document;
        doc.open();
        doc.write(fullHtml);
        doc.close();
    }

    // --- Success Popup Logic ---
    const successPopup = document.getElementById('success-popup');

    function showSuccessPopup() {
        successPopup.classList.remove('hidden');
        successPopup.classList.remove('fade-out');

        // Dismiss on manual scroll (after small delay to prevent immediate trigger)
        setTimeout(() => {
            window.addEventListener('scroll', hideSuccessPopupOnScroll, { once: true });
        }, 1000);
    }

    function hideSuccessPopup() {
        successPopup.classList.add('fade-out');
        setTimeout(() => {
            successPopup.classList.add('hidden');
            successPopup.classList.remove('fade-out');
        }, 500);
        window.removeEventListener('scroll', hideSuccessPopupOnScroll);
    }

    function hideSuccessPopupOnScroll() {
        hideSuccessPopup();
    }

    successPopup.addEventListener('click', () => {
        previewSection.scrollIntoView({ behavior: 'smooth' });
        hideSuccessPopup();
    });

    if (refreshPreviewBtn) {
        refreshPreviewBtn.addEventListener('click', () => {
            if (latestData) {
                // Add a small animation to show it refreshed
                gsap.fromTo(livePreviewFrame, { opacity: 0.5 }, { opacity: 1, duration: 0.3 });
                updateLivePreview(latestData);
            }
        });
    }

});
