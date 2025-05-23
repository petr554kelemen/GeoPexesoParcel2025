// buttonStyle.js
export const BLUE_BUTTON_STYLE = {
    fontSize: 24,
    fontFamily: 'Playpen Sans Arabic, Arial, sans-serif',
    color: '#222',
    backgroundColor: '#eee', 
    stroke: '#8c7ae6',
    strokeThickness: 2,
    padding: { x: 16, y: 5 },
    align: 'center',
    // Další vlastnosti podle potřeby
};

export const GREY_BUTTON_STYLE = {
    ...BLUE_BUTTON_STYLE,           // dědí vlastnosti, ale přepíše co potřebuješ
    color: '#888',
    backgroundColor: '#f0f0f0',
    stroke: '#bdbdbd',
    fontStyle: 'italic',            // např. kurzíva pro disabled
    // můžeš přidat i další vizuální efekty
};