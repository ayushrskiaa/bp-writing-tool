import { getWordBoundaries } from './utils.js';

export function showSuggestions(suggestions, wordStart, wordEnd, input, suggestionsBox, selectSuggestion, getTextPosition) {
    suggestionsBox.innerHTML = '';
    if (!suggestions || suggestions.length === 0) {
        suggestionsBox.style.display = 'none';
        return;
    }
    suggestions.forEach((suggestion) => {
        const div = document.createElement('div');
        div.className = 'suggestion';
        div.textContent = suggestion;
        div.onclick = () => {
            selectSuggestion(suggestion, wordStart, wordEnd, input);
            suggestionsBox.style.display = 'none';
        };
        suggestionsBox.appendChild(div);
    });
    const textPosition = getTextPosition(input, wordStart, wordEnd);
    suggestionsBox.style.visibility = 'hidden';
    suggestionsBox.style.display = 'block';
    const suggestionsRect = suggestionsBox.getBoundingClientRect();
    let top = textPosition.bottom + window.scrollY + 5;
    let left = textPosition.left + window.scrollX;
    if (left + suggestionsRect.width > window.innerWidth) {
        left = window.innerWidth - suggestionsRect.width - 10;
    }
    if (top + suggestionsRect.height > window.innerHeight) {
        top = textPosition.top - suggestionsRect.height - 5;
    }
    suggestionsBox.style.top = `${top}px`;
    suggestionsBox.style.left = `${left}px`;
    suggestionsBox.style.visibility = 'visible';
}

export function getTextPosition(input, start, end) {
    const mirror = document.getElementById('mirror');
    const style = window.getComputedStyle(input);
    mirror.style.width = style.width;
    mirror.style.font = style.font;
    mirror.style.lineHeight = style.lineHeight;
    mirror.style.padding = style.padding;
    mirror.style.border = style.border;
    mirror.style.boxSizing = style.boxSizing;
    const textBefore = input.value.substring(0, start);
    const word = input.value.substring(start, end);
    mirror.innerHTML = textBefore + '<span id="marker">' + word + '</span>';
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