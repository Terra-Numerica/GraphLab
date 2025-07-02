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