function convertCase(mode) {
    const text = document.getElementById('input-text').value;

    if (!text.trim()) {
        showNotification('Please enter some text', 'error');
        return;
    }

    let result = '';
    const words = text.trim().split(/\s+/);

    switch (mode) {

        case 'reverse-text':
            result = text.split('').reverse().join('');
            break;
        case 'reverse-words':
            {
                const words = text.trim().split(/\s+/);
                result = words.reverse().join(' ');
            }
            break;
        case 'reverse-sentences':
            {
                const sentences = text
                    .match(/[^.!?]+[.!?]*\s*/g);

                if (sentences) {
                    result = sentences.reverse().join('').trim();
                } else {
                    result = text;
                }
            }
            break;

        default:
            result = text;
    }

    document.getElementById('result').textContent = result;
}
// COPY AND CLEAR
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
