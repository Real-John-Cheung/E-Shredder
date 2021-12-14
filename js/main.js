/*
2021
By JohnC
using p5js 
*/
let bloxFont,soundStart,soundLoop,soundStop;
function preload(){
    bloxFont = loadFont("../media/Blox2.ttf");
}
const soundVolumeShredder = 0.5;
let shreddingSpeed = 2;
let currentImage, currentWorkTitle, shredderSound, uisfx, loopTrigerred = false;
let imageLoaded = false,soundLoaded = 0, metaCreated = false;
let shredding = false;
let shredded = false;
let currentImageUnsorted;
let currentImageSorted = [];
let currentImageAncor = new Array(2);
let shreddingProcess = 0;
let sortGeneratorInstance;

function setup(){
    createCanvas(windowWidth,windowHeight);
    background(0);
    soundStart = new Howl({src:["../media/shredderStart.mp3"], onload:() => {soundLoaded ++}});
    soundLoop = new Howl({src:["../media/shredderLoop.mp3"], onload:() => {soundLoaded ++}});
    soundStop = new Howl({src:["../media/shredderStop.mp3"], onload:() => {soundLoaded ++}});
    uisfx = new Howl({src:["../media/ui.ogg"], onload:() => {soundLoaded ++}});
    //fetchNFT(currentImage, currentWorkTitle, () => {imageLoaded = true} );
    currentImage = loadImage("../cytopunk.png", () => {imageLoaded = true; processImage(currentImage, currentWorkTitle).then(m => { currentImageUnsorted = m; console.log(currentImageUnsorted);metaCreated = true }, e => {console.error(e);})});
    currentWorkTitle = 'cytopunk';
    
}

function draw(){
    if (!imageLoaded || soundLoaded < 4 || !metaCreated){
        // loading animation
        background(0)
        fill(255);
        noStroke();
        textFont(bloxFont);
        textSize(width/20);
        textAlign(RIGHT, BOTTOM);
        const leftStr = "FINDING";
        const rightStr = "NFTs  ";
        const totalLength = leftStr.length + rightStr.length;
        for (let i = 0; i < leftStr.length; i++) {
            const letter = leftStr[i];
            text(letter, width/2 + width/10 - ((leftStr.length - i + 1) * width/20), (Math.floor(millis()/500) % totalLength === i) ? height/2 - 10 - width/40 : height/2 - 10)
        }
        textAlign(LEFT, TOP);
        for (let i = leftStr.length; i < totalLength; i++) {
            const letter = rightStr[i - leftStr.length];
            text(letter, width/2 + ((i - leftStr.length) * width/20), (Math.floor(millis()/500) % totalLength === i) ?  height/2 + 10 - width/40 : height/2 + 10)
        }
    } else {
        background(0);
        if (!shredded && !shredding) {
            currentImageAncor = [width/2 - currentImage.width/2, height/2 - currentImage.height/2];
            image(currentImage, currentImageAncor[0],currentImageAncor[1]);
            for (let i = 0; i < currentImage.width * shreddingSpeed; i++) {
                let p = currentImageUnsorted.pop();
                currentImageSorted.unshift(p);
            }
            sortGeneratorInstance = blockSort(currentImageSorted, "brightness", true);
            shreddingProcess += shreddingSpeed;
            shredding = true;
        } else if (shredding) {
            const st = sortGeneratorInstance.next()
            if (st.done) {
                if (shreddingProcess < currentImage.height) {
                    for (let i = 0; i < currentImage.width * shreddingSpeed; i++) {
                        let p = currentImageUnsorted.pop();
                        currentImageSorted.unshift(p);
                    }
                    sortGeneratorInstance = blockSort(currentImageSorted, "brightness", true);
                    shreddingProcess +=shreddingSpeed;
                    if (shreddingProcess/10 > shreddingSpeed) shreddingSpeed ++;
                } else {
                    shredded = true;
                }
            } else {
                currentImageSorted = st.value;
            }
            image(crop(currentImage, shreddingProcess), currentImageAncor[0], currentImageAncor[1]);
            image(createFromMeta(currentImageSorted, currentImage.width), currentImageAncor[0], currentImageAncor[1] + (currentImage.height - shreddingProcess));
            push();
            stroke(255,0,0);
            line(-1,currentImageAncor[1] + (currentImage.height - shreddingProcess) - 1, width+1, currentImageAncor[1] + (currentImage.height - shreddingProcess) -1);
            pop();
        } else if (shredded) {
            image(createFromMeta(currentImageSorted, currentImage.width), currentImageAncor[0], currentImageAncor[1]);
        }
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    background(0);
}