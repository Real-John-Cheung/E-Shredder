/*
2021
By JohnC
using p5js howler.js jszip and FileSaver
using OpenSea's API
*/
let bloxFont, soundStart, soundLoop, soundStop;
function preload() {
    bloxFont = loadFont("./media/Blox2.ttf");
}
const soundVolumeShredder = 0.5;
const shreddingSpeed = 5;
const sortSpeed = 10;
let currentImage, currentWorkTitle, currentWorkPrice, shredderSound, uisfx, novFont, openSeaLogo;
let soundStartInstance, soundLoopInstance, enableSoundNoticeShown = false;
let nftMeta = [], nftMetaCurrentIndex = 0, nftMetaReady = false, nextOffset = 0;
let imageLoaded = false, itemsLoaded = 0, metaCreated = false, count0 = 0;
let shredding = false;
let shredded = false;
let shreddingLastV;
let currentImageUnsorted;
let currentImageSorted = [];
let currentImageAncor = new Array(2);
let shreddingProcess = 0;
let sortGeneratorInstance;
let finishedTime = 0;
let downloadAllButton;

function setup() {
    createCanvas(windowWidth, windowHeight);
    background(0);
    soundStart = new Howl({ src: ["./media/shredderStart.mp3"], onload: () => { itemsLoaded++ } });
    soundLoop = new Howl({ src: ["./media/shredderLoop.mp3"], onload: () => { itemsLoaded++ }, onfade: () => { soundLoop.stop() } });
    soundStop = new Howl({ src: ["./media/shredderStop.mp3"], onload: () => { itemsLoaded++ } });
    uisfx = new Howl({ src: ["./media/ui.ogg"], onload: () => { itemsLoaded++ } });
    novFont = loadFont("./media/nov.ttf", () => { itemsLoaded++ })
    openSeaLogo = loadImage("./media/openSea.png", () => { itemsLoaded++ });
    fetchNFTmeta(nextOffset);
}

function draw() {
    background(0);
    if (!imageLoaded || itemsLoaded < 6 || !metaCreated) {
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
        if (!enableSoundNoticeShown) {
            textAlign(CENTER, BOTTOM);
            textSize(16)
            fill(255, 255 * Math.abs(1000 - millis() % 2000) / 2000);
            text("Click To Enable Sound", width / 2, height - 40);
        }
        pop();
    } else {
        if (!enableSoundNoticeShown) enableSoundNoticeShown = true;
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
            //--------------
            push();
            textFont(bloxFont);
            textSize(width / 40);
            fill(255);
            stroke(0);
            textAlign(CENTER, TOP);
            text(currentWorkTitle, width / 2, 40)
            pop();
            //-------------
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
                    currentImageSorted = shreddingLastV;
                    finishedTime = millis();
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
                finishedTime = millis();
            }
            if (currentImageUnsorted.length > 0) image(crop(currentImage, shreddingProcess), currentImageAncor[0], currentImageAncor[1]);
            image(createFromMeta(currentImageSorted, currentImage.width), currentImageAncor[0], currentImageAncor[1] + (currentImage.height - shreddingProcess));
            push();
            if (currentImageUnsorted.length > 0) {
                stroke(255, 0, 0);
                line(-1, currentImageAncor[1] + (currentImage.height - shreddingProcess) - 1, width + 1, currentImageAncor[1] + (currentImage.height - shreddingProcess) - 1);
            }
            pop();
        } else if (shredded) {
            //--------------
            push();
            textFont(bloxFont);
            textSize(width / 40);
            fill(255);
            stroke(0);
            textAlign(CENTER, TOP);
            text(currentWorkTitle, width / 2, 40)
            pop();
            //-------------
            image(createFromMeta(currentImageSorted, currentImage.width), currentImageAncor[0], currentImageAncor[1]);
            //-----------------
            let timeLeft = 60 - parseInt((millis() - finishedTime) / 1000);
            if (timeLeft <= 0) {
                nextNFT();
                return
            }
            let timerStr = "Next scheduled job\n in " + timeLeft + " seconds";
            push();
            textFont(bloxFont);
            textSize(20);
            fill(255);
            stroke(0);
            textAlign(RIGHT, BOTTOM);
            text(timerStr, width - 30, height - 30);
            textAlign(RIGHT, TOP);
            textSize(18);
            text("NFT Data From", width - 30, 20)
            imageMode(CENTER)
            image(openSeaLogo, width - 80, 60, 100, 25)
            pop();
            //---------------------------
            if (downloadAllButton === undefined) {
                downloadAllButton = new Button(30, height - 100, 180, 70, "Collect all shredded pieces", 20)
            }
            downloadAllButton.display();
            //----------------------------
            if (mouseX < currentImageAncor[0] + currentImage.width && mouseX > currentImageAncor[0] && mouseY < currentImageAncor[1] + currentImage.height && mouseY > currentImageAncor[1]) {
                let xPos = Math.floor(mouseX - currentImageAncor[0]);
                let yPos = Math.floor(mouseY - currentImageAncor[1]);
                let index = (currentImage.width - xPos) * currentImage.height + yPos
                if (currentImageSorted[index] !== undefined) {
                    push();
                    textFont(novFont);
                    strokeWeight(2);
                    stroke(255, 150);
                    fill(0, 150);
                    rect(width - mouseX < 350 ? mouseX - 320 : mouseX, height - mouseY < 170 ? mouseY - 150 : mouseY, 320, 150);
                    fill(currentImageSorted[index].pixel);
                    stroke(144,150);
                    rect((width - mouseX < 350 ? mouseX - 320 : mouseX) + 25, (height - mouseY < 170 ? mouseY - 150 : mouseY) + 25, 100, 100);
                    fill(255);
                    textSize(14);
                    text(currentImageSorted[index].name + ".png", (width - mouseX < 350 ? mouseX - 320 : mouseX) + 150, (height - mouseY < 170 ? mouseY - 150 : mouseY) + 25, 150, 100);
                    text(currentImageSorted[index].id + "/" + currentImageSorted.length, (width - mouseX < 350 ? mouseX - 320 : mouseX) + 150, (height - mouseY < 170 ? mouseY - 150 : mouseY) + 115);
                    text("~ " + (currentWorkPrice / currentImageSorted.length).toFixed(10) + " ETH", (width - mouseX < 350 ? mouseX - 320 : mouseX) + 150, (height - mouseY < 170 ? mouseY - 150 : mouseY) + 135);
                    pop();
                    if (pmouseX !== mouseX || pmouseY !== mouseY) {
                        uisfx.play();
                    }
                }
            }
        }
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    background(0);
}

function mouseClicked() {
    if (downloadAllButton && downloadAllButton.cursorisIn()) {
        if (confirm("You are downloding " + currentImageSorted.length + " image files.\n That might take a lot of time to prepare.\n Click 'OK' if you want to continue.")) {
            downloadAll(currentImageSorted);
        }
    }
    else if (shredded && (mouseX < currentImageAncor[0] + currentImage.width && mouseX > currentImageAncor[0] && mouseY < currentImageAncor[1] + currentImage.height && mouseY > currentImageAncor[1])) {
        let xPos = Math.floor(mouseX - currentImageAncor[0]);
        let yPos = Math.floor(mouseY - currentImageAncor[1]);
        let index = (currentImage.width - xPos) * currentImage.height + yPos;
        saveSingle(currentImageSorted, index);
    }
}