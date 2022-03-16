from flask import *

# 導入 JSON 模組
import json

# 連接到 MySQL 資料庫
import  mysql.connector

DB_Host = "127.0.0.1"
DB_Name = "taipeisights"
DB_User = "root"
DB_Pwd  = "password"

website = mysql.connector.connect(
  host = DB_Host,
  user = DB_User,
  password = DB_Pwd,
  database = DB_Name,
)
cursor = website.cursor()
############################## API-1 ################################
# 撰寫一函數 SearchSight() 輸入 page 以及 keyword 回傳 資料庫的搜尋結果
def SearchSight(page, keyword):

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

    ''' 若搜尋無結果 (會印出 空[])，則回傳 null ;
        反之         (會印出 值) ，則回傳 搜尋結果資料 '''
    if SearchResult == []:       
        return None
    else:      
        return SearchResult

# 處理 關鍵字 回傳搜尋結果的 總共有幾筆	
def SearchSightCount(keyword):

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

    return json.dumps(Response,  ensure_ascii = False) # sort_keys=False 不要依字母順序將JSON Key排序

############################## API-2 ################################
# [查]讀取 database 資料，查詢 資料庫中有無 此景點編號( id )
def SearchSightById(id):
    sql = "SELECT * FROM sightdata WHERE id = %s"
    variable = (id, )
    cursor.execute(sql, variable)
    SearchResult = cursor.fetchone()

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

    return json.dumps(Response,  ensure_ascii = False)

#####################################################################
app=Flask(__name__)
app.config["JSON_AS_ASCII"]=False
app.config["TEMPLATES_AUTO_RELOAD"]=True

# Pages
@app.route("/")
def index():
	return render_template("index.html")
@app.route("/attraction/<id>")
def attraction(id):
	return render_template("attraction.html")
@app.route("/booking")
def booking():
	return render_template("booking.html")
@app.route("/thankyou")
def thankyou():
	return render_template("thankyou.html")

# API-1 取得景點資料列表
@app.route("/api/attractions", methods = ['GET'])
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
@app.route("/api/attraction/<int:id>", methods = ['GET'])
def api_attraction_id(id):

	# 搜尋此景點ID 是否於資料庫中
    SearchResult = SearchSightById(id)

	# 若景點編號錯誤 則回傳 400
    if SearchResult == None:
        Response = {"error": 'true', "message": '景點編號不正確'}
        return json.dumps(Response,  ensure_ascii = False),400
    else:
        Response = Build_Resp_SightDataJSONById(SearchResult)            
        return Response
	
# 處理 伺服器內部錯誤 500 
@app.errorhandler(500) 
def handle_500():
    Response = {"error": True, "message": '伺服器內部錯誤'}
    return make_response(jsonify(Response), 500)

app.run(port=3000, debug=True) 