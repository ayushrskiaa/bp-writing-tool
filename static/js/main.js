import { getWordBoundaries, debounce } from './utils.js';
import { showSuggestions, getTextPosition } from './suggestions.js';
import { devToHinglish, fetchSuggestions, handleSpaceTranslation } from './translation.js';
import { formatTemplates, getFormattedContent } from './formats.js';

// --- DOM Elements ---
const inputBox = document.getElementById('inputBox');
const suggestionsBox = document.getElementById('suggestions');
const formatSelector = document.getElementById('documentFormat');
const exportBtn = document.getElementById('exportBtn');
const exportFirBtn = document.getElementById('exportFirBtn');
const previewModal = document.getElementById('previewModal');
const previewContent = document.getElementById('previewContent');
const closePreview = document.getElementById('closePreview');
const cancelPreview = document.getElementById('cancelPreview');
const confirmExport = document.getElementById('confirmExport');
const formContainer = document.getElementById('formContainer');
const formats = document.querySelectorAll('.format-form');

// --- Auto-select Free Format on Page Load ---
window.addEventListener('DOMContentLoaded', () => {
    // Restore main inputBox
    if (localStorage.getItem('inputBoxValue')) {
        inputBox.value = localStorage.getItem('inputBoxValue');
        // Optionally, trigger translation for the whole input
        // await handleFullInputTranslation(inputBox);
    }
    // Restore all .hinglish-input fields
    document.querySelectorAll('.hinglish-input').forEach((el, idx) => {
        const saved = localStorage.getItem('hinglishInput_' + idx);
        if (saved !== null) el.value = saved;
        // Optionally, trigger translation for the whole input
        // await handleFullInputTranslation(el);
    });

    formatSelector.value = 'free';
    formats.forEach(form => form.style.display = 'none');
    const freeFormat = document.getElementById('freeFormat');
    if (freeFormat) freeFormat.style.display = 'block';
    setupAllHinglishInputs();
});

// --- Hinglish Input Setup ---
function setupHinglishInput(input) {
    input.addEventListener('input', async (e) => {
        // Feature 2: Skip translation if Shift is pressed
        if (e.shiftKey) return;

        const value = input.value;
        const cursor = input.selectionStart;
        const [wordStart, wordEnd] = getWordBoundaries(value, cursor);
        const word = value.slice(wordStart, wordEnd);
        if (!word.trim()) {
            suggestionsBox.style.display = 'none';
            return;
        }
        let suggestions = await fetchSuggestions(word);
        showSuggestions(suggestions, wordStart, wordEnd, input, suggestionsBox, selectSuggestion, getTextPosition);
    });

    input.addEventListener('keydown', async (e) => {
        // Feature 1: Insert tab character on Tab key
        if (e.key === 'Tab') {
            e.preventDefault();
            const value = input.value;
            const cursor = input.selectionStart;
            input.value = value.slice(0, cursor) + '\t' + value.slice(cursor);
            input.selectionStart = input.selectionEnd = cursor + 1;
            return;
        }

        // Feature 2: Skip translation if Shift is pressed
        if (e.shiftKey && e.key === 'Enter') return;

        // Save Hinglish before translation on space/enter
        if (e.key === ' ' || (e.key === 'Enter' && !e.shiftKey)) {
            e.preventDefault();
            await handleSpaceTranslation(input, devToHinglish);
            // For Enter, also insert a new line after translation
            if (e.key === 'Enter') {
                const value = input.value;
                const cursor = input.selectionStart;
                input.value = value.slice(0, cursor) + '\n' + value.slice(cursor);
                input.selectionStart = input.selectionEnd = cursor + 1;
            }
        }
    });

    input.addEventListener('click', async (e) => {
        if (e.shiftKey) return; // Feature 2: Skip if Shift is pressed

        const value = input.value;
        const cursor = input.selectionStart;
        const [wordStart, wordEnd] = getWordBoundaries(value, cursor);
        const word = value.slice(wordStart, wordEnd);
        if (!word.trim()) {
            suggestionsBox.style.display = 'none';
            return;
        }
        let suggestions = await fetchSuggestions(word);
        showSuggestions(suggestions, wordStart, wordEnd, input, suggestionsBox, selectSuggestion, getTextPosition);
    });
}

function selectSuggestion(s, wordStart, wordEnd, input) {
    const value = input.value;
    const oldWord = value.slice(wordStart, wordEnd);
    if (/^[\u0900-\u097F]+$/.test(s) && devToHinglish[oldWord]) {
        devToHinglish[s] = devToHinglish[oldWord];
    }
    input.value = value.slice(0, wordStart) + s + value.slice(wordEnd);
    input.focus();
    input.selectionStart = input.selectionEnd = wordStart + s.length;
    suggestionsBox.style.display = 'none';
}

// Attach to all current and future .hinglish-input fields and inputBox
function setupAllHinglishInputs() {
    document.querySelectorAll('.hinglish-input, #inputBox').forEach(setupHinglishInput);
}

// --- Format Handling ---
formatSelector.addEventListener('change', (e) => {
    formats.forEach(form => form.style.display = 'none');
    const selectedFormat = document.getElementById(`${e.target.value}Format`);
    if (selectedFormat) {
        selectedFormat.style.display = 'block';
        setupAllHinglishInputs();
    }
    suggestionsBox.style.display = 'none';
});

// --- Modal and Export Logic ---
function closeModal() {
    previewModal.classList.remove('show');
    document.body.style.overflow = 'auto';
}


function getCurrentFormatElement() {
    return document.querySelector('.format-form:not([style*="display: none"])');
}

// Helper: Get plain preview HTML (no inputs/textareas)
function getPreviewHTML(format) {
    if (format.id === 'freeFormat') {
        const textarea = format.querySelector('textarea');
        return `<div style="white-space:pre-line;font-size:1.1em;">${textarea.value}</div>`;
    }
    if (format.id === 'firFormat') {
        // Clone and replace all inputs/textareas with their values as underlined spans
        const clone = format.cloneNode(true);
        clone.querySelectorAll('input, textarea').forEach(el => {
            let value = el.value || '';
            if (el.type === 'date' && value) {
                // Format date as dd-mm-yyyy
                const d = new Date(value);
                value = !isNaN(d) ? `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth()+1).padStart(2, '0')}-${d.getFullYear()}` : '';
            }
            const span = document.createElement('span');
            span.textContent = value || '__________';
            span.style.borderBottom = '1px solid #000';
            span.style.minWidth = el.style.width || '40px';
            span.style.display = 'inline-block';
            span.style.padding = '2px 4px';
            el.parentNode.replaceChild(span, el);
        });
        return clone.innerHTML;
    }
    return '';
}



// Modal close
closePreview.addEventListener('click', closeModal);
cancelPreview.addEventListener('click', closeModal);

exportBtn.addEventListener('click', () => {
    const currentFormat = getCurrentFormatElement();
    if (!currentFormat) return;
    const html = `
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Export</title>
        <link rel="stylesheet" href="static/css/style.css">
        <style>
            body { font-family: 'Noto Sans Devanagari', Arial, sans-serif; margin: 40px; }
        </style>
    </head>
    <body>
        ${getPreviewHTML(currentFormat)}
    </body>
    </html>
    `;
    const blob = new Blob([html], {type: 'text/html'});
    const url = URL.createObjectURL(blob);
    const printWindow = window.open(url, '_blank');
    printWindow.onload = function() {
        printWindow.focus();
        printWindow.print();
        URL.revokeObjectURL(url);
    };
    if (previewModal.classList.contains('show')) closeModal();
});


// Save Hinglish as user types (not after translation)
inputBox.addEventListener('input', () => {
    localStorage.setItem('inputBoxValue', inputBox.value);
});
document.querySelectorAll('.hinglish-input').forEach((el, idx) => {
    el.addEventListener('input', () => {
        localStorage.setItem('hinglishInput_' + idx, el.value);
    });
});

// Hide suggestions on click outside
document.addEventListener('click', (e) => {
    if (!suggestionsBox.contains(e.target) && !e.target.classList.contains('hinglish-input') && e.target !== inputBox) {
        suggestionsBox.style.display = 'none';
    }
});

// Auto-resize all FIR table textareas as user types and on page load
function autoResizeTextarea(el) {
    el.style.height = 'auto';
    el.style.height = (el.scrollHeight) + 'px';
}

// On input
document.addEventListener('input', function(e) {
    if (e.target.matches('.fir-table textarea')) {
        autoResizeTextarea(e.target);
    }
});

// On page load, for any pre-filled textareas
document.querySelectorAll('.fir-table textarea').forEach(autoResizeTextarea);

