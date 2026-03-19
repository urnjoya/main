// stats
const inputText = document.getElementById('input-text');

// Elements
const statChars = document.getElementById('stat-chars');
const statCharsNoSpace = document.getElementById('stat-chars-nospace');
const statWords = document.getElementById('stat-words');
const statLines = document.getElementById('stat-lines'); // changed
const statSentences = document.getElementById('stat-sentences');

// Function to update stats
function updateStats(text) {
    statChars.textContent = text.length;
    statCharsNoSpace.textContent = text.replace(/\s/g, '').length;

    statWords.textContent = text.trim()
        ? text.trim().split(/\s+/).length
        : 0;

    // ✅ Line count (important logic)
    statLines.textContent = text
        ? text.split('\n').length
        : 0;

    statSentences.textContent = text.trim()
        ? text.split(/[.!?]+/).filter(s => s.trim().length).length
        : 0;
}

// Event listener
inputText.addEventListener('input', (e) => {
    updateStats(e.target.value);
});
