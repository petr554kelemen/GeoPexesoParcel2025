//
//sledování pozice kursoru myši
//
let mouseText;

function poziceMysi(scene) {
    mouseText = scene.add.text(10, 10, 'Myš: (0, 0)', { fontSize: '16px', fill: '#fff' }).setDepth(1000);

    scene.input.on('pointermove', function (pointer) {
        if (mouseText) {
            mouseText.setText(`Myš: (${pointer.x}, ${pointer.y})`);
        }
    });
}

export { poziceMysi };