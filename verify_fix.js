
const fs = require('fs');

async function test() {
    try {
        // Create a dummy file
        fs.writeFileSync('test_image.png', 'fake image content');

        const formData = new FormData();
        const fileBuffer = fs.readFileSync('test_image.png');
        const blob = new Blob([fileBuffer], { type: 'image/png' });
        formData.append('image', blob, 'test_image.png');

        console.log('Sending request...');
        const res = await fetch('http://localhost:3000/api/generate', {
            method: 'POST',
            body: formData
        });

        console.log('Response status:', res.status);
        const text = await res.text();
        console.log('Response body:', text);

    } catch (err) {
        console.error('Test failed:', err);
    }
}

test();
