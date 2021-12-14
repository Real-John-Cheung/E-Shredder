/*
2021
By JohnC
using p5js 
*/
let bloxFont, soundStart, soundLoop, soundStop;
function preload() {
    bloxFont = loadFont("../media/Blox2.ttf");
}
const soundVolumeShredder = 0.5;
const shreddingSpeed = 10;
const sortSpeed = 5;
let currentImage, currentWorkTitle, shredderSound, uisfx;
let soundStartInstance, soundLoopInstance;
let imageLoaded = false, soundLoaded = 0, metaCreated = false, count0 = 0;
let shredding = false;
let shredded = false;
let shreddingLastV;
let currentImageUnsorted;
let currentImageSorted = [];
let currentImageAncor = new Array(2);
let shreddingProcess = 0;
let sortGeneratorInstance;

function setup() {
    createCanvas(windowWidth, windowHeight);
    background(0);
    soundStart = new Howl({ src: ["../media/shredderStart.mp3"], onload: () => { soundLoaded++ } });
    soundLoop = new Howl({ src: ["../media/shredderLoop.mp3"], onload: () => { soundLoaded++ }, onfade: () => { soundLoop.stop() } });
    soundStop = new Howl({ src: ["../media/shredderStop.mp3"], onload: () => { soundLoaded++ } });
    uisfx = new Howl({ src: ["../media/ui.ogg"], onload: () => { soundLoaded++ } });
    //fetchNFT(currentImage, currentWorkTitle, () => {imageLoaded = true} );
    currentImage = loadImage("../cytopunk.png", () => { imageLoaded = true; processImage(currentImage, currentWorkTitle).then(m => { currentImageUnsorted = m; metaCreated = true }, e => { console.error(e); }) });
    currentWorkTitle = 'cytopunk';

}

function draw() {
    background(0);
    // push();
    // fill(255);
    // textSize(20);
    // text(frameRate(), 20, 20)
    // pop();
    if (!imageLoaded || soundLoaded < 4 || !metaCreated) {
        // loading animation
        push();
        fill(255);
        noStroke();
        textFont(bloxFont);
        textSize(width / 20);
        textAlign(RIGHT, BOTTOM);
        const leftStr = "FINDING";
        const rightStr = "NFTs  ";
        const totalLength = leftStr.length + rightStr.length;
        for (let i = 0; i < leftStr.length; i++) {
            const letter = leftStr[i];
            text(letter, width / 2 + width / 10 - ((leftStr.length - i + 1) * width / 20), (Math.floor(millis() / 500) % totalLength === i) ? height / 2 - 10 - width / 40 : height / 2 - 10)
        }
        textAlign(LEFT, TOP);
        for (let i = leftStr.length; i < totalLength; i++) {
            const letter = rightStr[i - leftStr.length];
            text(letter, width / 2 + ((i - leftStr.length) * width / 20), (Math.floor(millis() / 500) % totalLength === i) ? height / 2 + 10 - width / 40 : height / 2 + 10)
        }
        pop();
    } else {
        if (!shredded && !shredding) {
            currentImageAncor = [width / 2 - currentImage.width / 2, height / 2 - currentImage.height / 2];
            image(currentImage, currentImageAncor[0], currentImageAncor[1]);
            currentImageSorted.unshift(...currentImageUnsorted.splice(-(currentImage.width * shreddingSpeed)));
            sortGeneratorInstance = blockSort(currentImageSorted, "brightness", true);
            shreddingProcess += shreddingSpeed;
            soundStart.volume(soundVolumeShredder);
            soundStartInstance = soundStart.play();
            shredding = true;
        } else if (shredding) {
            if (soundStart.playing(soundStartInstance) && soundStart.duration() - soundStart.seek(soundStartInstance) < 0.4 && !soundLoop.playing()) {
                soundLoop.volume(soundVolumeShredder);
                soundLoopInstance = soundLoop.play();
            }
            let st;
            for (let times = 0; times < sortSpeed; times++) {
                st = sortGeneratorInstance.next();
                if (st.done) {
                    break;
                } else {
                    shreddingLastV = st.value;
                }
            }
            count0++;
            if (count0 % 10 === 0 && currentImageUnsorted.length > 0) {
                currentImageSorted.unshift(...currentImageUnsorted.splice(-(currentImage.width * shreddingSpeed)));
                sortGeneratorInstance = blockSort(currentImageSorted, "brightness", true);
                shreddingProcess += shreddingSpeed;
            }
            if (st.done) {
                if (currentImageUnsorted.length > 0) {
                    currentImageSorted.unshift(...currentImageUnsorted.splice(-(currentImage.width * shreddingSpeed)));
                    sortGeneratorInstance = blockSort(currentImageSorted, "brightness", true);
                    shreddingProcess += shreddingSpeed;
                    count0 = 1;
                } else {
                    soundLoop.fade(soundVolumeShredder, 0, 0.5, soundLoopInstance);
                    soundStop.volume(soundVolumeShredder);
                    soundStop.play();
                    shredded = true;
                    shredding = false;
                    currentImageSorted = shreddingLastV
                }
            } else {
                currentImageSorted = shreddingLastV;
            }
            if (shreddingProcess >= currentImage.height) {
                soundLoop.fade(soundVolumeShredder, 0, 0.5, soundLoopInstance);
                soundStop.volume(soundVolumeShredder);
                soundStop.play();
                shredded = true;
                shredding = false;
                currentImageSorted = shreddingLastV;
                sortGeneratorInstance.return();
            }
            if (currentImageUnsorted.length > 0) image(crop(currentImage, shreddingProcess), currentImageAncor[0], currentImageAncor[1]);
            image(createFromMeta(currentImageSorted, currentImage.width), currentImageAncor[0], currentImageAncor[1] + (currentImage.height - shreddingProcess));
            push();
            if (currentImageUnsorted.length > 0) {
                stroke(255, 0, 0);
                line(-1, currentImageAncor[1] + (currentImage.height - shreddingProcess) - 1, width + 1, currentImageAncor[1] + (currentImage.height - shreddingProcess) - 1);
            } else {
                stroke(0, 255, 0);
                //line(currentImageAncor[0] - 1 + (millis() % 2000 - 1000)/2000 * (currentImage.width + 1), -1, currentImageAncor[0] - 1 + (millis() % 2000 - 1000)/2000 * (currentImage.width + 1),height - 1);
            }
            pop();
            //if (shreddingProcess/20 > sortSpeed) sortSpeed ++;
        } else if (shredded) {
            image(createFromMeta(currentImageSorted, currentImage.width), currentImageAncor[0], currentImageAncor[1]);
            //show buttons and timer
            if (mouseX < currentImageAncor[0] + currentImage.width && mouseX > currentImageAncor[0] && mouseY < currentImageAncor[1] + currentImage.height && mouseY > currentImageAncor[1]) {
                let xPos = Math.floor(mouseX - currentImageAncor[0]);
                let yPos = Math.floor(mouseY - currentImageAncor[1]);
                let index = (currentImage.width - xPos) * currentImage.height + yPos
                push();
                strokeWeight(2);
                stroke(144, 100);
                fill(0, 100);
                rect(mouseX, mouseY, 300, 150);
                fill(currentImageSorted[index].pixel);
                noStroke();
                rect(mouseX + 25, mouseY + 25, 100, 100);
                fill(255);
                textSize(14);
                text(currentImageSorted[index].name, mouseX + 150, mouseY + 25);
                pop();
                if (pmouseX !== mouseX || pmouseY !== mouseY) {
                    uisfx.play();
                }
            }
        }
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    background(0);
}