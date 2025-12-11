# reading_api.py
from flask import Flask, Blueprint, request, jsonify
import pymysql
from datetime import datetime

# 创建 Flask 应用
app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key'

# 创建蓝图
reading_bp = Blueprint('reading', __name__, url_prefix='/api/reading')

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
    return pymysql.connect(**DB_CONFIG)

# 用户会话验证（简化版，实际应该用更安全的方式）
user_sessions = {}

def validate_session(session_id):
    return session_id in user_sessions

# 更新阅读记录
@reading_bp.route('/record', methods=['POST'])
def update_reading():
    # 验证会话
    session_id = request.headers.get('X-Session-ID')
    if not validate_session(session_id):
        return jsonify({
            'status': 'error',
            'message': '未授权访问'
        }), 401

    user_info = user_sessions[session_id]
    data = request.get_json()

    if not data or 'chapter_id' not in data:
        return jsonify({
            'status': 'error',
            'message': '缺少章节ID'
        }), 400

    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)

    try:
        # 检查章节是否存在
        cursor.execute("SELECT * FROM chapters WHERE Chapter_id = %s", (data['chapter_id'],))
        chapter = cursor.fetchone()

        if not chapter:
            return jsonify({
                'status': 'error',
                'message': '章节不存在'
            }), 404

        # 查找现有记录
        cursor.execute("""
            SELECT * FROM reading_records
            WHERE User_id = %s AND Chapter_id = %s
        """, (user_info['user_id'], data['chapter_id']))
        record = cursor.fetchone()

        if record:
            # 更新记录
            progress = min(100, max(0, data.get('progress', record['Progress'])))
            duration = data.get('duration', 0)

            cursor.execute("""
                UPDATE reading_records
                SET Progress = %s, Duration = Duration + %s, Last_read = %s
                WHERE Record_id = %s
            """, (progress, duration, datetime.now(), record['Record_id']))
        else:
            # 创建新记录
            cursor.execute("""
                INSERT INTO reading_records (User_id, Chapter_id, Novel_id,
                                            Progress, Duration, Last_read)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, (
                user_info['user_id'],
                data['chapter_id'],
                chapter['Novel_id'],
                data.get('progress', 0),
                data.get('duration', 0),
                datetime.now()
            ))

        conn.commit()

        return jsonify({
            'status': 'success',
            'message': '阅读记录更新成功'
        }), 200

    except Exception as e:
        conn.rollback()
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

    finally:
        cursor.close()
        conn.close()

# 继续阅读列表
@reading_bp.route('/continue', methods=['GET'])
def continue_reading():
    # 验证会话
    session_id = request.headers.get('X-Session-ID')
    if not validate_session(session_id):
        return jsonify({
            'status': 'error',
            'message': '未授权访问'
        }), 401

    user_info = user_sessions[session_id]

    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)

    try:
        # 获取最近阅读的小说
        cursor.execute("""
            SELECT n.Novel_id, n.Title, n.Cover_url,
                   c.Chapter_id, c.Chapter_num, c.Title as chapter_title,
                   r.Progress, r.Last_read
            FROM reading_records r
            JOIN chapters c ON r.Chapter_id = c.Chapter_id
            JOIN novels n ON c.Novel_id = n.Novel_id
            WHERE r.User_id = %s
            GROUP BY n.Novel_id
            ORDER BY r.Last_read DESC
            LIMIT 5
        """, (user_info['user_id'],))
        records = cursor.fetchall()

        return jsonify({
            'status': 'success',
            'data': records
        }), 200

    finally:
        cursor.close()
        conn.close()

# 注册蓝图
app.register_blueprint(reading_bp)

# 添加测试路由和会话创建路由
@app.route('/')
def home():
    return 'Flask服务器正在运行！访问 /api/reading/* 来使用API'

@app.route('/login-test')
def login_test():
    """创建测试会话"""
    import uuid
    session_id = str(uuid.uuid4())
    user_sessions[session_id] = {'user_id': 1}  # 假设用户ID为1
    return jsonify({
        'status': 'success',
        'session_id': session_id,
        'message': '测试会话已创建，使用 X-Session-ID 头来访问API'
    })

# 启动服务器
if __name__ == '__main__':
    print("启动Flask服务器...")
    print("访问 http://localhost:5000/login-test 获取测试会话ID")
    print("然后使用该会话ID测试其他API端点")
    app.run(debug=True, host='0.0.0.0', port=5000)