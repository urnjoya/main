const buttons = document.querySelectorAll('.convert-btn');
// const txtData = document.getElementById('input-text');
// const rslt = document.getElementById('result').textContent;
const STOP_WORDS = [
    "a", "an", "the", "and", "or", "but", "of", "in", "on", "at", "to", "for", "from", "by"
];
// STOP NASA WORD TO CONVERT
const ACRONYM_REGEX = /^[A-Z0-9]{2,}$/;

// regex pattern of every category
const REGEX_PATTERNS = {

    url: /https?:\/\/\S+/gi,

    email: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,

    acronym: /\b[A-Z]{2,}\b/g,

    html: /<[^>]+>/g

};
// 
// Global object for store regex settings
// Default state = inactive 
let regexConfig = {
    active: false,      // regex rules enabled or not
    mode: null,         // preserve | change-only
    categories: []      // selected categories
};
// select regex form
const regexForm = document.getElementById("regex-form");

// event listen of form submit
regexForm.addEventListener("submit", function (e) {

    // default form reload
    e.preventDefault();

    // read selected mode
    const mode = document.querySelector('input[name="mode"]:checked').value;

    // select all checked categories
    const selected = document.querySelectorAll('input[name="categories"]:checked');

    // if not checkbox click
    if (selected.length === 0) {

        // error notification
        showNotification('Select at least one category', 'error');

        return;
    }

    // create categories array
    const categories = [];

    // karo push value to using loop NodeList
    selected.forEach(box => {

        categories.push(box.value);

    });

    // update regexConfig object
    regexConfig.active = true;
    regexConfig.mode = mode;
    regexConfig.categories = categories;

    // success feedback
    showNotification('Regex rules applied', 'success');

});

function protectPatterns(text) {

    // placeholders store karne ke liye array
    const placeholders = [];

    let index = 0;

    // selected categories loop karo
    regexConfig.categories.forEach(key => {

        const pattern = REGEX_PATTERNS[key];

        if (!pattern) return;

        // pattern match hone par token replace karo
        text = text.replace(pattern, match => {
            // unique token create karo
            const token = "__PROTECTED_" + index + "__";
            // original value store karo
            placeholders.push({
                token,
                value: match
            });

            index++;

            return token;

        });

    });

    return { text, placeholders };

}
// store function
function restorePatterns(text, placeholders) {

    // placeholders restore karo
    placeholders.forEach(item => {

        text = text.replace(item.token, item.value);

    });

    return text;

}
// Apply
function applyRegex(text, mode) {

    // agar regex active nahi hai
    if (!regexConfig.active) return convertCase(mode, text);

    // PRESERVE MODE
    if (regexConfig.mode === "preserve") {

        // patterns protect karo
        const { text: protectedText, placeholders } = protectPatterns(text);

        // case conversion karo
        let converted = convertCase(mode, protectedText);

        // protected values restore karo
        return restorePatterns(converted, placeholders);
        // return converted;

    }

    // CHANGE ONLY MODE
    if (regexConfig.mode === "change-only") {

        // selected categories loop karo
        regexConfig.categories.forEach(key => {

            const pattern = REGEX_PATTERNS[key];

            if (!pattern) return;

            // sirf matched parts convert karo
            text = text.replace(pattern, match =>
                convertCase(mode, match)
            );

        });

        return text;

    }

    return text;


}
function runConversion(mode) {

    // input text lo
    const text = document.getElementById("input-text").value;

    // agar empty hai
    if (!text.trim()) {
        showNotification('Please enter some text', 'error');
        return;
    }
    let result;
    // decide whether regex rules are applied
    if (!regexConfig.active) {

        result = convertCase(mode, text); //simple conversion

    } else {

        result = applyRegex(text, mode);   //regex-aware conversion

    }

    document.getElementById("result").textContent = result;

}
// MODE FETCH DATA-MODE
buttons.forEach(btn => {
    btn.addEventListener("click", function () {

        const mode = this.dataset.mode; // data-mode value
        console.log("Selected mode:", mode);

        runConversion(mode);

    });
});
// CASE MODE LOGIC
function convertCase(mode, customText = null) {

    // 1️⃣ Use input text or provided customText
    const text = customText ?? document.getElementById('input-text').value;
    if (!text.trim()) return text;

    // 2️⃣ Split text by spaces for word-wise modes
    const words = text.trim().split(/\s+/);

    let result = '';

    // 3️⃣ Process different modes
    switch (mode) {

        // 4️⃣ UPPERCASE: skip tokens
        case 'upper':
            result = text.split(/(__PROTECTED_\d+__)/g).map(part =>
                /^__PROTECTED_\d+__$/.test(part) ? part : part.toUpperCase()
            ).join('');
            break;

        // 5️⃣ LOWERCASE: skip tokens
        case 'lower':
            result = text.split(/(__PROTECTED_\d+__)/g).map(part =>
                /^__PROTECTED_\d+__$/.test(part) ? part : part.toLowerCase()
            ).join('');
            break;

        // 6️⃣ TITLE CASE: word-wise, skip tokens
        case 'title':
            result = words.map(word =>
                /^__PROTECTED_\d+__$/.test(word) ? word :
                    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
            ).join(' ');
            break;

        // 7️⃣ SMART TITLE CASE: skip acronyms & stop words
        case 'smart-title':
            result = words.map((word, index) => {
                if (/^__PROTECTED_\d+__$/.test(word)) return word; // skip token
                if (ACRONYM_REGEX.test(word)) return word;         // preserve acronym
                const lower = word.toLowerCase();
                if (index !== 0 && STOP_WORDS.includes(lower)) return lower; // stop words
                return lower.charAt(0).toUpperCase() + lower.slice(1);
            }).join(' ');
            break;

        // 8️⃣ SENTENCE CASE: skip tokens
        case 'sentence':
            result = text
                .split(/(__PROTECTED_\d+__)/g)  // split by protected tokens
                .map(part => {
                    if (/^__PROTECTED_\d+__$/.test(part)) return part;  // skip tokens

                    // Lowercase everything first
                    let lower = part.toLowerCase();

                    // Capitalize first letter of each sentence
                    // Match start of string or after ., !, ? followed by space(s)
                    lower = lower.replace(/(^\s*\w|[.!?]\s*\w)/g, c => c.toUpperCase());

                    return lower;
                })
                .join('');
            break;

        // 9️⃣ CAPITALIZED CASE
        case 'capitalized':
            result = words.map(word =>
                // If the word is a protected token, leave it as-is
                /^__PROTECTED_\d+__$/.test(word)
                    ? word
                    // Otherwise, capitalize first letter, keep rest as-is
                    : word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ');
            break;

        // 🔟 TOGGLE CASE
        case 'toggle':
            result = text.split(/(__PROTECTED_\d+__)/g).map(part =>
                /^__PROTECTED_\d+__$/.test(part) ? part :
                    part.split('').map(c => c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()).join('')
            ).join('');
            break;

        // 11️⃣ ALTERNATIVE CASE (aLtErNaTiNg)
        case 'alternative':
            let toggle = true;
            result = text.split(/(__PROTECTED_\d+__)/g).map(part => {
                if (/^__PROTECTED_\d+__$/.test(part)) return part;
                return part.split('').map(c => {
                    if (/[a-z]/i.test(c)) {
                        const newChar = toggle ? c.toUpperCase() : c.toLowerCase();
                        toggle = !toggle;
                        return newChar;
                    }
                    return c;
                }).join('');
            }).join('');
            break;

        // 12️⃣ PASCAL CASE
        case 'pascal':
            result = words.map(word =>
                /^__PROTECTED_\d+__$/.test(word) ? word :
                    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
            ).join('');
            break;

        // 13️⃣ CAMEL CASE
        case 'camel':
            result = words.map((word, index) =>
                /^__PROTECTED_\d+__$/.test(word) ? word :
                    index === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
            ).join('');
            break;

        // 14️⃣ SNAKE CASE
        case 'snake':
            result = words.map(word =>
                /^__PROTECTED_\d+__$/.test(word) ? word : word.toLowerCase()
            ).join('_');
            break;

        // 15️⃣ KEBAB CASE
        case 'kebab':
            result = words.map(word =>
                /^__PROTECTED_\d+__$/.test(word) ? word : word.toLowerCase()
            ).join('-');
            break;

        // 16️⃣ DOT CASE
        case 'dot':
            result = words.map(word =>
                /^__PROTECTED_\d+__$/.test(word) ? word : word.toLowerCase()
            ).join('.');
            break;

        // 17️⃣ PATH CASE
        case 'path':
            result = words.map(word =>
                /^__PROTECTED_\d+__$/.test(word) ? word : word.toLowerCase()
            ).join('/');
            break;

        // 18️⃣ CONSTANT CASE
        case 'constant':
            result = words.map(word =>
                /^__PROTECTED_\d+__$/.test(word) ? word : word.toUpperCase()
            ).join('_');
            break;

        // 19️⃣ TRAIN CASE
        case 'train':
            result = words.map(word =>
                /^__PROTECTED_\d+__$/.test(word) ? word : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
            ).join('-');
            break;

        // 20️⃣ DEFAULT
        default:
            result = text;
    }

    return result;
}
/* ===============================
   DOWNLOAD RESULT
================================ */

function downloadTXT() {
    const text = document.getElementById("result").textContent;
    if (text == 'Your result will appear here...') {
        showNotification('There is no data to download', 'error')
    }
    else {

            // current time
    const now = new Date();

    const timestamp =
        String(now.getHours()).padStart(2, "0") + "-" +
        String(now.getMinutes()).padStart(2, "0") + "-" +
        String(now.getSeconds()).padStart(2, "0");
        const blob = new Blob([text], { type: "text/plain" });

        const link = document.createElement("a");

        link.href = URL.createObjectURL(blob);
        // link.download = "converted-text.txt";
        // filename with time
        link.download = `converted-text-${timestamp}.txt`;

        link.click();
        showNotification("Download successfull", 'success')
    }

}// BY KEY
document.addEventListener("keydown", function (e) {
    if (!e.altKey) return;

    const key = e.key.toLowerCase();

    const shortcuts = {
        u: "upper",
        l: "lower",
        t: "title",
        s: "sentence",
        c: "capitalized",
        g: "toggle",
        a: "alternative",
        p: "pascal",
        m: "camel",
        n: "snake",
        k: "kebab",
        h: "smart-title",
        d: "dot",
        r: "path",
        o: "constant",
        i: "train"
    };

    if (shortcuts[key]) {

        // stop browser behaviour
        e.preventDefault();

        // stop other JS listeners
        e.stopPropagation();
        e.stopImmediatePropagation();

        runConversion(shortcuts[key]);
    }

}, true); // capture phase
// popup

// Elements
const popup = document.getElementById('regex-popup');
const openBtn = document.getElementById('regex-popup-open');

// Optional overlay for clicking outside to close
const overlay = document.createElement('div');
overlay.classList.add('popup-overlay');
document.body.appendChild(overlay);

// Open popup
openBtn.addEventListener('click', () => {
    popup.classList.add('active');
    overlay.classList.add('active');
});

// Close popup when clicking outside
overlay.addEventListener('click', () => {
    popup.classList.remove('active');
    overlay.classList.remove('active');
});

// Optional: close on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === "Escape") {
        popup.classList.remove('active');
        overlay.classList.remove('active');
    }
});
// stats
const inputText = document.getElementById('input-text');

// Elements
const statChars = document.getElementById('stat-chars');
const statCharsNoSpace = document.getElementById('stat-chars-nospace');
const statWords = document.getElementById('stat-words');
const statParagraphs = document.getElementById('stat-paragraphs');
const statSentences = document.getElementById('stat-sentences');

// Function to update stats
function updateStats(text) {
    statChars.textContent = text.length;
    statCharsNoSpace.textContent = text.replace(/\s/g, '').length;
    statWords.textContent = text.trim() ? text.trim().split(/\s+/).length : 0;
    statParagraphs.textContent = text.trim() ? text.trim().split(/\n+/).length : 0;
    statSentences.textContent = text.trim() ? text.split(/[.!?]+/).filter(s => s.trim().length).length : 0;
}

// Event listener for live update
inputText.addEventListener('input', (e) => {
    updateStats(e.target.value);
});
// LIve datat
// const inputText = document.getElementById('input-text'); // your textarea/input
const liveUpperDiv = document.getElementById('live-upper');
const liveLowerDiv = document.getElementById('live-lower');
const liveTitleDiv = document.getElementById('live-title');
const liveSentenceDiv = document.getElementById('live-sentence');
const liveCapitalizedDiv = document.getElementById('live-capitalized');
const liveToggleDiv = document.getElementById('live-toggle');
const liveAlternativeDiv = document.getElementById('live-alternative');
const livePascalDiv = document.getElementById('live-pascal');
const liveCamelDiv = document.getElementById('live-camel');
const liveSnakeDiv = document.getElementById('live-snake');
const liveKebabDiv = document.getElementById('live-kebab');
const liveSmartDiv = document.getElementById('live-smart-title');
const liveDotDiv = document.getElementById('live-dot');
const livePathDiv = document.getElementById('live-path');
const liveConstantDiv = document.getElementById('live-constant');
const liveTrainDiv = document.getElementById('live-train');



let typingTimer;
const typingDelay = 500; // wait 500ms after user stops typing

inputText.addEventListener('input', () => {
    clearTimeout(typingTimer);

    typingTimer = setTimeout(() => {
        const text = inputText.value;

        // ✅ Use your convertCase function with "upper" mode
        const converted = convertCase('upper', text);

        // Update live div
        liveUpperDiv.textContent = converted;
        liveLowerDiv.textContent = convertCase('lower', text);
        liveTitleDiv.textContent = convertCase('title', text);
        liveSentenceDiv.textContent = convertCase('sentence', text);
        liveCapitalizedDiv.textContent = convertCase('capitalized', text);
        liveToggleDiv.textContent = convertCase('toggle', text);
        liveAlternativeDiv.textContent = convertCase('alternative', text);
        livePascalDiv.textContent = convertCase('pascal', text);
        liveCamelDiv.textContent = convertCase('camel', text);
        liveSnakeDiv.textContent = convertCase('snake', text);
        liveKebabDiv.textContent = convertCase('kebab', text);
        liveSmartDiv.textContent = convertCase('smart-title', text);
        liveDotDiv.textContent = convertCase('dot', text);
        livePathDiv.textContent = convertCase('path', text);
        liveConstantDiv.textContent = convertCase('constant', text);
        liveTrainDiv.textContent = convertCase('train', text);
    }, typingDelay);
});

// Optional: cancel timer if user types again quickly
inputText.addEventListener('keydown', () => {
    clearTimeout(typingTimer);
});

// COPY
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
        const txe = '';
        updateStats(txe);
        showNotification('All clear', 'success');
    }
}
