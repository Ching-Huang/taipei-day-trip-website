console.clear();

console.log('== Start thankyou.js  ==');

async function GetWebApiData(ApiUrl)
{
    if (ApiUrl == '')
        return null;
    
    console.log('[DBG] ApiUrl = %s', ApiUrl);
   
    let Response  = await fetch(ApiUrl);
    let Result    = await Response.json();
   
    console.log('[DBG] Result      = ', Result);
    console.log('[DBG] Result.data = ', Result.data);
    
    return Result;    
}

async function LoadDoneCallback()
{    
    // 取得 訂單編號 並呼叫 api 
    let ordernumber = location.search.split('=')[1];
    let ApiUrl      = `/api/order/${ordernumber}`;
    let Result      = await GetWebApiData(ApiUrl); //<----Here so you need to check python
    console.log(Result);

    // 渲染畫面
    RenderData(Result);
   
}

/* 將景點內容並顯示於網頁上 */
function RenderData(OrderInfo)
{   
    let number          = location.search.split('=')[1];
    let order_number    = document.getElementById("order_number");
    let photo           = document.getElementsByClassName("photo")[0];
    let spot_name       = document.getElementsByClassName("spot_name")[0];
    let date            = document.getElementsByClassName("date")[0];
    let time            = document.getElementsByClassName("time")[0];
    let price           = document.getElementsByClassName("price")[0];
    let address         = document.getElementsByClassName("address")[0];
    let contact_name    = document.getElementById("contact_name");
    let contact_email   = document.getElementById("contact_email");
    let contact_tel     = document.getElementById("contact_tel");    
    
    if( OrderInfo["data"] !== null )
    {
        order_number.textContent    = number;
        photo.style.backgroundImage = 'url(' + `${OrderInfo["data"]["trip"]["attraction"]["image"]}` + ')';
        spot_name.textContent       = OrderInfo["data"]["trip"]["attraction"]["name"];
        date.textContent            = OrderInfo["data"]["trip"]["date"];
        
        if( OrderInfo["data"]["trip"]["time"] === "forenoon" )
            time.textContent = "早上9點到下午4點";
        else
            time.textContent = "下午2點到晚上9點";

        price.textContent           = "新台幣 " + OrderInfo["data"]["price"] + " 元";
        address.textContent         = OrderInfo["data"]["trip"]["attraction"]["address"];
        contact_name.textContent    = OrderInfo["data"]["contact"]["name"];
        contact_email.textContent   = OrderInfo["data"]["contact"]["email"];
        contact_tel.textContent     = OrderInfo["data"]["contact"]["phone"];
    }
}

async function InitialLoginStatus()
{  
    // 取得目前會員 登入狀態
    let ApiUrl = '/api/user';
    let Result = await GetWebApiData(ApiUrl);
    
    // 如未登入會員 則跳轉首頁
    if (Result.data === null)
        location.href = "/"; 
   
}

// 取得目前會員 登入狀態 如未登入會員 則跳轉首頁
InitialLoginStatus();

// 等待網頁完全讀取完畢 
window.addEventListener('load', LoadDoneCallback);