import { getWordBoundaries } from './utils.js';

export const devToHinglish = {};
export const prefetchCache = {};

export async function fetchSuggestions(word) {
    if (!word.trim()) return [];
    if (prefetchCache[word]) return prefetchCache[word];
    const res = await fetch('/transliterate', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({word})
    });
    const data = await res.json();
    prefetchCache[word] = data.suggestions;
    return data.suggestions;
}

export async function handleSpaceTranslation(input, devToHinglish) {
    const value = input.value;
    const cursor = input.selectionStart;
    const [start, end] = getWordBoundaries(value, cursor - 1);
    const word = value.slice(start, end);
    if (!word.trim()) return;
    let suggestions = await fetchSuggestions(word);
    const top = suggestions[0] || word;
    devToHinglish[top] = word;
    input.value = value.slice(0, start) + top + ' ' + value.slice(end);
    input.selectionStart = input.selectionEnd = start + top.length + 1;
}