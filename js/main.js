/*
2021
By JohnC
using p5js 
*/
class BlockSort{
    //refer to https://github.com/Faizanabid36/Block-Sort/blob/7589ab020e6e2bd1b1ec284cb5e452a0f2584c9b/BlockSort/BlockSort/Program.cs#L213
    //refer to https://en.wikipedia.org/wiki/Block_sort#Overview 
    constructor(array){
        this.array = array;
        this.arrSize = this.array.length;
        this.finalArray = [];
        this.sortedArray = [];
        this.mergedArray = [];
        this.buffer;
        this.numBlocks;
        this.bufferController = 0;
        this._createBuffer();
    }

    _createBuffer(){
        this.buffer = parseInt(Math.sqrt(this.arrSize));
        this.numBlocks = this.arrSize / this.buffer;
        let temp = new Array(this.buffer);
        this.bufferController = 0;
        this.mergedArray = new Array(this.buffer);
        if (this.arrSize % this.buffer === 0) {
            for (let i = 0; i < this.arrSize; i += this.buffer) {
                for (let j = this.bufferController; j < Math.min(this.bufferController + this.buffer, this.array.length); j++) {
                   temp[j % this.buffer] = this.array[j];
                }
                this.bufferController += this.buffer;
                this._mergeExtract(temp, parseInt(this.numBlocks), parseInt(this.buffer), 0)
            }
            this.numBlocks = parseInt(this.numBlocks);
        } else {
            let remainingPart = this.arrSize % this.buffer;
            for (let i = 0; i < this.arrSize; i += this.buffer) {
               for (let j = this.bufferController; j < Math.min(this.bufferController + this.buffer, this.array.length); j++) {
                   temp[j%this.buffer] = this.array[j];
               }
               this.bufferController += this.buffer;
               if (i === this.numBlocks * this.buffer - remainingPart){
                    this._mergeExtract(temp, parseInt(this.numBlocks), parseInt(remainingPart), parseInt(remainingPart));
               } else {
                    this._mergeExtract(temp, parseInt(this.numBlocks), parseInt(this.buffer), parseInt(remainingPart));
               }
            }
            this.numBlocks = parseInt(this.numBlocks);
        }
    }

    _mergeExtract(arr, numBlocks, buffer, remainingPart){
        let unsorted = [];
        let sorted = [];
        for (let i = 0; i < buffer; i++) {
            unsorted.push(arr[i]);
        }
        sorted = this._mergeSort(unsorted);
        this._mergeBlocks(sorted, this.bufferController);
    }

    _mergeSort(unsorted){
        if (unsorted.length <= 1){
            return unsorted;
        } 
        let Left = [];
        let Right = [];
        let middle = parseInt(unsorted.length / 2);
        for (let i = 0; i < middle; i++) {
            Left.push(unsorted[i]);
        }
        for (let i = middle; i < unsorted.length; i++) {
            Right.push(unsorted[i]);
        }
        Left = this._mergeSort(Left);
        Right = this._mergeSort(Right);
        return this._merge(Left, Right);
    }

    _merge(left, right){
        let result = [];
        while(left.length > 0 || right.length > 0){
            if (left.length > 0 && right.length > 0) {
                if (left[0] <= right[0]) {
                    result.push(left[0]);
                    left.shift();
                } else {
                    result.push(right[0]);
                    right.shift();
                }
            } else if (left.length > 0) {
                result.push(left[0]);
                left.shift();
            } else if (right.length > 0) {
                result.push(right[0]);
                right.shift();
            }
        }
        return result;
    }

    _mergeBlocks(arr, increaseBy){
        let remainingPart = parseInt(arr.length % this.buffer);
        let test = increaseBy - this.buffer;
        for (let i = 0; i < arr.length; i++) {
            this.mergedArray[test] = arr[i % this.mergedArray.length];
            test ++;
        }
        this.finalArray = this.mergedArray;
        this.insertionSort(this.mergedArray);
    }

    insertionSort(arr){
        let i,key,j;
        for(i = 1; i < arr.length; i++) {
            key = arr[i];
            j = i - 1;
            while(j > -1 && arr[j] > key) {
                arr[j + 1] = arr[j];
                j = j - 1;
            }
            arr[j + 1] = key;
        }
    }

    getSorted(){
        return this.finalArray;
    }
}

const getImages = function() {
    
}

/*
Input: an Image
Return: an Array of images
*/
const sherd = function(image){
    const res = []
    image.loadPixels();
    for (let i = 0; i < image.pixels.length; i+=4) {
      const thisSeg = createImage(1,1);
      thisSeg.loadPixels();
      for (let j = 0; j < 4; j++) {
        thisSeg.pixels[j] = image.pixels[i + j]
      }
      thisSeg.updatePixels();
      res.push(thisSeg);
    }
    return res;
}

const sort = function*(image){

}
//------------------------------------------------------------------------------------------
let currentImage;

function preload() {
    //currentImage = getImages();
}

function setup(){
    createCanvas(windowWidth,windowHeight);
    background(0);
    let sort = new BlockSort([1.3,2.3,4.3,1.1,3.2,2,4.5]);
    console.log(sort)
    console.log(sort.getSorted())
}

function draw(){
    //
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    background(0);
}