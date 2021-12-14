async function fetchNFTmeta(offset) {
    const options = {method: 'GET'};

    fetch('https://testnets-api.opensea.io/assets?order_by=sale_date&order_direction=desc&offset='+offset+'&limit=50', options)
    .then(response => response.json())
    .then(response => {
        for (let index = 0; index < response.assets.length; index++) {
            const a = response.assets[index];
            const m = {};
            m.imageUrl = a.image_url || a.image_original_url;
            m.bg = a.background_color; 
            m.name = a.name;
            m.price = parseInt(a.last_sale.total_price)/1e18; //WEI to ETH
            if (m.imageUrl === null || m.imageUrl.length === 0) continue;
            if (m.name === null) m.name = "";
            nftMeta.push(m);
        }
        nextOffset += 55;
        nftMetaReady = true;
        currentWorkTitle = nftMeta[nftMetaCurrentIndex].name;
        currentWorkPrice = nftMeta[nftMetaCurrentIndex].price;
        currentImage = loadImage(nftMeta[nftMetaCurrentIndex].imageUrl, () => { imageLoaded = true; processImage(currentImage, currentWorkTitle).then(m => { currentImageUnsorted = m; metaCreated = true }, e => { console.error(e); }) });
    })
    .catch(err => console.error(err));
}

function nextNFT(){
    currentImage = undefined;
    currentWorkTitle = undefined;
    imageLoaded = false;
    metaCreated = false;
    count0 = 0;
    shredding = false;
    shredded = false;
    shreddingLastV = undefined;
    currentImageUnsorted = undefined;
    currentImageSorted = [];
    currentImageAncor = new Array(2);
    shreddingProcess = 0;
    sortGeneratorInstance = undefined;
    finishedTime = 0;
    downloadAllButton = undefined;

    if (nftMetaCurrentIndex + 1 < nftMeta.length) {
        nftMetaCurrentIndex ++;
        currentWorkTitle = nftMeta[nftMetaCurrentIndex].name;
        currentWorkPrice = nftMeta[nftMetaCurrentIndex].price;
        currentImage = loadImage(nftMeta[nftMetaCurrentIndex].imageUrl, () => { imageLoaded = true; processImage(currentImage, currentWorkTitle).then(m => { currentImageUnsorted = m; metaCreated = true }, e => { console.error(e); }) });
    } else {
        nftMeta = [], nftMetaCurrentIndex=0, nftMetaReady = false;
        fetchNFTmeta(nextOffset);
    }
}