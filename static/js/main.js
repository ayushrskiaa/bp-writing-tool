import { getWordBoundaries, debounce } from './utils.js';
import { showSuggestions, getTextPosition } from './suggestions.js';
import { devToHinglish, fetchSuggestions, handleSpaceTranslation } from './translation.js';
import { formatTemplates, getFormattedContent } from './formats.js';

// --- DOM Elements ---
const inputBox = document.getElementById('inputBox');
const suggestionsBox = document.getElementById('suggestions');
const formatSelector = document.getElementById('documentFormat');
const previewBtn = document.getElementById('previewBtn');
const exportBtn = document.getElementById('exportBtn');
const previewModal = document.getElementById('previewModal');
const previewContent = document.getElementById('previewContent');
const closePreview = document.getElementById('closePreview');
const cancelPreview = document.getElementById('cancelPreview');
const confirmExport = document.getElementById('confirmExport');
const formContainer = document.getElementById('formContainer');
const formats = document.querySelectorAll('.format-form');

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
        if (e.shiftKey) return;

        if (e.key === ' ') {
            e.preventDefault();
            await handleSpaceTranslation(input, devToHinglish);
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
setupAllHinglishInputs();

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

previewBtn.addEventListener('click', () => {
    previewContent.textContent = getFormattedContent(formatSelector, inputBox);
    previewModal.classList.add('show');
    document.body.style.overflow = 'hidden';
});
closePreview.addEventListener('click', closeModal);
cancelPreview.addEventListener('click', closeModal);

async function handleExport() {
    const text = getFormattedContent(formatSelector, inputBox);
    if (!text.trim()) {
        alert('Please enter the required information before exporting.');
        return;
    }
    try {
        const res = await fetch('/export_pdf', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                text,
                format: formatSelector.value
            })
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
        if (previewModal.classList.contains('show')) {
            closeModal();
        }
    } catch (error) {
        console.error('Error exporting PDF:', error);
        alert('Failed to export PDF. Please try again.');
    }
}
exportBtn.addEventListener('click', handleExport);
confirmExport.addEventListener('click', handleExport);

// Hide suggestions on click outside
document.addEventListener('click', (e) => {
    if (!suggestionsBox.contains(e.target) && !e.target.classList.contains('hinglish-input') && e.target !== inputBox) {
        suggestionsBox.style.display = 'none';
    }
});