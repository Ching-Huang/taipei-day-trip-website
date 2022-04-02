console.clear();

console.log('== Start attraction.js  ==');

let imagesList         = null;
let currentIndex       = 0;

/* 根據索引值 切換圖片 */
function changeImage(targetIndex){              // targetIndex 為"指定"要顯示某張圖片  
    
    let img         = document.querySelector('div.sightImg');
    let pageDot     = document.getElementsByClassName("pageDot");
    // console.log(pageDot[0]); 
    
    // 確保圖片索引值 在範圍內  
    if(targetIndex >= imagesList.length){       // targetIndex 的指定位置 超出 圖片總張數 時，ex: imagesList[100]
        targetIndex     = 0;
        // currentIndex    = 0;
    }
    else if(targetIndex < 0){                   // targetIndex 的指定位置 不足 圖片總張數 時，ex: imagesList[-1]
        targetIndex     = (imagesList.length)- 1;
        // currentIndex    = (imagesList.length)- 1;
    }

    currentIndex                = targetIndex;  // 指定 某張圖片，就呈現 該張圖(處理"隨機"點選某張圖時)

    // renderImage 為目前 瀏覽器渲染 的圖片
    let renderImage             = imagesList[targetIndex];
    img.style.backgroundImage   = `url(${renderImage})`;
    console.log(renderImage);

    // 所有 點點 都預設 移除 點選功能 與 未點選時的 白色 狀態
    for(i = 0; i < pageDot.length; i++){

        pageDot[i].classList.remove('active');
        pageDot[i].style.borderColor = '#FFFFFF';
    }

    // 點點 "黑底色" 表示 目前 點選 後 顯示 的圖片    
    pageDot[targetIndex].classList.toggle('active');

    // 點點 被點選到才變黑色
    pageDot[targetIndex].style.borderColor = '#000000';
} 

// 取得 api 資料
async function getWebApiData(apiUrl){

    if(apiUrl === ''){
        return null;
    }
    
    let Response = await fetch(apiUrl);
    let Result   = await Response.json();

    return Result;    
}

/* [Step 2.]串接景點 API，取得並展示特定景點資訊 (Part 3-4)(Step 2. in index.js) */
async function loadDoneCallBack(){

    /* 利用 目前網址列中的 path ，來產生 API Url
        [舉例]  
            如目前網址列為         /attraction/1
            則取得景點api的URL  =  /api/attraction/1 
    */
    let apiUrl   = `/api` + window.location.pathname;
    let Result   = await getWebApiData(apiUrl);

    // JSON KEY 中含有 error
    if ("error" in Result){ 
        return Result;
    } 
    
    renderSightData(Result.data);

    /* 自動輪播效果 */
    window.setInterval(imageAutoNext, 5000); // 每五秒   
}

/* 讀取景點資料並渲染在網頁上 (Part 3-2) */
async function renderSightData(sightList){
    
    let sightId          = sightList.id;
    let sightName        = sightList.name;
    let sightMrt         = sightList.mrt? (sightList.mrt) : '無捷運可抵達';
    let sightCategory    = sightList.category;
    let sightDescription = sightList.description;
    let sightAddress     = sightList.address;
    let sightTransport   = sightList.transport;
    let sightImages      = sightList.images;
        
    let name        = document.querySelector('form h2');
    let mrt         = document.querySelector('div p.mrt');
    let category    = document.querySelector('div p.category');
    let description = document.querySelector('article.description p');
    let address     = document.querySelector('article.address p');
    let transport   = document.querySelector('article.transport p');
    let img         = document.querySelector('div.sightImg');
    let dotsBox     = document.querySelector('.pageDots');

    name.textContent            = sightName;
    mrt.textContent             = sightMrt;
    category.textContent        = sightCategory;
    description.textContent     = sightDescription;
    address.textContent         = sightAddress;
    transport.textContent       = sightTransport;
    img.style.backgroundImage   = `url(${sightImages[0]})`;

    // 將景點網址存在全域變數，用於輪播用*/
    imagesList      = sightImages;
    console.log(imagesList);

    // 產生點點: 圖片數量 = 頁點數量 
    for(let imgCount = 0; imgCount < imagesList.length; imgCount++){
        let li           = document.createElement("li");  
        let onClickName  = `changeImage(${imgCount})`;
        
        li.setAttribute('class', 'pageDot'); 
        li.setAttribute('onclick', onClickName); 
        
        dotsBox.appendChild(li);  
    }                
}

/* 完成訂購導覽中的時段選擇 (Part 3-3) */
function showPrice(time){

    let forenoon       = document.querySelector('.forenoon input');  
    let afternoon      = document.querySelector('.afternoon input');
    let forenoonPrice  = document.querySelector('.forenoonFee');
    let afternoonPrice = document.querySelector('.afternoonFee');
    let forenoonRadio  = document.querySelector('#forenoonRadio');
    let afternoonRadio = document.querySelector('#afternoonRadio');

    if(time === 'forenoon'){

        // 選取時段 "上半天"
        forenoon.setAttribute('checked', 'checked');
        afternoon.removeAttribute('checked');

        // 切換 "上半天" 單選核取方塊 顏色
        forenoonRadio.style.backgroundColor  = '#448899';
        afternoonRadio.style.backgroundColor = '#FFFFFF';

        // 顯示費用 "新台幣 2000 元"
        forenoonPrice.removeAttribute('hidden');
        afternoonPrice.setAttribute('hidden', 'true');

    }
    else{

        // 選取時段 "下半天"
        afternoon.setAttribute('checked', 'checked');
        forenoon.removeAttribute('checked');

        // 切換 "下半天" 單選核取方塊 顏色
        afternoonRadio.style.backgroundColor = '#448899';
        forenoonRadio.style.backgroundColor  = '#FFFFFF';

        // 顯示費用 "新台幣 2500 元"
        afternoonPrice.removeAttribute('hidden');
        forenoonPrice.setAttribute('hidden', 'true');

    }
    // console.log("=========[DBG] 上半天=========");
    // console.log(forenoon);
    // console.log(forenoonPrice);
    // console.log(forenoonRadio);

    // console.log("=========[DBG] 下半天=========");
    // console.log(afternoon);
    // console.log(afternoonPrice);
    // console.log(afternoonRadio);
}

// 下一張
function nextPage(){

    console.log("[DBG] nextPageCallback");  
    currentIndex++;
    changeImage(currentIndex);
}

// 上一張
function previousPage(){

    console.log("[DBG] previousPageCallback");
    currentIndex--;
    changeImage(currentIndex);
}

// 自動輪播
function imageAutoNext(){
    console.log("[DBG] imageAutoNext");  
    currentIndex++;
    changeImage(currentIndex);
}

// 等待網頁完全讀取完畢
window.addEventListener('load', loadDoneCallBack);