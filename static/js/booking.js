console.clear();

console.log('== Start booking.js  ==');

// 未預訂、已預訂、頁尾 區塊
let neverOrder = document.getElementById('neverOrder');
let ordered    = document.getElementById('ordered');
let footer     = document.querySelector('footer');

/*  Part 5 - 3：導覽列上的預定行程文字連結處理

    建立行程 按鈕 Callback
    檢查使用者是否已經登入
    a. 若使用者未登入，打開登入用的跳出式視窗，執行上週完成的登入流程。
    b. 若使用者已經登入，直接將使用者導向預定行程的頁面 ( /booking )
*/
function booking(){

    let apiUrl = '/api/user';

    fetch(apiUrl, 
        {
            method : 'GET',
            headers: {'Content-Type': 'application/json;'}
        }
    )
    .then(res => {
        return res.json();
    }).then(result => {

        // 若已登入，則跳轉至預定行程頁面 booking 
        if(result.data !== null){

            window.location.href = "/booking";
        }
        // 若尚未登入，則打開 登入 用的跳出式視窗，執行 登入流程。
        else if(result.data === null){

            change('login');
        }
    });
}   

/* Part 5 - 5：完成預定行程頁面 */ 
async function getWebApiData(apiUrl){

    if (apiUrl == '')
        return null;
    
    // console.log('[DBG] apiUrl = %s', apiUrl);

    let Response  = await fetch(apiUrl);
    let Result    = await Response.json();

    // console.log('[DBG] Result.data = ', Result.data);

    return Result;
}

async function initialLoginStatus(){
   
    // 取得目前會員 登入狀態
    let apiUrl = '/api/user';
    let Result = await getWebApiData(apiUrl);
      
    // 若 未登入，則跳轉首頁
    if (Result.data == null){

        window.location.href = "/"; 
    }
    else{ 
        
        // 已預訂 Banner，顯示 歡迎訊息
        let orderedBanner = document.querySelector('.greeting .memberName');
        orderedBanner.textContent = Result['data']['name'];   

        // 未預訂 Banner，顯示歡迎訊息
        let neverOrderBanner = document.querySelector('.neverOrder .memberName');
        neverOrderBanner.textContent = Result['data']['name'];
    }
}

async function loadDoneCallback(){ 
   
    // 取得 尚未確認下單的預定行程
    let apiUrl = '/api/booking';
    let Result = await getWebApiData(apiUrl);    
   
    // 渲染畫面
    renderData(Result);
   
    /* 
        [DOM] 取得 刪除行程 按鈕
        按鈕 綁監聽，點擊刪除行程
    */
    let DeleteBookingBtn = document.querySelector('.sightImgAndOrderData img');
    DeleteBookingBtn.addEventListener('click', deleteBookingBtnCallback);
}

// 按鈕 點擊刪除行程 callback
function deleteBookingBtnCallback(){
    
    let apiUrl = '/api/booking';  
   
    fetch(apiUrl,
        {
            method  : 'DELETE'
        }
    )
    .then(res => {
        return res.json();
    })
    .then(result => 
    {
        // 跳轉至預定行程頁面
        window.location.href = "/booking"; 
        
    });      
}

/* 將景點內容顯示於網頁上 */
function renderData(BookingInfo){ 
   
    let sightImg   = document.querySelector('.sightImg');
    let sightName  = document.querySelector('.title #TaipeiSightName');
    let date       = document.querySelector('#tripDate');
    let time       = document.querySelector('#tripTime');
    let fee        = document.querySelector('#tripFee');
    let place      = document.querySelector('#tripPlace');
    let total      = document.querySelector('.checkOrderPrice span');
    
    // 如 JSON KEY 中含有 error
    if ("error" in BookingInfo || BookingInfo.data === null){

        let neverOrder = document.getElementById('neverOrder');
        let ordered    = document.getElementById('ordered');
        let footer     = document.querySelector('footer');

        // 隱藏預約 區塊
        neverOrder.style.display = 'block';
        ordered.style.display    = 'none';
        footer.style.minHeight   = '865px';

        return null; 
    }
   
    let SightId         = BookingInfo.data.attraction.id;
    let SightName       = BookingInfo.data.attraction.name; 
    let SightAddress    = BookingInfo.data.attraction.address;
    let SightImg        = BookingInfo.data.attraction.image;    
    let BookingDate     = BookingInfo.data.date;
    let BookingTime     = BookingInfo.data.time;
    let BookingPrice    = BookingInfo.data.price;   
    
    // 渲染畫面
    neverOrder.style.display        = 'none';
    ordered.style.display           = 'flex';
    footer.style.minHeight          = '104px';
    sightImg.style.backgroundImage  = 'url(' + `${SightImg}` + ')';
    sightName.textContent           = SightName;
    date.textContent                = BookingDate;
    
    if(BookingTime === 'forenoon'){
    
        time.textContent = '早上9點到下午4點';
    }
    else{

        time.textContent = '下午2點到晚上9點';
    }
    
    fee.textContent   = `新台幣 ${BookingPrice} 元`;
    place.textContent = SightAddress;
    total.textContent = `新台幣 ${BookingPrice} 元`;
}

// 取得目前會員 登入狀態，若 未登入，則 跳轉首頁
initialLoginStatus();

// 等待網頁完全讀取完畢
window.addEventListener('load', loadDoneCallback);

//PrintWindowsLocation();