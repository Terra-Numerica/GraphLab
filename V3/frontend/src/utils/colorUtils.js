/**
 * @description Convert an RGB color to a hex color
 * @param {string} rgb - The RGB color
 * @returns {string} The hex color
*/
export const rgbToHex = (rgb) => {
    const result = rgb.match(/\d+/g);
    if (!result) return rgb;
    return (
        "#" +
        result
            .slice(0, 3)
            .map(x => {
                const hex = parseInt(x).toString(16);
                return hex.length === 1 ? "0" + hex : hex;
            })
            .join("")
            .toUpperCase()
    );
};

/**
 * @description Get a darker version of a hex color
 * @param {string} hexColor - The hex color
 * @param {number} factor - The darkening factor (0-1)
 * @returns {string} The darker hex color
*/
export const getDarkerColor = (hexColor, factor = 0.7) => {
    // Remove # if present
    const hex = hexColor.replace('#', '');
    
    // Convert to RGB
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Darken
    const darkerR = Math.floor(r * factor);
    const darkerG = Math.floor(g * factor);
    const darkerB = Math.floor(b * factor);
    
    // Convert back to hex
    return `#${darkerR.toString(16).padStart(2, '0')}${darkerG.toString(16).padStart(2, '0')}${darkerB.toString(16).padStart(2, '0')}`;
};

/**
 * @description Get a lighter version of a hex color
 * @param {string} hexColor - The hex color
 * @param {number} factor - The lightening factor (0-1)
 * @returns {string} The lighter hex color
*/
export const getLighterColor = (hexColor, factor = 0.3) => {
    // Remove # if present
    const hex = hexColor.replace('#', '');
    
    // Convert to RGB
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Lighten
    const lighterR = Math.min(255, Math.floor(r + (255 - r) * factor));
    const lighterG = Math.min(255, Math.floor(g + (255 - g) * factor));
    const lighterB = Math.min(255, Math.floor(b + (255 - b) * factor));
    
    // Convert back to hex
    return `#${lighterR.toString(16).padStart(2, '0')}${lighterG.toString(16).padStart(2, '0')}${lighterB.toString(16).padStart(2, '0')}`;
};

/**
 * @description Find a free position on the X axis
 * @param {Object} cy - The cytoscape instance
 * @returns {number} The free position on the X axis
*/
export const findFreePositionX = (cy) => {
    const y = 50;
    let x = 50;
    const step = 50;
    const maxTries = 100;
    let tries = 0;
    while (tries < maxTries) {
        const found = cy.nodes().some(node => {
            return node.position('x') === x && node.position('y') === y && node.data('isColorNode');
        });
        if (!found) return x;
        x += step;
        tries++;
    }
    return null;
}; 