const inputBox = document.getElementById('inputBox');
const suggestionsBox = document.getElementById('suggestions');
let lastWordStart = 0;
let lastWordEnd = 0;
let currentWord = '';
let caretPos = 0;
// Mapping: Devanagari word -> original Hinglish
const devToHinglish = {};

let translationQueue = new Map(); // Queue to track pending translations
let debounceTimer;

// Helper: get word boundaries at a given position
function getWordBoundaries(text, pos) {
    let start = pos, end = pos;
    while (start > 0 && !/\s/.test(text[start - 1])) start--;
    while (end < text.length && !/\s/.test(text[end])) end++;
    return [start, end];
}

// Add this debounce helper function
function debounce(func, wait) {
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(debounceTimer);
            func(...args);
        };
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(later, wait);
    };
}

// On input: update last word info
inputBox.addEventListener('input', async (e) => {
    const value = inputBox.value;
    const cursor = inputBox.selectionStart;
    const [wordStart, wordEnd] = getWordBoundaries(value, cursor);
    const word = value.slice(wordStart, wordEnd);
    
    if (word.trim().length === 0) {
        suggestionsBox.style.display = 'none';
        return;
    }

    // Store the current word position
    const currentPosition = { start: wordStart, end: wordEnd };
    
    // Don't translate if it's already in queue
    if (translationQueue.has(word)) return;
    
    // Add to translation queue
    translationQueue.set(word, currentPosition);
    
    // Debounced translation request
    debouncedTranslate(word, currentPosition);
});

// Create debounced translate function
const debouncedTranslate = debounce(async (word, position) => {
    try {
        const res = await fetch('/transliterate', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({word: word})
        });
        const data = await res.json();
        
        // Check if this word is still in the queue (user hasn't deleted it)
        if (translationQueue.has(word)) {
            if (data.suggestions && data.suggestions.length > 0) {
                showSuggestions(data.suggestions, position.start, position.end);
            }
            translationQueue.delete(word);
        }
    } catch (error) {
        console.error('Error fetching suggestions:', error);
        translationQueue.delete(word);
    }
}, 300); // 300ms debounce delay

// On space: replace last word with top suggestion and store mapping
inputBox.addEventListener('keydown', async (e) => {
    if (e.key === ' ') {
        const value = inputBox.value;
        const cursor = inputBox.selectionStart;
        const [start, end] = getWordBoundaries(value, cursor - 1);
        const word = value.slice(start, end);
        console.log('Word detected:', word); // Debug log
        if (word.trim().length === 0) return; // Don't process empty
        e.preventDefault();
        // Fetch suggestions
        const res = await fetch('/transliterate', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({word: word})
        });
        const data = await res.json();
        console.log('Suggestions received:', data.suggestions); // Debug log
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
    
    if (!suggestions || suggestions.length === 0) {
        suggestionsBox.style.display = 'none';
        return;
    }

    // Create suggestions elements
    suggestions.forEach((suggestion) => {
        const div = document.createElement('div');
        div.className = 'suggestion';
        div.textContent = suggestion;
        div.onclick = () => {
            selectSuggestion(suggestion, wordStart, wordEnd);
            suggestionsBox.style.display = 'none';
        };
        suggestionsBox.appendChild(div);
    });

    // Get text position using getTextPosition helper
    const textPosition = getTextPosition(inputBox, wordStart, wordEnd);
    
    // Make suggestions box visible to get its dimensions
    suggestionsBox.style.visibility = 'hidden';
    suggestionsBox.style.display = 'block';
    const suggestionsRect = suggestionsBox.getBoundingClientRect();

    // Calculate position relative to viewport
    let top = textPosition.bottom + window.scrollY + 5; // 5px below text
    let left = textPosition.left + window.scrollX;

    // Adjust if going outside viewport
    if (left + suggestionsRect.width > window.innerWidth) {
        left = window.innerWidth - suggestionsRect.width - 10;
    }
    if (top + suggestionsRect.height > window.innerHeight) {
        top = textPosition.top - suggestionsRect.height - 5; // Show above text
    }

    // Apply position
    suggestionsBox.style.top = `${top}px`;
    suggestionsBox.style.left = `${left}px`;
    suggestionsBox.style.visibility = 'visible';
}

// Add this helper function to get precise text position
function getTextPosition(textarea, start, end) {
    const mirror = document.getElementById('mirror');
    const style = window.getComputedStyle(textarea);
    
    // Copy textarea styles to mirror
    mirror.style.width = style.width;
    mirror.style.font = style.font;
    mirror.style.lineHeight = style.lineHeight;
    mirror.style.padding = style.padding;
    mirror.style.border = style.border;
    mirror.style.boxSizing = style.boxSizing;
    
    // Get text before target word
    const textBefore = textarea.value.substring(0, start);
    const word = textarea.value.substring(start, end);
    
    // Create HTML content with marker
    mirror.innerHTML = textBefore + '<span id="marker">' + word + '</span>';
    
    // Get marker position
    const marker = document.getElementById('marker');
    const markerRect = marker.getBoundingClientRect();
    
    return {
        top: markerRect.top,
        bottom: markerRect.bottom,
        left: markerRect.left,
        right: markerRect.right,
        width: markerRect.width,
        height: markerRect.height
    };
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

// Update the export handling
async function handleExport() {
    const text = inputBox.value;
    // if (!text.trim()) {
    //     alert('Please enter some text before exporting.');
    //     return;
    // }

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

        // Only close modal if we're in preview mode
        if (previewModal.classList.contains('show')) {
            closeModal();
        }
    } catch (error) {
        console.error('Error exporting PDF:', error);
        alert('Failed to export PDF. Please try again.');
    }
}

// Update event listeners section
const previewModal = document.getElementById('previewModal');
const previewContent = document.getElementById('previewContent');
const previewBtn = document.getElementById('previewBtn');
const closePreview = document.getElementById('closePreview');
const cancelPreview = document.getElementById('cancelPreview');
const confirmExport = document.getElementById('confirmExport');
const mainExportBtn = document.getElementById('exportBtn');

// Add event listeners for both export buttons
mainExportBtn.addEventListener('click', handleExport);
confirmExport.addEventListener('click', handleExport);

previewBtn.addEventListener('click', () => {
    previewContent.textContent = inputBox.value;
    previewModal.classList.add('show'); // Use class instead of direct style
    document.body.style.overflow = 'hidden';
});

function closeModal() {
    previewModal.classList.remove('show'); // Remove class instead of setting style
    document.body.style.overflow = 'auto';
}

closePreview.addEventListener('click', closeModal);
cancelPreview.addEventListener('click', closeModal);

// Add click handler for input box
inputBox.addEventListener('click', async (e) => {
    const value = inputBox.value;
    const cursor = inputBox.selectionStart;
    const [wordStart, wordEnd] = getWordBoundaries(value, cursor);
    const word = value.slice(wordStart, wordEnd);
    
    if (word.trim().length === 0) {
        suggestionsBox.style.display = 'none';
        return;
    }

    try {
        const res = await fetch('/transliterate', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({word: word})
        });
        const data = await res.json();
        
        if (data.suggestions && data.suggestions.length > 0) {
            // Use existing showSuggestions function to maintain positioning
            showSuggestions(data.suggestions, wordStart, wordEnd);
        }
    } catch (error) {
        console.error('Error fetching suggestions:', error);
    }
});

// Update click outside handler to be more specific but keep existing behavior
document.addEventListener('click', (e) => {
    if (!suggestionsBox.contains(e.target) && e.target !== inputBox) {
        suggestionsBox.style.display = 'none';
    }
});