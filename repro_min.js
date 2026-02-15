
try {
    console.log('Test 1: Simple string');
    const s1 = `Simple string`;
    console.log('Test 1 passed');

    console.log('Test 2: Escaped backticks');
    const s2 = `\```json`;
    console.log('Test 2 passed');

    console.log('Test 3: Full prompt start');
    const s3 = `You are an expert...`;
    console.log('Test 3 passed');

    console.log('Test 4: The suspected problematic part');
    const s4 = `
    Some text
    \```javascript
    code
    \```
    `;
    console.log('Test 4 passed');

} catch (e) {
    console.error('Caught:', e);
}
