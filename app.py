from flask import Flask, request, jsonify
from flask_cors import CORS
import base64

app = Flask(__name__)
CORS(app)

# 用于返回一张空白图片的base64（可替换为任意图片）
def dummy_image_base64():
    import io
    from PIL import Image
    img = Image.new('RGB', (256, 256), color = (73, 109, 137))
    buf = io.BytesIO()
    img.save(buf, format='PNG')
    return base64.b64encode(buf.getvalue()).decode()

@app.route('/api/classify', methods=['POST'])
def classify():
    # 假数据
    return jsonify({
        "result": [
            {"label": "建筑物", "prob": 0.89},
            {"label": "道路", "prob": 0.06},
            {"label": "水域", "prob": 0.03},
            {"label": "植被", "prob": 0.02}
        ]
    })

@app.route('/api/detect', methods=['POST'])
def detect():
    # 假数据
    return jsonify({
        "boxes": [
            {"class_name": "建筑物", "confidence": 0.95, "x1": 30, "y1": 40, "x2": 120, "y2": 180},
            {"class_name": "道路", "confidence": 0.85, "x1": 150, "y1": 60, "x2": 200, "y2": 220}
        ],
        "result_image": dummy_image_base64()
    })

@app.route('/api/segment', methods=['POST'])
def segment():
    # 假数据
    return jsonify({
        "mask": dummy_image_base64(),
        "stats": [
            {"class_name": "建筑物", "confidence": 0.95, "percentage": 45.0},
            {"class_name": "道路", "confidence": 0.85, "percentage": 15.0},
            {"class_name": "水域", "confidence": 0.90, "percentage": 5.0},
            {"class_name": "植被", "confidence": 0.80, "percentage": 35.0}
        ]
    })

@app.route('/api/change', methods=['POST'])
def change():
    # 假数据
    return jsonify({
        "change_mask": dummy_image_base64(),
        "stats": {
            "total_area": 1024,
            "new_buildings": 5,
            "removed_buildings": 2,
            "road_change": 200,
            "vegetation_reduction": 800
        }
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)
