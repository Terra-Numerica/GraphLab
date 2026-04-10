
// for 2D use of the framework
// import modal from '../../framework/js/modal.js';
// import CTABanner from '../../framework/js/CTABanner';
// const ctaBanner = new CTABanner();
// ctaBanner.create_button("Rules", () => alert("Hello World"));
// const md = new modal(ctaBanner);
// md.getPermanentModal({
//     title: "titre",
//     position: { top: 10, right: 10 },
//     width: "350px",
//     theme: "light", // or "dark"
//     id: "gameSettingsModal" // custom ID allows multiple modals
//   });

//------------------------------------------------------------



// for 3D use of the framework
import Framework from '../../framework/js/framework.js';

const fw = new Framework();
fw.addButtonToNavbar({textButton : "Rules",onclickFunction: () => alert("Hello World")});
const modal1 = fw.getPermanentModal({
    title: "titre",
    position: { top: 10, right: 10 },
    width: "350px",
    theme: "light", // or "dark" 
    id: "gameSettingsModal", 
});
//rajouer un bouton dans le modal avec la méthode addButton
modal1.AddButtonToModal("Button 1", () => alert("Hello World"));



const scene = fw.mainParameters.scene;
const renderer = fw.mainParameters.renderer;
const camera = fw.mainParameters.camera;

fw.startLoadingScreen();
fw.removeLoadingScreen();
fw.onResize();
fw.addSimpleSceneWithTable();


// La fonction animate utilisera la mise à jour du framework
function animate() {
    requestAnimationFrame(animate);
    // Mise à jour des interactions gérées par le framework
    fw.update(camera);
    renderer.render(scene, camera);
}

animate();



