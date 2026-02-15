
try {
    console.log('Testing triple backticks escaping...');
    const s = `\`\`\`javascript`;
    console.log('Success! String length:', s.length);
    console.log('Content:', s);
} catch (e) {
    console.error('Failed:', e);
}
