export const formatTemplates = {
    free: (data) => data.content,
    fir: (data) => `
        एफ.आई.आर. संख्या: ${data.firNumber}
        दिनांक: ${data.date}
        थाना: ${data.policeStation}
        
        शिकायतकर्ता का नाम: ${data.complainantName}
        
        घटना का विवरण:
        ${data.description}
    `,
    // Add other format templates as needed
};

export function getFormattedContent(formatSelector, inputBox) {
    const format = formatSelector.value;
    if (format === 'free') {
        return inputBox.value;
    }
    if (format === 'fir') {
        const form = document.getElementById('firFormat');
        const data = {};
        form.querySelectorAll('[data-field]').forEach(input => {
            data[input.dataset.field] = input.value;
        });
        // You can format this as needed for backend export
        return JSON.stringify(data);
    }
    return '';
}