function parseFromHTML(htmlStr) {
    let p = htmlStr;
    p = p.replace(/\s{2,}/gi, "").trim();
    p = p.replace(/\n/g, "");
    let arr = /<pre class="prettyprint">.+<\/pre>/.exec(p);
    p = arr[0];
    p = p.replace(/<pre class="prettyprint">.+<pre class="prettyprint">/, "");
    p = p.replace(/<span class="meta nocode">.+Accept<\/span><\/span>/, "");
    //p = p.replace(/<\/pre>/, "");
    p = p.replace(/&quot;/g, '"');
    //p = p.replace(/<[a-z][a-z0-9='"#;:&\s\-\+\/\.\?]*\/>/gi, "");
    p = p.replace(/<([a-z][a-z0-9='"_@#;:&\s\-\+\/\.\?]*[a-z0-9='"_@#;:&\s\-\+\.\?]|[a-z])>/gi, "");
    p = p.replace(/<\/[a-z][a-z0-9='"#;:&\s\-\+\/\.\?]*>/gi, "");
    p = p.replace(/[\x20|\x7F]/g, "");
    p = p.replace(/[\x00-\x1F]/g, "");
    //console.log(p);
    return JSON.parse(p);
}
async function fetchNFTmeta(offset) {
    const options = {
        method: 'GET',
        headers: {
            "Accept": 'application/json',
            "Content-Type": 'application/json',
        }
    };
    let urlstr = 'https://api.opensea.io/assets?order_by=sale_date&order_direction=asc&offset=' + offset + '&limit=50';
    fetch(`https://api.allorigins.win/get?url=${urlstr}`, options)
        .then(response => {
            if (response.ok) return response.json();
        })
    .then(response => {
        response = parseFromHTML(response.contents);
        console.log(response);
        for (let index = 0; index < response.assets.length; index++) {
            const a = response.assets[index];
            const m = {};
            m.imageUrl = a.image_url || a.image_original_url;
            if (!m.imageUrl) continue; //might be a video
            m.bg = a.background_color; 
            m.name = a.name;
            if (!a.last_sale) {
                m.price = NaN;
            } else {
                m.price = parseInt(a.last_sale.total_price)/1e18; //WEI to ETH
            }
            if (m.imageUrl === null || m.imageUrl.length === 0) continue;
            if (m.name === null) m.name = "";
            m.author;
            m.topBid;
            if (a.creator && a.creator.user) m.author = {name:a.creator.user.username, iconURL:a.creator.profile_img_url}
            if (a.topBid) m.topBid = a.topBid;
            nftMeta.push(m);
        }
        nextOffset += 55;
        nftMetaReady = true;
        console.log(nftMeta);
        currentWorkTitle = nftMeta[nftMetaCurrentIndex].name;
        currentWorkPrice = nftMeta[nftMetaCurrentIndex].price;
        currentWorkTopBid = nftMeta[nftMetaCurrentIndex].topBid;
        currentWorkAuthor = nftMeta[nftMetaCurrentIndex].author;
        if (currentWorkAuthor && currentWorkAuthor.iconURL && currentWorkAuthor.iconURL.length > 0) {
            currentWorkAuthor.icon = loadImage(currentWorkAuthor.iconURL, () => {authorIconloaded = true})
        } else {
            authorIconloaded = true;
        }
        currentImage = loadImage(nftMeta[nftMetaCurrentIndex].imageUrl, () => { imageLoaded = true; processImage(currentImage, currentWorkTitle).then(m => { currentImageUnsorted = m; metaCreated = true }, e => { console.error(e); }) });
    })
    .catch(err => console.error(err));
}

function nextNFT(){
    currentImage = undefined;
    currentWorkTitle = undefined;
    currentWorkAuthor = undefined;
    currentWorkPrice = undefined;
    currentWorkTopBid = undefined;
    imageLoaded = false;
    authorIconloaded = false;
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
        currentWorkTopBid = nftMeta[nftMetaCurrentIndex].topBid;
        currentWorkAuthor = nftMeta[nftMetaCurrentIndex].author;
        if (currentWorkAuthor && currentWorkAuthor.iconURL && currentWorkAuthor.iconURL.length > 0) {
            currentWorkAuthor.icon = loadImage(currentWorkAuthor.iconURL, () => {authorIconloaded = true})
        } else {
            authorIconloaded = true;
        }
        currentImage = loadImage(nftMeta[nftMetaCurrentIndex].imageUrl, () => { imageLoaded = true; processImage(currentImage, currentWorkTitle).then(m => { currentImageUnsorted = m; metaCreated = true }, e => { console.error(e); }) });
    } else {
        nftMeta = [], nftMetaCurrentIndex=0, nftMetaReady = false;
        fetchNFTmeta(nextOffset);
    }
}