import  os
import  sys
import  json
import  mysql.connector

###################################################################################

DB_Host = "127.0.0.1"
DB_Name = "TaipeiSights"
DB_User = "root"
DB_Pwd  = "password"

# 連接到 MySQL 資料庫
website = mysql.connector.connect(
  host = DB_Host,
  user = DB_User,
  password = DB_Pwd,
  database = DB_Name,
)
cursor = website.cursor()

# 新增 1 筆景點資料到 database 中 ( 資料庫 : TaipeiSights  => 表格 : sightData  )
def addNewSightDataToDB(name, category, description, address, transport, mrt, latitude, longitude, images):
    sql = "INSERT INTO sightData (name, category, description, address, transport, mrt, latitude, longitude, images) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)"
    sight = (name, category, description, address, transport, mrt, latitude, longitude, images)
    cursor.execute(sql, sight)
    website.commit()

###################################################################################

# 目前 資料夾路徑
CurrentPath  = os.path.dirname(os.path.abspath(__file__)) + '\\'

# 檔案名稱
FileName     = 'taipei-attractions.json'

# 合併資料夾路徑跟檔案名稱
JsonFilePath = CurrentPath + FileName

# 開啟檔案，編碼設成 utf-8 
file         = open(JsonFilePath , encoding = "utf-8")

# 讀取 JSON 檔案
data         = json.load(file)

# 取得所有景點
sightList    = data["result"]["results"]
# print("sightList =", sightList)  # DBG

'''
依照 API attractions 資料需求 取出資料

資料範例如下

    "name"       : "平安鐘",
    "category"   : "公共藝術",
    "description": "平安鐘祈求大家的平安，這是為了紀念 921 地震週年的設計",
    "address"    : "臺北市大安區忠孝東路 4 段 1 號",
    "transport"  : "公車：204、212、212直",
    "mrt"        : "忠孝復興",
    "latitude"   : 25.04181,
    "longitude"  : 121.544814,
    "images"     : ["http://140.112.3.4/images/92-0.jp ]

'''
# 將列表所需要的鍵各自提取並命名
for sight in sightList:
    name         =   sight["stitle"]
    category     =   sight["CAT2"]
    description  =   sight["xbody"]
    address      =   sight["address"]
    transport    =   sight["info"]
    mrt          =   sight["MRT"]
    latitude     =   sight["latitude"]
    longitude    =   sight["longitude"]
    imageList    =   sight["file"]  
    images       =   ''    

    # 分割圖片網址並組合字串
    picLink = imageList.split('https://')
    # print("picLink =", picLink)

    for link in picLink:
        completePicLink = 'https://' + link
        # print("completePicLink =", completePicLink)

        # 過濾非 JPG 或 PNG 檔的圖片 (包括 " https:// " 字串)
        if ('.JPG' not in completePicLink) and ('.PNG' not in completePicLink) \
           and ('.jpg' not in completePicLink) and ('.png' not in completePicLink):
           continue
        else:
            images = images + completePicLink + ','
    # print("images =", images)

    # 將景點資料新增至資料庫
    addNewSightDataToDB(name, category, description, address, transport, mrt, latitude, longitude, images)