# novel_api.py
from flask import Flask, Blueprint, request, jsonify
import pymysql
from datetime import datetime

# 创建Flask应用和蓝图
app = Flask(__name__)
app.secret_key = 'your-secret-key-here'

novel_bp = Blueprint('novel', __name__, url_prefix='/api/novels')

# 数据库配置
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': '123456',
    'database': 'flutterpage',
    'charset': 'utf8mb4'
}


# 获取数据库连接
def get_db_connection():
    try:
        return pymysql.connect(**DB_CONFIG)
    except Exception as e:
        print(f"数据库连接失败: {e}")
        return None


# 用户会话验证（开发测试用）
user_sessions = {
    'test-session-id': {
        'user_id': 1,
        'username': 'test_user'
    }
}


def validate_session(session_id):
    """验证用户会话是否有效"""
    return session_id in user_sessions


# 添加小说API
@novel_bp.route('', methods=['POST'])
def add_novel():
    # 验证会话
    session_id = request.headers.get('X-Session-ID')
    if not session_id or not validate_session(session_id):
        return jsonify({
            'status': 'error',
            'message': '未授权访问'
        }), 401

    user_info = user_sessions[session_id]
    data = request.get_json()

    if not data:
        return jsonify({
            'status': 'error',
            'message': '请求数据不能为空'
        }), 400

    # 检查必填字段
    required_fields = ['title', 'description', 'cover_url', 'status']
    for field in required_fields:
        if field not in data or not data[field]:
            return jsonify({
                'status': 'error',
                'message': f'缺少字段：{field}或字段值为空'
            }), 400

    conn = get_db_connection()
    if not conn:
        return jsonify({
            'status': 'error',
            'message': '数据库连接失败'
        }), 500

    cursor = conn.cursor(pymysql.cursors.DictCursor)

    try:
        # 插入小说数据
        cursor.execute("""
            INSERT INTO novels (Author_id, Title, Description, Cover_url, 
                               Status, Word_count, Created_at, Updated_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            user_info['user_id'],
            data['title'].strip(),
            data['description'].strip(),
            data['cover_url'].strip(),
            data['status'].strip(),
            0,  # 初始字数
            datetime.now(),
            datetime.now()
        ))
        novel_id = cursor.lastrowid
        conn.commit()

        return jsonify({
            'status': 'success',
            'message': '小说添加成功',
            'novel_id': novel_id
        }), 201

    except Exception as e:
        conn.rollback()
        return jsonify({
            'status': 'error',
            'message': f'数据库操作失败: {str(e)}'
        }), 500

    finally:
        cursor.close()
        conn.close()


# 获取小说列表API
@novel_bp.route('', methods=['GET'])
def get_novels():
    # 获取分页参数
    try:
        page = max(1, int(request.args.get('page', 1)))
        per_page = max(1, min(100, int(request.args.get('per_page', 10))))  # 限制每页最大100条
    except ValueError:
        return jsonify({
            'status': 'error',
            'message': '分页参数必须是整数'
        }), 400

    offset = (page - 1) * per_page

    conn = get_db_connection()
    if not conn:
        return jsonify({
            'status': 'error',
            'message': '数据库连接失败'
        }), 500

    cursor = conn.cursor(pymysql.cursors.DictCursor)

    try:
        # 获取总数
        cursor.execute("SELECT COUNT(*) as count FROM novels")
        total = cursor.fetchone()['count']

        # 获取分页数据
        cursor.execute("""
            SELECT Novel_id, Author_id, Title, Description, Cover_url, 
                   Status, Word_count, Created_at, Updated_at 
            FROM novels 
            ORDER BY Created_at DESC 
            LIMIT %s OFFSET %s
        """, (per_page, offset))
        novels = cursor.fetchall()

        # 转换日期格式为字符串
        for novel in novels:
            for field in ['Created_at', 'Updated_at']:
                if novel[field] and isinstance(novel[field], datetime):
                    novel[field] = novel[field].isoformat()

        return jsonify({
            'status': 'success',
            'data': novels,
            'pagination': {
                'total': total,
                'pages': (total + per_page - 1) // per_page if total > 0 else 0,
                'current_page': page,
                'per_page': per_page
            }
        }), 200

    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'数据库查询失败: {str(e)}'
        }), 500

    finally:
        cursor.close()
        conn.close()


# 获取单本小说详情
@novel_bp.route('/<int:novel_id>', methods=['GET'])
def get_novel(novel_id):
    if novel_id <= 0:
        return jsonify({
            'status': 'error',
            'message': '小说ID必须大于0'
        }), 400

    conn = get_db_connection()
    if not conn:
        return jsonify({
            'status': 'error',
            'message': '数据库连接失败'
        }), 500

    cursor = conn.cursor(pymysql.cursors.DictCursor)

    try:
        cursor.execute("""
            SELECT Novel_id, Author_id, Title, Description, Cover_url, 
                   Status, Word_count, Created_at, Updated_at 
            FROM novels WHERE Novel_id = %s
        """, (novel_id,))
        novel = cursor.fetchone()

        if not novel:
            return jsonify({
                'status': 'error',
                'message': '小说不存在'
            }), 404

        # 转换日期格式为字符串
        for field in ['Created_at', 'Updated_at']:
            if novel[field] and isinstance(novel[field], datetime):
                novel[field] = novel[field].isoformat()

        return jsonify({
            'status': 'success',
            'data': novel
        }), 200

    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'数据库查询失败: {str(e)}'
        }), 500

    finally:
        cursor.close()
        conn.close()


# 健康检查端点
@novel_bp.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'success',
        'message': 'API服务正常运行',
        'timestamp': datetime.now().isoformat()
    }), 200


# 注册蓝图
app.register_blueprint(novel_bp)


# 根路径路由
@app.route('/')
def index():
    return jsonify({
        'message': '小说API服务',
        'endpoints': {
            'GET /api/novels': '获取小说列表',
            'POST /api/novels': '添加小说',
            'GET /api/novels/<id>': '获取小说详情',
            'GET /api/novels/health': '健康检查'
        }
    }), 200


# 启动应用
if __name__ == '__main__':
    print("=" * 50)
    print("小说API服务器启动中...")
    print("服务器地址: http://localhost:5000")
    print("API文档地址: http://localhost:5000/")
    print("=" * 50)
    print("可用API端点:")
    print("  GET  /                    - 查看API文档")
    print("  GET  /api/novels          - 获取小说列表")
    print("  POST /api/novels          - 添加小说")
    print("  GET  /api/novels/<id>     - 获取小说详情")
    print("  GET  /api/novels/health   - 健康检查")
    print("=" * 50)

    try:
        # 测试数据库连接
        conn = get_db_connection()
        if conn:
            print("✅ 数据库连接成功")
            conn.close()
        else:
            print("❌ 数据库连接失败")
    except Exception as e:
        print(f"❌ 数据库连接测试失败: {e}")

    print("🚀 服务器启动完成，等待请求...")
    app.run(debug=True, host='0.0.0.0', port=5000)