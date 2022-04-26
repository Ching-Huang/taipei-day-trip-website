from flask import *

# 導入 JSON 模組
import json

Travel_Api = Blueprint('Travel_Api', __name__)

# 連接到 MySQL 資料庫
import  mysql.connector

DB_Host = "127.0.0.1"
DB_Name = "taipeisights"
DB_User = "root"
DB_Pwd  = "password"

website = {
    'host'     : DB_Host,
    'user'     : DB_User,
    'password' : DB_Pwd,
    'database' : DB_Name
}

# 查詢比對資料庫中的 email/password 是否正確
def VerifyLogin(email, password):

    connectioin = mysql.connector.connect(**website)
    cursor = connectioin.cursor()

    sql = "SELECT * FROM member WHERE email = %s and password = %s"
    variable = (email, password, )
    cursor.execute(sql, variable)
    SearchResult = cursor.fetchone()
    cursor.close()
    connectioin.close()

    if SearchResult == None:
        print('[DBG] == 無該筆資料 ==')
        return None
    else:
        print('[DBG] == 搜尋結果如下 ==')        
        return SearchResult

# [查]讀取 database 資料，查詢 資料庫中有無 此email( email )
def SearchMemberByEmail(email):

    connectioin = mysql.connector.connect(**website)
    cursor = connectioin.cursor()
   
    sql = "SELECT * FROM member WHERE email = %s"
    variable = (email, )
    cursor.execute(sql, variable)
    SearchResult = cursor.fetchone()
    cursor.close()
    connectioin.close()
       
    '''若無  此email(會印出 空[])，則回傳 null ;
       反之         (會印出 值)  ，則回傳 搜尋結果資料'''
    if SearchResult == []:
        print('[DBG] == 無該筆資料 ==')
        return None
    else:
        print('[DBG] == 搜尋結果如下 ==')
        return SearchResult

# [增]新增 1 筆會員資料到 database 中
# database => member table
def AddNewMemberToDB(name, email, password):

    connectioin = mysql.connector.connect(**website)
    cursor = connectioin.cursor()
    
    sql = "INSERT INTO member (name, email, password) VALUES (%s, %s, %s)"
    member = (name, email, password)
    cursor.execute(sql, member)
    connectioin.commit()        
    cursor.close()
    connectioin.close()

# 取得目前 session 中的 state 狀態
def GetSessionState():
    state = session.get("state")
    if state == None:
        session['state']  = 'Log_Out'
        
    return session.get("state")

# 儲存使用者資訊至 session 中
def SetSession(id, name, email):

    session['id']       = id
    session['name']     = name
    session['email']    = email
    session['state']    = 'Log_in'

# 清除 session 中使用者資料       
def ClearSession():
    if 'name' in session:
        session.clear()  

############################## API-1 ################################
# 撰寫一函數 SearchSight() 輸入 page 以及 keyword 回傳 資料庫的搜尋結果
def SearchSight(page, keyword):

    connectioin = mysql.connector.connect(**website)
    cursor = connectioin.cursor()

    # 若無給定 page ，則為 第 0 頁
    if page == None:
       page = 0

    # 若無給定 keyword ，則為 沒有關鍵字
    if keyword == None:
       keyword = ''

    ''' 每一頁的起始索引值
        page0 從 索引值 0  開始	
        page1 從 索引值 12 開始
        page2 從 索引值 24 開始 '''
    pageStartIndex = page*12
	
	# 根據是否有 關鍵字，決定所使用的 SQL 語法
    if keyword != '':
        searchKeyword = '%' + keyword + '%'
        sql = "SELECT * FROM sightdata WHERE name LIKE %s LIMIT 12 OFFSET %s;"
        variable = (searchKeyword, pageStartIndex)
    else:
        sql = "SELECT * FROM sightdata LIMIT 12 OFFSET %s;"
        variable = (pageStartIndex, )

    cursor.execute(sql, variable)
    SearchResult = cursor.fetchall()
    cursor.close()
    connectioin.close()

    ''' 若搜尋無結果 (會印出 空[])，則回傳 null ;
        反之         (會印出 值) ，則回傳 搜尋結果資料 '''
    if SearchResult == []:       
        return None
    else:      
        return SearchResult

# 處理 關鍵字 回傳搜尋結果的 總共有幾筆	
def SearchSightCount(keyword):

    connectioin = mysql.connector.connect(**website)
    cursor = connectioin.cursor()

    if keyword == None:   
       keyword = ''

    TotalCount = 0
    if keyword != '':
        searchKeyword = '%' + keyword + '%'
        sql = "SELECT COUNT(id) FROM sightdata WHERE name LIKE %s;"
        variable = (searchKeyword, )
        cursor.execute(sql, variable)
    else:
        sql = "SELECT COUNT(id) FROM sightdata;"
        cursor.execute(sql)

    SearchResult = cursor.fetchone()

    cursor.close()
    connectioin.close() 

    TotalCount   = SearchResult[0]
    
    return TotalCount

# 撰寫函數 Build_Resp_SightDataJSON() 輸入，資料庫回傳結果與 nextpage，建立 response 的 JSON 格式
def Build_Resp_SightDataJSON(SearchResult, nextPageNum):

    dataList = []

    # 取出每筆景點
    for spot in SearchResult:

        id           =   spot[0]
        name         =   spot[1]
        category     =   spot[2]
        description  =   spot[3]
        address      =   spot[4]
        transport    =   spot[5]
        mrt          =   spot[6]
        latitude     =   spot[7]
        longitude    =   spot[8]
        imagelist    =   spot[9] 

        # 以逗號分割圖片網址 
        splitPicList = imagelist.split(',')

        # 去除掉最後一筆空值
        splitPicList.pop()

        data = {
            "id"         : id,
            "name"       : name,
            "category"   : category,
            "description": description,
            "address"    : address,
            "transport"  : transport,
            "mrt"        : mrt,
            "latitude"   : latitude,
            "longitude"  : longitude,
            "images"     : splitPicList
        }

        dataList.append(data)
    
    Response = {
		"nextPage": nextPageNum,
		"data" : dataList
	}

    return json.dumps(Response,  ensure_ascii = False, sort_keys=False) # sort_keys=False 不要依字母順序將JSON Key排序

############################## API-2 ################################
# [查]讀取 database 資料，查詢 資料庫中有無 此景點編號( id )
def SearchSightById(id):

    connectioin = mysql.connector.connect(**website)
    cursor = connectioin.cursor()

    sql = "SELECT * FROM sightdata WHERE id = %s"
    variable = (id, )
    cursor.execute(sql, variable)
    SearchResult = cursor.fetchone()

    cursor.close()
    connectioin.close()

    '''若無 此景點編號(會印出 空[])，則回傳 null ;
       反之          (會印出 值)  ，則回傳 搜尋結果資料'''
    if SearchResult == []:
        print('== 無該筆景點資料 ==')
        return None
    else:
        print('== 搜尋結果如下 ==')
        return SearchResult

# 撰寫函數 Build_Resp_SightDataJSONById() 輸入 資料庫回傳結果，建立 response 的 JSON 格式
def Build_Resp_SightDataJSONById(SearchResult):
    
    id           =   SearchResult[0]
    name         =   SearchResult[1]
    category     =   SearchResult[2]
    description  =   SearchResult[3]
    address      =   SearchResult[4]
    transport    =   SearchResult[5]
    mrt          =   SearchResult[6]
    latitude     =   SearchResult[7]
    longitude    =   SearchResult[8]
    imagelist    =   SearchResult[9] 

    # 分割圖片
    splitPicList = imagelist.split(',')

    # 去除掉最後一筆空值
    splitPicList.pop()

    data = {
        "id"         : id,
        "name"       : name,
        "category"   : category,
        "description": description,
        "address"    : address,
        "transport"  : transport,
        "mrt"        : mrt,
        "latitude"   : latitude,
        "longitude"  : longitude,
        "images"     : splitPicList
    }

    Response = {
		"data" : data
	}

    return json.dumps(Response,  ensure_ascii = False, sort_keys=False)
##################################################################### 
# API-1 取得景點資料列表
@Travel_Api.route("/attractions", methods = ['GET'])
def show_sights():

    page    = request.args.get("page", type = int)
    keyword = request.args.get("keyword", type = str)
    
	# 搜尋 關鍵字 回傳搜尋結果 總共有幾筆
    SearchResultCount = SearchSightCount(keyword)

    # 計算 如每頁12筆資料 則總共會有幾頁
    totalPageCount = SearchResultCount // 12  # 只取整數的除法 '//'
    if SearchResultCount % 12 > 0:
        totalPageCount += 1

	# page 最多到幾頁 ( page 從 0 起算)
    maxPageNum = totalPageCount - 1 

	# 如查詢結果筆數為 0 ，則代表 無景點
    if SearchResultCount == 0:
       message  ='關鍵字[{keyword}]，查無景點資料'.format( keyword = keyword )
       Response = { "error": 'true', "message": message }
       return json.dumps(Response, ensure_ascii = False), 400
    elif page > maxPageNum:        
        message  = '搜尋結果共有 0 ~ {Total} 頁,要求頁數超過( {PageIdx} / {MaxPageIdx} )'.format(Total = totalPageCount-1, PageIdx = page, MaxPageIdx = maxPageNum)
        Response = {"error": 'true', "message": message}
        return json.dumps(Response, ensure_ascii = False), 400 
    else:        
            # 判斷是否有下一頁
            if page < maxPageNum: 
                nextPage = page + 1
            else:
                nextPage = None
        
            # 依據要求頁數(page)，關鍵字(keyword) 傳回搜尋結果
            SearchResult = SearchSight(page, keyword)
            
            # 建立回傳的JSON
            Response = Build_Resp_SightDataJSON(SearchResult, nextPage)
            return Response   
    
# API-2 根據景點編號取得景點資料
@Travel_Api.route("/attraction/<int:id>", methods = ['GET'])
def api_attraction_id(id):

	# 搜尋此景點ID 是否於資料庫中
    SearchResult = SearchSightById(id)

	# 若景點編號錯誤 則回傳 400
    if SearchResult == None:
        Response = {"error": 'true', "message": '景點編號不正確'}
        return json.dumps(Response,  ensure_ascii = False), 400
    else:
        Response = Build_Resp_SightDataJSONById(SearchResult)            
        return Response

#  [路由api] 註冊帳號
@Travel_Api.route('/user', methods=['POST'])
def sign_up():
    print('[DBG][sign_up]')    
    
    # 取得前端送來的 Request Body 請求資料  
    RequestBody     = request.json    

    # 讀取 新註冊會員的 姓名、email、密碼
    SignUpName      = RequestBody['name']      
    SignUpEmail     = RequestBody['email']     
    SignUpPwd       = RequestBody['password']    
    
    print('[DBG] Name     = ',SignUpName)
    print('[DBG] Email    = ',SignUpEmail)
    print('[DBG] Password = ',SignUpPwd)    
    
    # 搜尋 member 資料表中是否有此會員
    SearchResult = SearchMemberByEmail(SignUpEmail)
    
    # 若無此會員，則新增資料到 member 資料表 => 註冊成功
    if SearchResult == None:
        AddNewMemberToDB(SignUpName, SignUpEmail, SignUpPwd)
        
        Response = {"ok": 'true'}
        return json.dumps(Response, ensure_ascii = False)   

    # 若有此Email，則不新增資料 => 註冊失敗
    else:
        Response = {"error": 'true', "message": '此Email已被註冊'}
        return json.dumps(Response, ensure_ascii = False), 400  

# [路由api] 登入帳號
@Travel_Api.route('/user', methods=['PATCH'])
def sign_in():
    print('[DBG][sign_in]')

    # 取得前端送來的 Request Body 請求資料
    RequestBody = request.json

    # 讀取 登入會員的 email、密碼
    SignInEmail = RequestBody['email']
    SignInPwd   = RequestBody['password']

    print('[DBG]Email    =', SignInEmail)
    print('[DBG]Password =', SignInPwd)

    # 透過資料庫驗證 email、密碼 是否正確
    SearchResult = VerifyLogin(SignInEmail, SignInPwd)

    print('[DBG] SearchResult', SearchResult)

    # 驗證成功
    if SearchResult != None:

       # 紀錄 目前登入使用者 id、name、email 至 session 中 
        id       = SearchResult[0]
        name     = SearchResult[1]
        email    = SearchResult[3]
        SetSession(id, name, email)

        Response = {"ok": 'true'}
        return json.dumps(Response,  ensure_ascii = False)  

    # 驗證失敗
    else:

        Response = {"error": 'true', "message": 'Email或密碼，輸入錯誤'}
        return json.dumps(Response, ensure_ascii = False), 400   
    
# [路由api] 登出帳號
@Travel_Api.route('/user', methods=['DELETE'])
def sign_out():

    print('[DBG][sign_out]')

    # 清除 session 資料    
    ClearSession()

    Response = {"ok": 'true'}
    return json.dumps(Response, ensure_ascii = False)

# [路由api] 查詢帳號
@Travel_Api.route('/user', methods=['GET'])
def sign_state():

    print('[DBG][sign_state]')

    # 查詢 session 中使用者登入、登出的狀態
    state = GetSessionState()

    # 若已登入，則回傳 使用者資訊(依照api)
    if session['state'] == 'Log_in':

        Response ={
                    "data": {
                        "id"   : session['id'],
                        "name" : session['name'],
                        "email": session['email'] 
                    }
                  }
    else:
        Response = {"data": None}
    
    return json.dumps(Response, ensure_ascii = False)

# 處理 伺服器內部錯誤 500 
@Travel_Api.errorhandler(500) 
def handle_500():
    Response = {"error": 'true', "message": '伺服器內部錯誤'}
    return make_response(jsonify(Response), 500)

############################## Part 5 - 1：預定行程 API ################################
# 儲存 預約行程至 session
def SaveBookingToSession(SightId, SightName, SightAddress, SightImg, BookingDate, BookingTime, BookingPrice):

    session['SightId']      = SightId 
    session['SightName']    = SightName 
    session['SightAddress'] = SightAddress 
    session['SightImg']     = SightImg  
    session['BookingDate']  = BookingDate
    session['BookingTime']  = BookingTime
    session['BookingPrice'] = BookingPrice

# 讀取 預定行程
''' 從 Session 讀取預約行程，如 Session 中有紀錄，則依照 API 回傳 內容；
                                         無    ，則　       回傳 None。'''                                    
def ReadBookingFromSession():

    state = session.get('SightName')
    if state == None:
        return None
    
    data = {
        "attraction": {
            "id"        : session['SightId'],
            "name"      : session['SightName'],
            "address"   : session['SightAddress'],
            "image"     : session['SightImg']            
        },
        "date"  : session['BookingDate'],
        "time"  : session['BookingTime'],
        "price" : session['BookingPrice']
    }

    return data
        
# 刪除 預定行程
def DeleteBookingFromSession():

    state = session.get('SightName')
    if state == None:
        return None

    session.pop('SightId')
    session.pop('SightName')
    session.pop('SightAddress')
    session.pop('SightImg')
    session.pop('BookingDate')
    session.pop('BookingTime')
    session.pop('BookingPrice')

def CreateBooking(SightId, BookingDate, BookingTime, BookingPrice):

    print('[DBG] [CreateBooking]')  

    # 查詢資料庫 讀取所預約的景點細節 
    SearchResult = SearchSightById(SightId)
    if SearchResult == None:
        return False

    # 分割圖片
    imagelist    = SearchResult[9]
    splitPicList = imagelist.split(',')
    
    SightName    = SearchResult[1]    
    SightAddress = SearchResult[4]    
    SightImg     = splitPicList[0] 

    # 儲存景點資訊至 Session 中
    SaveBookingToSession(SightId, SightName, SightAddress, SightImg, BookingDate, BookingTime, BookingPrice)
    return True

# [API] 取得尚未確認下單的預定行程 
@Travel_Api.route('/booking', methods=['GET'])
def get_booking():

    # 查詢 Session 中使用者登入、登出的狀態
    state = GetSessionState()

    print('[DBG] 1')

    # 若已登入，則回傳 使用者資訊(依照API)
    if session['state'] == 'Log_in':

        print('[DBG][Log_in] 2')

        # 讀取 預定行程內容
        ''' 若有，則依照 API 回傳 內容
              無                 None(null)'''
        BookingInfo = ReadBookingFromSession()

        print('[DBG] 3 BookingInfo=',BookingInfo)

        Response ={
                    "data": BookingInfo
                   }

    else:
        print('[DBG][Not Log_in] 4')
        Response = {"error": 'true', "message": '未登入系統，拒絕存取'}
        return json.dumps(Response, ensure_ascii = False), 403  

    return json.dumps(Response, ensure_ascii = False) 

# [API] 建立新的預定行程資訊
@Travel_Api.route('/booking', methods=['POST'])
def create_booking():

    # 取得前端送來的 Request Body 請求資料  
    RequestBody = request.json

    # 讀取預約資訊
    SightId         = RequestBody['attractionId']      
    BookingDate     = RequestBody['date']     
    BookingTime     = RequestBody['time']
    BookingPrice    = RequestBody['price']  

    print('[DBG][create_booking] BookingPrice=', BookingPrice)
    
    # 查詢 Session 中使用者登入、登出狀態
    state = GetSessionState()

    # 若已登入，則回傳 使用者資訊(依照API)
    if session['state'] == 'Log_in':
    
        # 建立預約行程
        CreateResult = CreateBooking(SightId, BookingDate, BookingTime, BookingPrice)

        if CreateResult:
            Response = {"ok": 'true'}
            return json.dumps(Response, ensure_ascii = False)

        else:
            Response = {"error": 'true', "message": '建立失敗，輸入不正確或其他原因'}
            return json.dumps(Response, ensure_ascii = False), 400
    
    else:
        Response = {"error": 'true', "message": '未登入系統，拒絕存取'}
        return json.dumps(Response, ensure_ascii = False), 403

# [API] 刪除建立的預定行程
@Travel_Api.route('/booking', methods=['DELETE'])
def delete_booking():
    
    # 查詢 Session 中使用者登入、登出狀態
    state = GetSessionState()    
    
    # 若已登入，則回傳 使用者資訊(依照API)
    if session['state'] == 'Log_in':
        
        # Delete booking
        DeleteBookingFromSession()
        Response ={"ok": 'true'} 
            
    else:
        Response = {"error": 'true', "message": '未登入系統，拒絕存取'}
        return json.dumps(Response, ensure_ascii = False), 403
    
    return json.dumps(Response, ensure_ascii = False)