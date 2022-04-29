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

    /* 初始化 TapPay */
    initialTapPay();  
   
    /* 
        [DOM] 取得 刪除行程 按鈕
        按鈕 綁監聽，點擊刪除行程
    */
    let DeleteBookingBtn = document.querySelector('.sightImgAndOrderData img');
    DeleteBookingBtn.addEventListener('click', deleteBookingBtnCallback);

    /* 
        [DOM] 取得 確認訂購並付款 按鈕
        按鈕綁監聽，付款   
    */
    let ConfirmBtn = document.querySelector("button#checkOrder");
    ConfirmBtn.addEventListener('click', function(e){
                e.preventDefault();
                confirmBtnCallback(Result);
    }); 
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

function initialTapPay()
{    
    let APP_ID  = 124301;
    let APP_KEY = 'app_wdUhNv0x3NTm1tzQBGaiFQAImHFjDSZKDwFTbcHHx1CPArcwexUpBuDgWgTv';    
    
    /*
        設定TapPay連線資訊
        - appID         TapPay帳號  appid
        - appKey        TapPay帳號  appkey
        - serverType    使用的伺服器種類
                        測試時請使用 Sandbox 環境 (‘sandbox’)
                        實體上線後請切換至 Production 環境 ('production’)
    */
    TPDirect.setupSDK(APP_ID, APP_KEY, 'sandbox');
    
    /* 設定外觀 */
    let fields = {
        number: {
            // css selector
            element    : '#card-number',
            placeholder: '**** **** **** ****'
        },
        expirationDate: {
            // DOM object
            element    : document.getElementById('card-expiration-date'),
            placeholder: 'MM / YY'
        },
        ccv: {
            element    : '#card-ccv',
            placeholder: '後三碼'
        }
    }

    /* 設定CSS外觀 */
    TPDirect.card.setup({
        fields: fields,
        styles: {
            // Style all elements
            'input': {
                'color': 'gray'
            },
            // Styling ccv field
            'input.ccv': {
                // 'font-size': '16px'
            },
            // Styling expiration-date field
            'input.expiration-date': {
                // 'font-size': '16px'
            },
            // Styling card-number field
            'input.card-number': {
                // 'font-size': '16px'
            },
            // style focus state
            ':focus': {
                // 'color': 'black'
            },
            // style valid state
            '.valid': {
                'color': 'green'
            },
            // style invalid state
            '.invalid': {
                'color': 'red'
            },
            // Media queries
            // Note that these apply to the iframe, not the root window.
            '@media screen and (max-width: 400px)': {
                'input': {
                    'color': 'orange'
                }
            }
        }
    })    
}

/* 確認訂購並付款 */
function confirmBtnCallback(BookingInfo)
{    
    console.log('[DBG] confirmBtnCallback');
    
    // 取得景點與預約資訊
    let SightId         = BookingInfo.data.attraction.id;
    let SightName       = BookingInfo.data.attraction.name; 
    let SightAddress    = BookingInfo.data.attraction.address;
    let SightImg        = BookingInfo.data.attraction.image;    
    let BookingDate     = BookingInfo.data.date;
    let BookingTime     = BookingInfo.data.time;
    let BookingPrice    = BookingInfo.data.price; 
    
    /* 讀取 and 驗證 聯絡資訊格式是否正確 */
    
    // 正規表示法 Pattern
    let ReNamePattern  = /^[\u4e00-\u9fa5]{2,12}$|^[a-zA-Z\s]{3,30}$/;                   // Name
    let ReEmailPattern = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;  // Email
    let RePhonePattern = /^09[0-9]{8}$/;                                                 // Phone
        
    let ContactName    = document.getElementById("contactName").value;
    let ContactEmail   = document.getElementById("contactEmail").value;
    let ContactPhone   = document.getElementById("contactPhone").value;
    let ErrorAlert     = document.getElementById("errorAlert");
    
    let CheckNameFormat  = ReNamePattern.test(ContactName);
    let CheckEmailFormat = ReEmailPattern.test(ContactEmail);
    let CheckPhoneFormat = RePhonePattern.test(ContactPhone);    
    
    // 若聯絡資訊 任一欄位 輸入格式有誤，則列印提醒訊息 且停止訂購
    if (CheckNameFormat== false || CheckNameFormat == false || CheckPhoneFormat == false)
    {
        if (CheckNameFormat == false)
            ErrorAlert.textContent = "*請輸入正確的中文姓名或英文姓名";
        
        if (CheckEmailFormat == false)
            ErrorAlert.textContent = "*信箱格式不正確";
        
        if (CheckPhoneFormat == false)
            ErrorAlert.textContent = "*手機號碼格式不正確";
        
        return;
    } 
    
    // 確認信用卡相關欄位，是否符合信用卡規則 
    // 且確認是否可以 getPrime 
    const tappayStatus = TPDirect.card.getTappayFieldsStatus();    
    if (tappayStatus.canGetPrime === false) 
    {
        ErrorAlert.textContent = "*請輸入正確信用卡資訊";
        console.log('[DBG] can not get prime');
        return;
    }
    
    // 連線至TapPay，將卡號轉換成 Prime
    TPDirect.card.getPrime((result) => {
        
        if (result.status !== 0) 
        {
            ErrorAlert.textContent = "*請輸入正確信用卡資訊";
            console.log('[DBG] get prime error ' + result.msg);
            return;
        }
        
        let Prime = result.card.prime;
        console.log('[DBG] get prime 成功，prime: ' + Prime);

		// 建立傳送至後端 api/orders 資料 
        let order_data = {
           "prime": Prime,
           "order":{
               "price"  : BookingPrice,
               "trip"   : {
                   "attraction": {
                       "id"      : SightId,
                       "name"    : SightName,
                       "address" : SightAddress,
                       "image"   : SightImg
                   },
                   "date" : BookingDate,
                   "time" : BookingTime
                },
               "contact": {
                   "name"  : ContactName,
                   "email" : ContactEmail,
                   "phone" : ContactPhone
                }
            }
        }

        //呼叫 API 將 Prime 送至後端
        fetch('/api/orders',
            {
                method  : 'POST',
                body    :  JSON.stringify(order_data),
                headers :{ 'Content-Type': 'application/json;'}
            }
        )
        .then(res => 
            {
                return res.json();
            }
        )
        .then(result => 
            {
                console.log('[DBG] [orders] Result = ', result);
                 
                if ("error" in result)                
                {
                    
                } 
                else  // 若付款成功，則跳轉至 thankyou 頁面
                {
                    let query = result["data"]["number"];
                    
                    // 跳轉預定行程頁面
                    location.href = "/thankyou?number=" + query; 
                    
                    // 移除已付款預約行程
                    // deleteBookingBtnCallback();                    
                }
            }
        )
    })
}

// 取得目前會員 登入狀態，若 未登入，則 跳轉首頁
initialLoginStatus();

// 等待網頁完全讀取完畢
window.addEventListener('load', loadDoneCallback);

//PrintWindowsLocation();