function convertCase(mode) {
    const text = document.getElementById('input-text').value;

    if (!text.trim()) {
        showNotification('Please enter some text', 'error');
        return;
    }

    let result = '';
    const words = text.trim().split(/\s+/);

    switch (mode) {
        case 'sort-ascending':
            {
                const words = text.trim().split(/\s+/);

                result = words
                    .sort((a, b) =>
                        a.localeCompare(b, undefined, { sensitivity: 'base' })
                    )
                    .join(' ');
            }
            break;
        case 'sort-descending':
            {
                const words = text.trim().split(/\s+/);

                result = words
                    .sort((a, b) =>
                        b.localeCompare(a, undefined, { sensitivity: 'base' })
                    )
                    .join(' ');
            }
            break;
        case 'remove-duplicates':
            {
                const words = text.trim().split(/\s+/);
                const seen = new Set();

                const uniqueWords = words.filter(word => {
                    const normalized = word.toLowerCase();
                    if (seen.has(normalized)) return false;
                    seen.add(normalized);
                    return true;
                });

                result = uniqueWords.join(' ');
            }
            break;
        case 'sort-by-length':
            {
                const words = text.trim().split(/\s+/);

                result = words
                    .sort((a, b) => a.length - b.length)
                    .join(' ');
            }
            break;

        default:
            result = text;
    }

    document.getElementById('result').textContent = result;
}
// 
function copyResult() {
    const result1 = document.getElementById('result').textContent;
    if (result1 == "Your result will appear here...") {
        showNotification('Please enter some text first', 'error')
        return
    }
    else {
        copyToClipboard(result1, document.getElementById('copy-btn'));
    }
}
function clearAll() {
    if (document.getElementById('input-text').value == '' && document.getElementById('result').textContent == 'Your result will appear here...') {
        showNotification('Nothing to clear!', 'error');
        return;
    }
    else {
        document.getElementById('input-text').value = '';
        document.getElementById('result').textContent = 'Your result will appear here...';
        showNotification('All clear', 'success');
    }
}
