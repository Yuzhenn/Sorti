from __future__ import annotations

from collections import defaultdict
from functools import lru_cache
from pathlib import Path
from typing import Any, Dict, List

from ultralytics import YOLO


MODEL_PATH = Path(__file__).resolve().parents[1] / 'assets' / 'models' / 'best.pt'

CLASS_DISPLAY_MAP: Dict[str, Dict[str, str]] = {
    'books_paper': {'name': '書籍與紙類', 'category': '書籍類'},
    'stationery': {'name': '文具', 'category': '文具類'},
    'charging_cable': {'name': '充電線', 'category': '3C類'},
    'extension_cord': {'name': '延長線', 'category': '3C類'},
    'computer_accessories': {'name': '電腦周邊', 'category': '3C類'},
    'phone_tablet': {'name': '手機 / 平板', 'category': '3C類'},
    'laptop': {'name': '筆電', 'category': '3C類'},
    'cosmetics': {'name': '化妝品', 'category': '美妝類'},
    'clothes': {'name': '衣物', 'category': '服飾類'},
    'bag': {'name': '包包', 'category': '包款類'},
    'shoes': {'name': '鞋子', 'category': '鞋類'},
    'umbrella': {'name': '雨傘', 'category': '雜物類'},
    'bottle': {'name': '水瓶', 'category': '生活用品'},
    'kitchenware': {'name': '廚房用品', 'category': '家用品類'},
    'toy': {'name': '玩具', 'category': '玩具類'},
    'storage_container': {'name': '收納容器', 'category': '收納用品'},
    'table_desk': {'name': '桌子', 'category': '家具類'},
    'bed': {'name': '床', 'category': '家具類'},
    'sofa': {'name': '沙發', 'category': '家具類'},
    'fan': {'name': '電風扇', 'category': '家電類'},
}


@lru_cache(maxsize=1)
def get_detection_model() -> YOLO:
    if not MODEL_PATH.exists():
        raise FileNotFoundError(f'找不到模型檔：{MODEL_PATH}')

    return YOLO(str(MODEL_PATH))


def _class_name_from_index(index: int, model: YOLO) -> str:
    names = getattr(model, 'names', {}) or {}
    return str(names.get(index, f'class_{index}'))


def _display_info_for_class(class_name: str) -> Dict[str, str]:
    return CLASS_DISPLAY_MAP.get(class_name, {'name': class_name, 'category': '未分類'})


def detect_items(image_path: str, confidence_threshold: float = 0.25) -> Dict[str, Any]:
    model = get_detection_model()
    results = model.predict(source=image_path, conf=confidence_threshold, verbose=False)

    if not results:
        return {
            'detected_items': [],
            'total_detections': 0,
            'model_name': str(MODEL_PATH.name),
        }

    first_result = results[0]
    grouped_items: Dict[str, Dict[str, Any]] = {}
    confidence_buckets: Dict[str, List[float]] = defaultdict(list)
    detection_boxes: List[Dict[str, Any]] = []
    orig_height, orig_width = getattr(first_result, 'orig_shape', (1, 1))

    for box in getattr(first_result, 'boxes', []) or []:
        cls_value = int(box.cls.item())
        raw_name = _class_name_from_index(cls_value, model)
        display_info = _display_info_for_class(raw_name)
        item_key = raw_name

        confidence = float(box.conf.item()) if hasattr(box.conf, 'item') else float(box.conf[0])
        grouped_items[item_key] = {
            'name': display_info['name'],
            'category': display_info['category'],
            'count': grouped_items.get(item_key, {}).get('count', 0) + 1,
        }
        confidence_buckets[item_key].append(confidence)

        x1, y1, x2, y2 = box.xyxy[0].tolist()
        box_width = max(x2 - x1, 0.0)
        box_height = max(y2 - y1, 0.0)
        detection_boxes.append(
            {
                'name': display_info['name'],
                'category': display_info['category'],
                'confidence': round(confidence, 3),
                'raw_label': raw_name,
                'x': round(x1 / orig_width, 4) if orig_width else 0.0,
                'y': round(y1 / orig_height, 4) if orig_height else 0.0,
                'width': round(box_width / orig_width, 4) if orig_width else 0.0,
                'height': round(box_height / orig_height, 4) if orig_height else 0.0,
            }
        )

    detected_items: List[Dict[str, Any]] = []
    for class_name, item in grouped_items.items():
        confidences = confidence_buckets[class_name]
        average_confidence = sum(confidences) / len(confidences) if confidences else 0.0
        detected_items.append(
            {
                'name': item['name'],
                'category': item['category'],
                'count': item['count'],
                'confidence': round(average_confidence, 3),
                'raw_label': class_name,
            }
        )

    detected_items.sort(key=lambda item: (-int(item['count']), item['category'], item['name']))

    return {
        'detected_items': detected_items,
        'detection_boxes': detection_boxes,
        'total_detections': len(getattr(first_result, 'boxes', []) or []),
        'model_name': str(MODEL_PATH.name),
    }