// Convertit une couleur RGB en hexadécimal
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

// Trouve une position X libre pour une pastille
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