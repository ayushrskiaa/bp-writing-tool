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
    const formData = {};
    const form = document.getElementById(`${format}Format`);
    form.querySelectorAll('[data-field]').forEach(input => {
        formData[input.dataset.field] = input.value;
    });
    return formatTemplates[format](formData);
}