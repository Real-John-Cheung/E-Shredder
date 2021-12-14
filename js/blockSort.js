//refer to https://github.com/Faizanabid36/Block-Sort/blob/7589ab020e6e2bd1b1ec284cb5e452a0f2584c9b/BlockSort/BlockSort/Program.cs#L213
//refer to https://en.wikipedia.org/wiki/Block_sort#Overview 

function* blockSort(input, sortby, descend) {
    const _mergeExtract = function(arr, numBlocks, buffer, remainingPart, sortby){
        let unsorted = [];
        let sorted = [];
        for (let i = 0; i < buffer; i++) {
            unsorted.push(arr[i]);
        }
        sorted = _mergeSort(unsorted, sortby);
        _mergeBlocks(sorted, bufferController, sortby);
    }

    const _mergeSort = function (unsorted, sortby) {
        if (unsorted.length <= 1) {
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
        Left = _mergeSort(Left, sortby);
        Right = _mergeSort(Right, sortby);
        return _merge(Left, Right, sortby);
    }

    const _merge = function (left, right, sortby) {
        let result = [];
        while(left.length > 0 || right.length > 0){
            if (left.length > 0 && right.length > 0) {
                if (sortby !== undefined) {
                    if (descend) {
                        if (left[0][sortby] >= right[0][sortby]) {
                            result.push(left[0]);
                            left.shift();
                        } else {
                            result.push(right[0]);
                            right.shift();
                        }
                    } else {
                        if (left[0][sortby] <= right[0][sortby]) {
                            result.push(left[0]);
                            left.shift();
                        } else {
                            result.push(right[0]);
                            right.shift();
                        }
                    }
                } else {
                    if (descend) {
                        if (left[0] >= right[0]) {
                            result.push(left[0]);
                            left.shift();
                        } else {
                            result.push(right[0]);
                            right.shift();
                        }
                    } else {
                        if (left[0] <= right[0]) {
                            result.push(left[0]);
                            left.shift();
                        } else {
                            result.push(right[0]);
                            right.shift();
                        }
                    }
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

    const _mergeBlocks = function (arr, increaseBy, sortby) {
        let remainingPart = (arr.length % parseInt(buffer));
        let test = increaseBy - parseInt(buffer);
        if (arr.length % parseInt(buffer) === 0) {
            for (let index = 0; index < arr.length; index++) {
                mergedArray[test] = arr[index % mergedArray.length];
                test++;
            }
            finalArray = mergedArray;
        } else {
            let targetLength = mergedArray.length + remainingPart - parseInt(buffer);
            while (mergedArray.length > targetLength) {
                mergedArray.pop();
            }
            while (mergedArray.length < targetLength) {
                mergedArray.push(null);
            }
            for (let index = 0; index < remainingPart; index++) {
                mergedArray[test] = arr[index % mergedArray.length];
                test++;
            }
            finalArray = mergedArray;
        }
        insertionSort(mergedArray, sortby);
        if (mergedArray.length < array.length) {
            let targetLength = arr.length + increaseBy - remainingPart;
            while (mergedArray.length > targetLength) {
                mergedArray.pop();
            }
            while (mergedArray.length < targetLength) {
                mergedArray.push(null);
            }
        }
    }

    const insertionSort = function (arr, sortby) {
        let i,key,j;
        for(i = 1; i < arr.length; i++) {
            key = arr[i];
            j = i - 1;
            if (sortby !== undefined) {
                if (descend) {
                    while(j > -1 && arr[j][sortby] < key[sortby]) {
                        arr[j + 1] = arr[j];
                        j = j - 1;
                    }
                } else {
                    while(j > -1 && arr[j][sortby] > key[sortby]) {
                        arr[j + 1] = arr[j];
                        j = j - 1;
                    }
                }
            } else {
                if (descend) {
                    while(j > -1 && arr[j] < key) {
                        arr[j + 1] = arr[j];
                        j = j - 1;
                    }
                } else {
                    while(j > -1 && arr[j] > key) {
                        arr[j + 1] = arr[j];
                        j = j - 1;
                    }
                }
            }
            arr[j + 1] = key;
        }
    }

    const getToYield = function (merged) {
        let res = [], br;
        for (let i = 0; i < merged.length; i++) {
            if (merged[i] === null) {
                br = i;
                break;
            }
            res[i] = merged[i]
        }
        if (br === undefined) br = merged.length
        for (let j = br; j < array.length; j++) {
            res[j] = array[j];
        }
        return res;
    }
    //-------------------------------------------------------
    let array = input;
    if (typeof sortby === "boolean" && descend === undefined) {
        descend = sortby;
        sortby = 0;
    }
    if (Array.isArray(array[0]) && typeof sortby !== 'number') sortby = 0;
    if (typeof array[0] !== 'object') sortby = undefined;
    let arrSize = array.length;
    let finalArray = [];
    let sortedArray = [];
    let mergedArray = [];
    let numBlocks;
    let buffer = parseInt(Math.sqrt(arrSize));
    let bufferController = 0;
    numBlocks = arrSize / buffer;
    let temp = new Array(buffer);
    mergedArray = new Array(buffer);
    if (arrSize % buffer === 0) {
        for (let i = 0; i < arrSize; i+= buffer) {
            for (let j = bufferController; j < Math.min(bufferController + buffer,array.length); j++) {
                temp[j % buffer] = array[j];
            }
            bufferController += buffer;
            _mergeExtract(temp, parseInt(numBlocks), parseInt(buffer), 0, sortby);
            yield getToYield(finalArray);
        }
        numBlocks = parseInt(numBlocks);
    } else {
        let remainingPart = arrSize % buffer;
        for (let i = 0; i < arrSize; i+= buffer) {
            for (let j = bufferController; j < Math.min(bufferController + buffer,array.length); j++) {
                temp[j % buffer] = array[j];
            }
            bufferController += buffer;
            if (i === numBlocks * buffer - remainingPart) {
                _mergeExtract(temp, parseInt(numBlocks), parseInt(remainingPart), parseInt(remainingPart), sortby);
            } else {
                _mergeExtract(temp, parseInt(numBlocks), parseInt(buffer), parseInt(remainingPart), sortby);
            }
            yield getToYield(finalArray);
        }
        numBlocks = parseInt(numBlocks);
    }

    return finalArray;
}