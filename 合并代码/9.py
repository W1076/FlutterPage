# favorite_api.py
from flask import Flask, Blueprint, request, jsonify
import pymysql
from datetime import datetime

# 创建Flask应用
app = Flask(__name__)

# 创建蓝图
favorite_bp = Blueprint('favorite', __name__, url_prefix='/api/favorites')

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


# 用户会话验证 - 添加测试数据用于演示
user_sessions = {
    'test_session_123': {
        'user_id': 1,
        'username': 'test_user'
    },
    'demo_session_456': {
        'user_id': 2,
        'username': 'demo_user'
    }
}


def validate_session(session_id):
    # 临时添加测试会话ID用于演示
    if session_id == 'test' or session_id == 'demo':
        return True
    return session_id in user_sessions


# 添加收藏API
@favorite_bp.route('', methods=['POST'])
def add_favorite():
    # 验证会话
    session_id = request.headers.get('X-Session-ID')
    if not session_id or not validate_session(session_id):
        return jsonify({
            'status': 'error',
            'message': '未授权访问'
        }), 401

    # 获取用户信息（如果是测试会话，使用默认用户ID）
    if session_id == 'test':
        user_id = 1
    elif session_id == 'demo':
        user_id = 2
    else:
        user_id = user_sessions[session_id]['user_id']

    data = request.get_json()

    # 检查请求数据
    if not data:
        return jsonify({
            'status': 'error',
            'message': '缺少请求数据'
        }), 400

    if 'novel_id' not in data:
        return jsonify({
            'status': 'error',
            'message': '缺少小说ID'
        }), 400

    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)

    try:
        # 检查小说是否存在
        cursor.execute("SELECT * FROM novels WHERE Novel_id = %s", (data['novel_id'],))
        novel = cursor.fetchone()
        if not novel:
            return jsonify({
                'status': 'error',
                'message': '小说不存在'
            }), 404

        # 检查是否已收藏
        cursor.execute("""
            SELECT * FROM favorites 
            WHERE User_id = %s AND Novel_id = %s
        """, (user_id, data['novel_id']))

        if cursor.fetchone():
            return jsonify({
                'status': 'error',
                'message': '已收藏该小说'
            }), 400

        # 添加收藏
        cursor.execute("""
            INSERT INTO favorites (User_id, Novel_id, Created_at) 
            VALUES (%s, %s, %s)
        """, (user_id, data['novel_id'], datetime.now()))
        conn.commit()

        return jsonify({
            'status': 'success',
            'message': '收藏成功',
            'novel_id': data['novel_id']
        }), 201

    except pymysql.Error as e:
        conn.rollback()
        return jsonify({
            'status': 'error',
            'message': f'数据库错误: {str(e)}'
        }), 500
    except Exception as e:
        conn.rollback()
        return jsonify({
            'status': 'error',
            'message': f'服务器错误: {str(e)}'
        }), 500
    finally:
        cursor.close()
        conn.close()


# 取消收藏API
@favorite_bp.route('/<int:novel_id>', methods=['DELETE'])
def remove_favorite(novel_id):
    # 验证会话
    session_id = request.headers.get('X-Session-ID')
    if not session_id or not validate_session(session_id):
        return jsonify({
            'status': 'error',
            'message': '未授权访问'
        }), 401

    # 获取用户信息
    if session_id == 'test':
        user_id = 1
    elif session_id == 'demo':
        user_id = 2
    else:
        user_id = user_sessions[session_id]['user_id']

    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)

    try:
        # 检查收藏是否存在
        cursor.execute("""
            SELECT * FROM favorites 
            WHERE User_id = %s AND Novel_id = %s
        """, (user_id, novel_id))
        favorite = cursor.fetchone()

        if not favorite:
            return jsonify({
                'status': 'error',
                'message': '未收藏该小说'
            }), 404

        # 删除收藏
        cursor.execute("""
            DELETE FROM favorites 
            WHERE Favorite_id = %s
        """, (favorite['Favorite_id'],))
        conn.commit()

        return jsonify({
            'status': 'success',
            'message': '取消收藏成功',
            'novel_id': novel_id
        }), 200

    except pymysql.Error as e:
        conn.rollback()
        return jsonify({
            'status': 'error',
            'message': f'数据库错误: {str(e)}'
        }), 500
    except Exception as e:
        conn.rollback()
        return jsonify({
            'status': 'error',
            'message': f'服务器错误: {str(e)}'
        }), 500
    finally:
        cursor.close()
        conn.close()


# 获取收藏列表
@favorite_bp.route('/my', methods=['GET'])
def my_favorites():
    # 验证会话
    session_id = request.headers.get('X-Session-ID')
    if not session_id or not validate_session(session_id):
        return jsonify({
            'status': 'error',
            'message': '未授权访问'
        }), 401

    # 获取用户信息
    if session_id == 'test':
        user_id = 1
    elif session_id == 'demo':
        user_id = 2
    else:
        user_id = user_sessions[session_id]['user_id']

    # 获取分页参数
    try:
        page = max(1, int(request.args.get('page', 1)))
        per_page = max(1, min(50, int(request.args.get('per_page', 10))))  # 限制每页最多50条
    except ValueError:
        return jsonify({
            'status': 'error',
            'message': '分页参数格式错误'
        }), 400

    offset = (page - 1) * per_page

    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)

    try:
        # 获取收藏总数
        cursor.execute("""
            SELECT COUNT(*) as total_count FROM favorites 
            WHERE User_id = %s
        """, (user_id,))
        total_result = cursor.fetchone()
        total = total_result['total_count'] if total_result else 0

        # 获取收藏列表
        cursor.execute("""
            SELECT 
                f.Favorite_id,
                f.Novel_id,
                f.Created_at,
                n.Title,
                n.Cover_url,
                n.Status,
                u.Username as author_name
            FROM favorites f
            JOIN novels n ON f.Novel_id = n.Novel_id
            JOIN users u ON n.Author_id = u.User_id
            WHERE f.User_id = %s
            ORDER BY f.Created_at DESC
            LIMIT %s OFFSET %s
        """, (user_id, per_page, offset))

        favorites = cursor.fetchall()

        # 格式化时间字段
        for favorite in favorites:
            if favorite['Created_at']:
                favorite['Created_at'] = favorite['Created_at'].strftime('%Y-%m-%d %H:%M:%S')

        return jsonify({
            'status': 'success',
            'data': favorites,
            'pagination': {
                'total': total,
                'pages': (total + per_page - 1) // per_page if per_page > 0 else 0,
                'current_page': page,
                'per_page': per_page
            }
        }), 200

    except pymysql.Error as e:
        return jsonify({
            'status': 'error',
            'message': f'数据库错误: {str(e)}'
        }), 500
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'服务器错误: {str(e)}'
        }), 500
    finally:
        cursor.close()
        conn.close()


# 健康检查端点
@favorite_bp.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'success',
        'message': '收藏服务运行正常',
        'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    }), 200


# 注册蓝图
app.register_blueprint(favorite_bp)


# 根路径路由
@app.route('/')
def index():
    return jsonify({
        'message': 'Flask收藏API服务',
        'endpoints': {
            '添加收藏': 'POST /api/favorites',
            '取消收藏': 'DELETE /api/favorites/<novel_id>',
            '收藏列表': 'GET /api/favorites/my',
            '健康检查': 'GET /api/favorites/health'
        },
        'usage': '使用X-Session-ID头部进行身份验证，测试会话ID: test 或 demo'
    })


if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=5000)