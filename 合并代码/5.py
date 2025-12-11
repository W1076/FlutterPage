# chapter_api.py
from flask import Flask, Blueprint, request, jsonify
import pymysql
from datetime import datetime

# 创建Flask应用
app = Flask(__name__)

# 创建蓝图
chapter_bp = Blueprint('chapter', __name__, url_prefix='/api/chapters')

# 数据库配置
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': '123456',
    'database': 'flutterpage',
    'charset': 'utf8mb4'
}

# 用户会话验证（临时测试数据）
user_sessions = {
    'test_session': {'user_id': 1}
}


# 获取数据库连接
def get_db_connection():
    return pymysql.connect(**DB_CONFIG)


def validate_session(session_id):
    return session_id in user_sessions


# 健康检查端点
@app.route('/')
def hello():
    return jsonify({
        'status': 'success',
        'message': 'Flask服务器正在运行！',
        'endpoints': {
            '添加章节': 'POST /api/chapters',
            '获取章节列表': 'GET /api/chapters/novel/<novel_id>',
            '获取章节详情': 'GET /api/chapters/<chapter_id>'
        }
    })


# 上传章节API
@chapter_bp.route('', methods=['POST'])
def add_chapter():
    # 验证会话
    session_id = request.headers.get('X-Session-ID')
    if not validate_session(session_id):
        return jsonify({
            'status': 'error',
            'message': '未授权访问'
        }), 401

    user_info = user_sessions[session_id]
    data = request.get_json()

    # 检查是否提供了JSON数据
    if not data:
        return jsonify({
            'status': 'error',
            'message': '未提供JSON数据'
        }), 400

    # 检查必填字段
    required_fields = ['novel_id', 'chapter_num', 'title', 'content']
    for field in required_fields:
        if field not in data:
            return jsonify({
                'status': 'error',
                'message': f'缺少字段：{field}'
            }), 400

    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)

    try:
        # 检查小说是否存在且属于当前用户
        cursor.execute("""
            SELECT * FROM novels 
            WHERE Novel_id = %s AND Author_id = %s
        """, (data['novel_id'], user_info['user_id']))

        if not cursor.fetchone():
            return jsonify({
                'status': 'error',
                'message': '小说不存在或无权限'
            }), 403

        # 计算字数（适用于中文）
        word_count = len(data['content'].strip())

        # 插入章节
        cursor.execute("""
            INSERT INTO chapters (Novel_id, Chapter_num, Title, Content,
                                 Word_count, Created_at, Updated_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (
            data['novel_id'],
            data['chapter_num'],
            data['title'],
            data['content'],
            word_count,
            datetime.now(),
            datetime.now()
        ))
        chapter_id = cursor.lastrowid

        # 更新小说总字数
        cursor.execute("""
            UPDATE novels 
            SET Word_count = Word_count + %s, Updated_at = %s
            WHERE Novel_id = %s
        """, (word_count, datetime.now(), data['novel_id']))

        conn.commit()

        return jsonify({
            'status': 'success',
            'message': '章节添加成功',
            'chapter_id': chapter_id
        }), 201

    except Exception as e:
        conn.rollback()
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

    finally:
        cursor.close()
        conn.close()


# 获取小说章节列表
@chapter_bp.route('/novel/<int:novel_id>', methods=['GET'])
def get_chapters(novel_id):
    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)

    try:
        cursor.execute("""
            SELECT Chapter_id, Novel_id, Chapter_num, Title, Word_count, Created_at, Updated_at
            FROM chapters 
            WHERE Novel_id = %s 
            ORDER BY Chapter_num ASC
        """, (novel_id,))
        chapters = cursor.fetchall()

        return jsonify({
            'status': 'success',
            'data': chapters,
            'total': len(chapters)
        }), 200

    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

    finally:
        cursor.close()
        conn.close()


# 获取章节详情
@chapter_bp.route('/<int:chapter_id>', methods=['GET'])
def get_chapter(chapter_id):
    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)

    try:
        cursor.execute("""
            SELECT Chapter_id, Novel_id, Chapter_num, Title, Content, Word_count, Created_at, Updated_at
            FROM chapters WHERE Chapter_id = %s
        """, (chapter_id,))
        chapter = cursor.fetchone()

        if not chapter:
            return jsonify({
                'status': 'error',
                'message': '章节不存在'
            }), 404

        return jsonify({
            'status': 'success',
            'data': chapter
        }), 200

    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

    finally:
        cursor.close()
        conn.close()


# 注册蓝图
app.register_blueprint(chapter_bp)

# 启动应用
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)