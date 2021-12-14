//PImage, string
async function processImage(img, title) {
    const padLeft = function(nr, n, str){
        return Array(n-String(nr).length+1).join(str||'0')+nr;
    }
    //-----------------------------------------------------------------------------
    img.loadPixels();
    const imgWidth = img.width;
    const imgHeight = img.height;
    const imgWidthDigitNo = imgWidth.toString().length;
    const imgHeightDIgitNo = imgHeight.toString().length;
    const meta = []
    for (let i = 0; i < img.pixels.length; i += 4) {
        const pixel = [img.pixels[i], img.pixels[i+1], img.pixels[i+2], img.pixels[i+3]];
        const bri = brightness([img.pixels[i], img.pixels[i+1], img.pixels[i+2], img.pixels[i+3]]);
        const name = title + "_" + padLeft((i / 4) % imgWidth, imgWidthDigitNo) + "_" + padLeft(Math.floor((i/4) / imgWidth) , imgHeightDIgitNo);
        meta.push({pixel:pixel, brightness: bri, name:name, id:i/4});
    }
    return new Promise((res, rej) => {
        res(meta);
        rej("fail to create img meta");
      })
}

function downloadAll(meta) {
    let zip = new JSZip();
    let count = 0;
    meta.forEach(m => {
        const thisImg = new p5.Image(1, 1);
        thisImg.loadPixels();
        for (let i = 0; i < thisImg.pixels.length; i++) {
            thisImg.pixels[i] = m.pixel[i];
        }
        thisImg.updatePixels();
        const thisCanvas = thisImg.canvas;
        thisCanvas.toBlob((blob) => {
            let fileName = m.name;
            zip.file(fileName+".png", blob, {});
            count++;
            if (count >= meta.length) {
                zip.generateAsync({
                    type: 'blob'
                }).then(function(content) {
                    saveAs(content, "shredded_papers.zip");
                });
            }
        }, 'image/png', 1);
    });
}

function crop(image, lineTOGetRidof){
    let cropped = createImage(image.width, image.height - lineTOGetRidof);
    cropped.copy(image, 0, 0, cropped.width, cropped.height, 0, 0, cropped.width, cropped.height);
    return cropped;
}

function createFromMeta(meta, width){
    let h = parseInt(meta.length / width);
    let w = width;
    let img = createImage(w,h);
    img.loadPixels();
    let mind = 0;
    for(let x = img.width - 1; x >= 0; x--) {
        for (let y = 0; y < img.height; y++) {
            let i = (y * img.width + x) * 4;
            img.pixels[i] = meta[mind].pixel[0];
            img.pixels[i + 1] = meta[mind].pixel[0 + 1];
            img.pixels[i + 2] = meta[mind].pixel[0 + 2];
            img.pixels[i + 3] = meta[mind].pixel[0 + 3];
            mind ++;
        }
    }
    img.updatePixels();
    return img;
}

function saveSingle(meta, ind) {
    let img = createImage(1,1);
    img.loadPixels();
    for (let i = 0; i < img.pixels.length; i++) {
        img.pixels[i] = meta[ind].pixel[i];
    }
    img.updatePixels();
    save(img, meta[ind].name + '.png')
}