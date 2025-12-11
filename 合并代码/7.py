# search_api.py
from flask import Flask, Blueprint, request, jsonify
import pymysql
import time

# 创建Flask应用
app = Flask(__name__)

# 创建蓝图
search_bp = Blueprint('search', __name__, url_prefix='/api/search')

# 数据库配置
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': '123456',
    'database': 'flutterpage',
    'charset': 'utf8mb4'
}

# 改进的缓存实现（包含时间戳）
search_cache = {}
CACHE_TIME = 300  # 缓存5分钟


# 缓存清理函数
def clean_cache():
    """清理过期的缓存"""
    current_time = time.time()
    expired_keys = []
    for key, (data, timestamp) in search_cache.items():
        if current_time - timestamp > CACHE_TIME:
            expired_keys.append(key)
    for key in expired_keys:
        del search_cache[key]


# 获取数据库连接
def get_db_connection():
    try:
        return pymysql.connect(**DB_CONFIG)
    except Exception as e:
        print(f"数据库连接失败: {e}")
        raise


# 初始化测试数据
def init_test_data():
    """初始化测试数据"""
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # 创建表（如果不存在）
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                User_id INT PRIMARY KEY AUTO_INCREMENT,
                Username VARCHAR(100) NOT NULL,
                Email VARCHAR(100),
                Created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS novels (
                Novel_id INT PRIMARY KEY AUTO_INCREMENT,
                Title VARCHAR(200) NOT NULL,
                Description TEXT,
                Author_id INT,
                Status ENUM('draft', 'review', 'published') DEFAULT 'draft',
                Created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (Author_id) REFERENCES users(User_id)
            )
        """)

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS favorites (
                Favorite_id INT PRIMARY KEY AUTO_INCREMENT,
                Novel_id INT,
                User_id INT,
                Created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (Novel_id) REFERENCES novels(Novel_id),
                FOREIGN KEY (User_id) REFERENCES users(User_id)
            )
        """)

        # 插入测试用户（忽略重复）
        cursor.execute("""
            INSERT IGNORE INTO users (User_id, Username, Email) 
            VALUES 
            (1, '作者小明', 'xiaoming@example.com'),
            (2, '作家小红', 'xiaohong@example.com'),
            (3, '创作达人', 'creator@example.com')
        """)

        # 插入测试小说（忽略重复）
        cursor.execute("""
            INSERT IGNORE INTO novels (Novel_id, Title, Description, Author_id, Status) 
            VALUES 
            (1, '测试小说一', '这是一本关于测试的精彩小说，包含了许多有趣的故事情节。', 1, 'published'),
            (2, '编程学习指南', 'Python编程从入门到精通，包含大量实战案例。', 2, 'published'),
            (3, 'Flutter开发教程', '移动应用开发完整教程，涵盖Dart语言和Flutter框架。', 1, 'published'),
            (4, 'Web开发实战', '前后端分离开发模式详解，Vue.js + Flask全栈开发。', 3, 'published'),
            (5, '数据结构与算法', '计算机科学基础，算法设计与分析。', 2, 'review'),
            (6, '未完待续的故事', '这是一个还在创作中的故事...', 3, 'draft')
        """)

        # 插入测试收藏（忽略重复）
        cursor.execute("""
            INSERT IGNORE INTO favorites (Favorite_id, Novel_id, User_id) 
            VALUES 
            (1, 1, 1),
            (2, 1, 2),
            (3, 2, 1),
            (4, 2, 3),
            (5, 3, 2),
            (6, 4, 1),
            (7, 4, 2),
            (8, 4, 3)
        """)

        conn.commit()
        print("✅ 测试数据初始化完成")

    except Exception as e:
        print(f"❌ 初始化测试数据错误: {e}")
        conn.rollback()
    finally:
        cursor.close()
        conn.close()


# 小说搜索API
@search_bp.route('/novels', methods=['GET'])
def search_novels():
    """搜索小说API"""
    # 清理过期缓存
    clean_cache()

    # 获取搜索参数
    keyword = request.args.get('keyword', '').strip()
    status = request.args.get('status')
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 10))

    # 参数验证
    if page < 1:
        page = 1
    if per_page < 1 or per_page > 100:
        per_page = 10

    offset = (page - 1) * per_page

    if not keyword:
        return jsonify({
            'status': 'error',
            'message': '搜索关键词不能为空',
            'code': 400
        }), 400

    # 构建缓存键
    cache_key = f"novels:{keyword}:{status}:{page}:{per_page}"

    # 检查缓存
    if cache_key in search_cache:
        data, timestamp = search_cache[cache_key]
        print(f"📦 从缓存返回数据: {cache_key}")
        return jsonify(data)

    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)

    try:
        # 构建查询条件
        query = """
            SELECT 
                n.Novel_id, n.Title, n.Description, n.Status, n.Created_at,
                u.User_id as author_id, u.Username as author_name
            FROM novels n
            JOIN users u ON n.Author_id = u.User_id
            WHERE (n.Title LIKE %s OR n.Description LIKE %s)
        """
        params = [f'%{keyword}%', f'%{keyword}%']

        # 添加状态筛选
        if status and status in ['draft', 'review', 'published']:
            query += " AND n.Status = %s"
            params.append(status)

        # 获取总数
        count_query = "SELECT COUNT(*) as count FROM (" + query + ") as subquery"
        count_params = params.copy()

        cursor.execute(count_query, count_params)
        total_result = cursor.fetchone()
        total = total_result['count'] if total_result else 0

        # 获取搜索结果
        query += " ORDER BY n.Created_at DESC LIMIT %s OFFSET %s"
        params.extend([per_page, offset])

        cursor.execute(query, params)
        novels = cursor.fetchall()

        # 构建响应数据
        response = {
            'status': 'success',
            'code': 200,
            'data': novels,
            'pagination': {
                'total': total,
                'pages': (total + per_page - 1) // per_page if total > 0 else 0,
                'current_page': page,
                'per_page': per_page
            },
            'search_info': {
                'keyword': keyword,
                'status': status
            }
        }

        # 存入缓存（包含时间戳）
        search_cache[cache_key] = (response, time.time())
        print(f"🔍 新查询并缓存: {cache_key}")

        return jsonify(response), 200

    except Exception as e:
        print(f"❌ 搜索小说错误: {e}")
        return jsonify({
            'status': 'error',
            'message': f'数据库查询错误: {str(e)}',
            'code': 500
        }), 500

    finally:
        cursor.close()
        conn.close()


# 热门小说推荐
@search_bp.route('/popular', methods=['GET'])
def popular_novels():
    """热门小说推荐API"""
    # 清理过期缓存
    clean_cache()

    cache_key = 'popular_novels'

    # 检查缓存
    if cache_key in search_cache:
        data, timestamp = search_cache[cache_key]
        print("📦 从缓存返回热门推荐")
        return jsonify(data)

    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)

    try:
        # 查询收藏数最多的小说
        cursor.execute("""
            SELECT 
                n.Novel_id, n.Title, n.Description, n.Status, n.Created_at,
                u.User_id as author_id, u.Username as author_name,
                COUNT(f.Favorite_id) as favorite_count
            FROM novels n
            LEFT JOIN favorites f ON n.Novel_id = f.Novel_id
            JOIN users u ON n.Author_id = u.User_id
            WHERE n.Status = 'published'
            GROUP BY n.Novel_id
            ORDER BY favorite_count DESC, n.Created_at DESC
            LIMIT 10
        """)
        novels = cursor.fetchall()

        response = {
            'status': 'success',
            'code': 200,
            'data': novels,
            'message': f'找到 {len(novels)} 本热门小说'
        }

        # 存入缓存（包含时间戳）
        search_cache[cache_key] = (response, time.time())
        print("🔍 新查询并缓存热门推荐")

        return jsonify(response), 200

    except Exception as e:
        print(f"❌ 获取热门小说错误: {e}")
        return jsonify({
            'status': 'error',
            'message': f'数据库查询错误: {str(e)}',
            'code': 500
        }), 500

    finally:
        cursor.close()
        conn.close()


# 健康检查接口
@search_bp.route('/health', methods=['GET'])
def health_check():
    """健康检查接口"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT 1")
        cursor.close()
        conn.close()

        return jsonify({
            'status': 'success',
            'message': '服务运行正常',
            'timestamp': time.time()
        }), 200
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'服务异常: {str(e)}'
        }), 500


# 根路径路由
@app.route('/')
def home():
    """首页"""
    current_time = time.strftime('%Y-%m-%d %H:%M:%S')
    html_content = f'''
    <!DOCTYPE html>
    <html>
    <head>
        <title>小说搜索API服务</title>
        <meta charset="utf-8">
        <style>
            body {{ font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }}
            h1 {{ color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }}
            .container {{ max-width: 800px; margin: 0 auto; }}
            .api-list {{ background: #f8f9fa; padding: 25px; border-radius: 8px; border-left: 4px solid #3498db; }}
            a {{ color: #2980b9; text-decoration: none; font-weight: bold; }}
            a:hover {{ color: #1a5276; text-decoration: underline; }}
            .endpoint {{ margin: 15px 0; padding: 15px; background: white; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }}
            .status {{ color: #27ae60; font-weight: bold; }}
            .timestamp {{ color: #7f8c8d; font-style: italic; margin-top: 20px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <h1>📚 小说搜索API服务</h1>
            <p class="status">✅ 服务运行正常</p>

            <div class="api-list">
                <h2>🚀 可用接口：</h2>

                <div class="endpoint">
                    <h3>🔍 搜索小说</h3>
                    <p><a href="/api/search/novels?keyword=测试" target="_blank">/api/search/novels?keyword=测试</a></p>
                    <p><a href="/api/search/novels?keyword=编程" target="_blank">/api/search/novels?keyword=编程</a></p>
                    <p><a href="/api/search/novels?keyword=开发" target="_blank">/api/search/novels?keyword=开发</a></p>
                    <p><small>参数: keyword(必需), status(可选), page(可选), per_page(可选)</small></p>
                </div>

                <div class="endpoint">
                    <h3>🔥 热门推荐</h3>
                    <p><a href="/api/search/popular" target="_blank">/api/search/popular</a></p>
                    <p><small>获取收藏最多的10本小说</small></p>
                </div>

                <div class="endpoint">
                    <h3>❤️ 健康检查</h3>
                    <p><a href="/api/search/health" target="_blank">/api/search/health</a></p>
                    <p><small>检查服务状态和数据库连接</small></p>
                </div>
            </div>

            <p class="timestamp">服务器启动时间: {current_time}</p>
        </div>
    </body>
    </html>
    '''
    return html_content


# 注册蓝图
app.register_blueprint(search_bp)

# 启动服务器（仅在直接运行时）
if __name__ == '__main__':
    print("=" * 60)
    print("🚀 启动小说搜索API服务器")
    print("=" * 60)

    # 初始化测试数据
    print("📊 初始化测试数据...")
    init_test_data()

    print("🌐 服务器访问地址:")
    print("   📍 首页: http://127.0.0.1:5000/")
    print("   🔍 搜索API: http://127.0.0.1:5000/api/search/novels?keyword=测试")
    print("   🔥 热门推荐: http://127.0.0.1:5000/api/search/popular")
    print("   ❤️ 健康检查: http://127.0.0.1:5000/api/search/health")
    print("=" * 60)
    print("💡 提示: 在浏览器中打开上述地址进行测试")
    print("=" * 60)

    # 启动Flask应用
    app.run(debug=True, host='0.0.0.0', port=5000)