/* 宣告全域變數去紀錄，是否有 下一頁 */
let nextPage = null;
/* 宣告全域變數去紀錄，當前的 關鍵字 */
let keyWord  = null;

/* API - 讀取景點並顯示於網頁上 */
async function getSight(page, keyword = null){

    let apiUrl = '';
    
    // 初始化 API Url
    if (keyword === null)
        apiUrl = `/api/attractions?page=${page}`;
    else
        apiUrl = `/api/attractions?page=${page}&keyword=${keyword}`;
        keyWord = keyword; 

    /* 撈出景點詳細資料 */
    let Response = await fetch(apiUrl);
    let Result   = await Response.json();

    // 若 JSON KEY 中含有 error
    if ("error" in Result)
        return Result;  

    // 從 JSON 中取屬性"nextPage"、"data"
    nextPage  = Result.nextPage;
    sightList = Result.data;

    sightList.forEach(sight => {

        let id       = sight.id;
        let name     = sight.name;
        let images   = sight.images[0];
        let mrt      = sight.mrt? (sight.mrt) : '無捷運可抵達' ;
        let category = sight.category;

        /*處理 文字資料*/
        let leftP             = document.createElement('p');            //新增[下p]標籤
        let rightP            = document.createElement('p');
        let mrtLeftText       = document.createTextNode(mrt);
        let categoryRightText = document.createTextNode(category);
        leftP.appendChild(mrtLeftText);                                 //嵌入文字
        rightP.appendChild(categoryRightText);
        leftP.classList.add('capLeft');                                 //設置 class 屬性
        rightP.classList.add('capRight');

        let div               = document.createElement('div');          //新增 div 標籤
        div.classList.add('capDown');
        div.appendChild(leftP);                                         //div 新增[下p]子節點
        div.appendChild(rightP);

        let capUp             = document.createElement('p');            //新增[上p]標籤
        let nameText          = document.createTextNode(name);
        capUp.appendChild(nameText);
        capUp.classList.add('capUp');
        
        /*處理 圖片資料*/
        let img               = document.createElement('img');          //新增 img 標籤
        let src               = document.createAttribute('src');        //img 設置 src 屬性
        src.value             = images;
        img.setAttributeNode(src);
        let title               = document.createAttribute('alt');      //img 設置 title 屬性
        title.value             = name;
        img.setAttributeNode(title);
        let alt               = document.createAttribute('alt');        //img 設置 alt 屬性
        alt.value             = name;
        img.setAttributeNode(alt);
        
        let width             = document.createAttribute('width');      //img 設置 width、height 屬性
        width.value           = '270px';
        img.setAttributeNode(width);
        let height            = document.createAttribute('height');
        height.value          = '202px';
        img.setAttributeNode(height);

        /* [Step 1.]在首頁中的 每個景點 加入 連結 (Part 3-4)(Step 2. in attraction.js) */  
        let hrefURL = `/attraction/${id}`;
        // console.log(hrefURL);
 
        let a                 = document.createElement('a');            //新增 a 標籤
        let href              = document.createAttribute('href');       //a 設置 href 屬性
        href.value            = hrefURL;
        a.setAttributeNode(href);                                       //將 href 屬性加入至 a 元素
        
        a.appendChild(img);                                             //a 新增 img 子節點 
        
        let bigDiv            = document.createElement('div');          //新增 div 標籤      
        bigDiv.classList.add('cards');                                  //div 設置 class 屬性      
        let picId             = document.createAttribute('id');         //div 設置 id 屬性
        picId.value           = id;
        bigDiv.setAttributeNode(picId);

        bigDiv.appendChild(a);                                          //大div 新增 a、p、div 子節點   
        bigDiv.appendChild(capUp);
        bigDiv.appendChild(div);

        let section           = document.querySelector('.images');      //取得 section 父節點位置
        section.appendChild(bigDiv);                                    //section 新增 大div 子節點
        console.log(section);
        
    });

    return Result; 
}

// 觀察者，頁面捲動到最下方時，自動載入下一個頁面的景點資訊
function addObserver(){

    if (nextPage){

        // 取得倒數第六張圖片的元素
        let currentLastImage = document.querySelector('section.images > div:nth-last-child(6)');
       
        // 響鈴條件：設定和控制在哪些情況下，呼叫 callback 函式
        let options = {}
        
        // 製作鈴鐺：建立一個 intersection observer，帶入相關設定資訊
        let observer = new IntersectionObserver(ObserverCallBack, options)
        
        // 設定觀察對象：觀察是否畫面中出現倒數第六張圖片
        observer.observe(currentLastImage);

    }
}

// 條件達成做什麼：發現網頁畫面中出現倒數第六張圖片，嘗試讀取下一頁景點
function ObserverCallBack(entries, observer){

    // entries 能拿到所有目標元素進出(intersect)變化的資訊
    entries.forEach(entry => {
    
        if (entry.isIntersecting){
        
            // 只在目標元素進入 viewport 時執行這裡的工作
            console.log('[DBG] 目標元素進入');
            
            if (nextPage !== null)
                getSight(nextPage, keyWord);  
        }
        else{ 
        
            // 只在目標元素離開 viewport 時執行這裡的工作
            console.log('[DBG] 目標元素離開');
            
			// 繼續偵測，是否滑動至倒數第六張圖片
            let currentLastImage = document.querySelector('section.images > div:nth-last-child(6)');
            observer.observe(currentLastImage);
        }
    })
}  

async function searchBtnCallback(){

    let input = document.querySelector('input.searchBar');
    
    // 取出搜尋欄位字串
    inputText = input.value;

    // 清除輸入框前次搜尋的文字
    input.value = "";
    
    // 移除網頁上顯示景點
    removePreviousResult();
    
    // 讀取搜尋結果
    Result = await getSight(0, inputText);   
    
    // 如搜尋有問題或出錯，則於網頁中印出訊息
    if ( "error" in Result){
    
        let section = document.querySelector('.images');
        let h3Tag             = document.createElement('h3');
        h3Tag.innerText       = Result.message;
        section.appendChild(h3Tag);

    }  
    else{

        // 加入觀察者，頁面捲動到最下方時，自動載入下一個頁面的景點資訊
        addObserver();

    }
}

// 移除前次搜尋結果
function removePreviousResult(){

    let section = document.querySelector('.images');
    console.log(" [DBG] ", section);
    
    // 移除 section 標籤 內所有景點 div
    while (section.firstChild)
        section.removeChild(section.lastChild);
  
}

/* 初始化 */
async function initial(){ 
   
    // 讀取第0頁景點
    await getSight(0); 

    // 加入觀察者，頁面捲動到最下方時，自動載入下一個頁面的景點資訊
    addObserver();

    // [DOM] 取得 查詢按鈕 的欄位
    let searchBtn = document.querySelector('.searchBtn'); 

    // 搜尋按鈕 綁監聽，點擊按鈕後執行，查詢景點名稱  
    searchBtn.addEventListener('click', searchBtnCallback);

}

/* 隱藏或顯示 登入、註冊狀態 */
function change(state){
    
    let shadow          = document.querySelector('section.shadow');
    let logInBox        = document.querySelector('section.login');
    let registerBox     = document.querySelector('section.register');
    
    if(state === "login"){
       
        shadow.style.display       = 'block';
        logInBox.style.display     = 'block';
        registerBox.style.display  = 'none';
    }
    else if(state === "register"){
        
        shadow.style.display       = 'block';
        registerBox.style.display  = 'block';
        logInBox.style.display     = 'none';           
    }
    else if(state === "close"){
        
        shadow.style.display       = 'none';
        logInBox.style.display     = 'none';
        registerBox.style.display  = 'none';       
    }
    else{
        console.log("error");
    }
}

/* [Onclick] 登入 */
function login(){

    let apiUrl = '/api/user';
    
    /* 正規表示法 - 驗證 Email 的 Pattern */
    let verifyEmailPattern = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;   

    let loginEmail    = document.getElementById('loginEmail').value;
    let loginPassword = document.getElementById('loginPwd').value;
    let loginError    = document.getElementById('loginError');
    
    console.log('[DBG] [login] loginEmail    = ',loginEmail);
    console.log('[DBG] [login] loginPassword = ',loginPassword);
    
    // 確認 Email 是否符合 規格
    if(verifyEmailPattern.test(loginEmail) === false || loginPassword === '' || loginPassword === ' '){

        loginError.textContent = 'Email/密碼 格式錯誤，請重新輸入';        
    }
    else{

        loginError.textContent = '登入中...'; 
  
        fetch(apiUrl,
            {
                method  : 'PATCH',
                body    :  JSON.stringify({

                    'email'    : loginEmail,
                    'password' : loginPassword,

                }),
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
                console.log('[DBG] [login] Result = ', result);
                
                if (result.ok) 
                {
                    window.location.reload(); 
                } 
                else if (result.error) 
                {
                    loginError.textContent   = result.message;
                    loginError.style.display = 'block';
                }
            }
        );
    }
}

/* [Onclick] 註冊 */
function register(){

    let apiUrl = '/api/user';
    
    /* 正規表示法 - 驗證 Email 的 Pattern */
    let verifyEmailPattern = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;    
    
    let registerName        = document.getElementById('registerName').value;
    let registerEmail       = document.getElementById('registerEmail').value;
    let registerPassword    = document.getElementById('registerPwd').value;
    let registerError       = document.getElementById('registerError');
    let registerSuccess     = document.getElementById('registerSuccess');
    
    // 確認 Email 是否符合 規格
    if(verifyEmailPattern.test(registerEmail) == false){

        registerError.textContent   = '請輸入正確的Email格式';   
        registerError.style.display = 'block';
    }
    else if(registerPassword === '' || registerPassword === ' ' || registerName === '' || registerName === ' '){

        registerError.textContent   = '請勿輸入空白符號';
        registerError.style.display = 'block';
    }
    else{

        registerError.textContent   = '註冊中... ';
  
        fetch(apiUrl,
            {
                method  : 'POST',
                body    : JSON.stringify({

                    'name'     : registerName,
                    'email'    : registerEmail,
                    'password' : registerPassword,  

                }),           
                headers : {'Content-Type': 'application/json;'}
            }
        )
        .then(res => 
            {
                return res.json();
            }
        )
        .then(result => 
            {
                console.log('[DBG] [register] Result = ', result);
                
                if (result.ok) 
                {
                    registerError.style.display   = 'none';
                    registerSuccess.style.display = 'block';
                } 
                else if (result.error) 
                {
                    registerError.textContent     = result.message;
                    registerError.style.display   = 'block';
                    registerSuccess.style.display = 'none';
                }
            }
        );
    }
}

/* [Onclick] 登出 */
function logout(){ 

    userLogout();
    window.location.reload();
}

/* 呼叫 api 登出會員 */
function userLogout(){

    let apiUrl = '/api/user';
    
    fetch(apiUrl,
        {
            method  : 'DELETE',            
            headers : {'Content-Type': 'application/json;'}
        }
    )
    .then(res => 
        {
            return res.json();
        }
    )
    .then(result => 
        {
            console.log('[DBG] [LogoutUser] Result = ', result);
        }
    );
}

/* 呼叫 api 取得目前登入狀態，並隱藏顯示 登入/註冊 或 登出系統 */
function getLoginStatus(){

    let apiUrl = '/api/user';
    
    let waitingState  = document.querySelector('a.stateSwitch');
    
    fetch(apiUrl,
        {
            method  : 'GET',            
            headers : {'Content-Type': 'application/json;'}
        }
    )
    .then(res => 
        {
            return res.json();
        }
    )
    .then(result => 
    {
        
        if (result.data != null) 
        {
            waitingState.textContent  = '登出系統';
            let onClickName  = `logout()`;
            waitingState.setAttribute('onclick', onClickName);
            console.log('[DBG]', waitingState);
        } 
        else if (result.data == null)
        {
            waitingState.textContent  = '登入/註冊';
            let onClickName  = `change('login')`;
            waitingState.setAttribute('onclick', onClickName);
            console.log('[DBG]', waitingState);
        }
        
        console.log('[DBG] [GetLoginStatus] Result = ', result);
    }); 
}

/* 檢查會員登入狀態 */
function loadDoneCallback(){     
    
    getLoginStatus();
}

// 等待網頁完全讀取完畢 
window.addEventListener('load', initial);

window.addEventListener('DOMContentLoaded', loadDoneCallback);

