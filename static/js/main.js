const inputBox = document.getElementById('inputBox');
const suggestionsBox = document.getElementById('suggestions');
let lastWordStart = 0;
let lastWordEnd = 0;
let currentWord = '';
let caretPos = 0;
// Mapping: Devanagari word -> original Hinglish
const devToHinglish = {};

// Helper: get word boundaries at a given position
function getWordBoundaries(text, pos) {
    let start = pos, end = pos;
    while (start > 0 && !/\s/.test(text[start - 1])) start--;
    while (end < text.length && !/\s/.test(text[end])) end++;
    return [start, end];
}

// On input: update last word info
inputBox.addEventListener('input', async (e) => {
    const value = inputBox.value;
    const cursor = inputBox.selectionStart;
    const words = value.slice(0, cursor).split(/\s/);
    const lastWord = words[words.length - 1];
    lastWordStart = value.slice(0, cursor).lastIndexOf(lastWord);
    lastWordEnd = lastWordStart + lastWord.length;
    currentWord = lastWord;
    caretPos = cursor;
});

// On space: replace last word with top suggestion and store mapping
inputBox.addEventListener('keydown', async (e) => {
    if (e.key === ' ') {
        const value = inputBox.value;
        const cursor = inputBox.selectionStart;
        const [start, end] = getWordBoundaries(value, cursor - 1);
        const word = value.slice(start, end);
        if (word.trim().length === 0) return; // Don't process empty
        e.preventDefault();
        // Fetch suggestions
        const res = await fetch('/transliterate', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({word: word})
        });
        const data = await res.json();
        const top = data.suggestions[0] || word;
        // Store mapping: Devanagari -> Hinglish
        devToHinglish[top] = word;
        // Replace word with top suggestion and add space
        inputBox.value = value.slice(0, start) + top + ' ' + value.slice(end);
        // Move caret after inserted word + space
        inputBox.selectionStart = inputBox.selectionEnd = start + top.length + 1;
    }
});

// Show suggestions dropdown at caret position
function showSuggestions(suggestions, wordStart, wordEnd) {
    suggestionsBox.innerHTML = '';
    const value = inputBox.value;
    const originalWord = devToHinglish && devToHinglish[value.slice(wordStart, wordEnd)] 
        ? devToHinglish[value.slice(wordStart, wordEnd)] 
        : value.slice(wordStart, wordEnd);
    
    let displaySuggestions = suggestions.slice(0, 5);
    displaySuggestions = displaySuggestions.filter(s => s !== originalWord);
    displaySuggestions.push(originalWord);
    
    displaySuggestions.forEach((s, i) => {
        const div = document.createElement('div');
        div.className = 'suggestion' + (i === displaySuggestions.length - 1 ? ' original-suggestion' : '');
        div.textContent = s;
        div.onclick = () => selectSuggestion(s, wordStart, wordEnd);
        suggestionsBox.appendChild(div);
    });

    positionSuggestionsBox(wordStart, displaySuggestions);
}

// Position the suggestions box
function positionSuggestionsBox(wordStart, displaySuggestions) {
    const mirror = document.getElementById('mirror');
    const style = getComputedStyle(inputBox);
    
    // Copy textarea styles to mirror
    Object.assign(mirror.style, {
        font: style.font,
        fontSize: style.fontSize,
        lineHeight: style.lineHeight,
        padding: style.padding,
        border: style.border,
        width: inputBox.offsetWidth + 'px',
        boxSizing: style.boxSizing
    });

    // Position the suggestions box
    const rect = getCaretCoordinates(inputBox, wordStart);
    suggestionsBox.style.left = rect.left + 'px';
    suggestionsBox.style.top = (rect.bottom + 5) + 'px';
    suggestionsBox.style.display = 'block';
}

// Replace word with selected suggestion
function selectSuggestion(s, wordStart, wordEnd) {
    const value = inputBox.value;
    const oldWord = value.slice(wordStart, wordEnd);
    if (/^[\u0900-\u097F]+$/.test(s) && devToHinglish[oldWord]) {
        devToHinglish[s] = devToHinglish[oldWord];
    }
    inputBox.value = value.slice(0, wordStart) + s + value.slice(wordEnd);
    inputBox.focus();
    inputBox.selectionStart = inputBox.selectionEnd = wordStart + s.length;
    suggestionsBox.style.display = 'none';
}

// Hide suggestions on click outside
document.addEventListener('click', (e) => {
    if (!suggestionsBox.contains(e.target) && e.target !== inputBox) {
        suggestionsBox.style.display = 'none';
    }
});

// Handle PDF export
document.getElementById('exportBtn').onclick = async function() {
    const text = inputBox.value;
    try {
        const res = await fetch('/export_pdf', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({text})
        });
        
        if (!res.ok) throw new Error('PDF generation failed');
        
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = "exported_text.pdf";
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error exporting PDF:', error);
        alert('Failed to export PDF. Please try again.');
    }
};