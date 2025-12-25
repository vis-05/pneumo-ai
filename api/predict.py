from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from tensorflow import keras
from PIL import Image
import io
import os

app = Flask(__name__)
CORS(app)  # This allows your React app to communicate with Flask

# Load model
model_path = os.path.join(os.path.dirname(__file__), 'model_final.h5')
model = keras.models.load_model(model_path)
print("Model loaded successfully!")

def classify_image(img_file, threshold=0.8):
    """Classify image from file buffer"""
    # Open and convert image to grayscale
    img = Image.open(img_file).convert('L')
    img = img.resize((150, 150))
    
    # Convert to array and preprocess
    img_array = keras.preprocessing.image.img_to_array(img)
    img_array = img_array.reshape(1, 150, 150, 1)
    img_array = img_array.astype('float32') / 255.0
    
    # Get prediction
    prediction = model.predict(img_array)
    confidence = float(prediction[0][0])
    is_normal = int(confidence >= threshold)
    
    return is_normal, confidence

@app.route('/api/predict', methods=['POST'])
def predict():
    """Prediction endpoint"""
    try:
        if 'image' not in request.files:
            return jsonify({
                'error': 'No image file provided',
                'prediction': 'Error',
                'confidence': 0
            }), 400
        
        file = request.files['image']
        
        if file.filename == '':
            return jsonify({
                'error': 'No file selected',
                'prediction': 'Error',
                'confidence': 0
            }), 400
        
        # Validate file type
        allowed_extensions = {'png', 'jpg', 'jpeg'}
        if not ('.' in file.filename and 
                file.filename.rsplit('.', 1)[1].lower() in allowed_extensions):
            return jsonify({
                'error': 'Invalid file type. Please upload PNG or JPEG',
                'prediction': 'Error',
                'confidence': 0
            }), 400
        
        # Classify the image
        result, confidence = classify_image(file, threshold=0.8)
        
        # Prepare response
        prediction_text = "Normal" if result == 1 else "Pneumonia Detected"
        
        print(f"Prediction: {prediction_text}, Confidence: {confidence:.2%}")
        
        return jsonify({
            'prediction': prediction_text,
            'confidence': confidence
        }), 200
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({
            'error': f'Error processing image: {str(e)}',
            'prediction': 'Error',
            'confidence': 0
        }), 500

@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'model_loaded': True}), 200

if __name__ == '__main__':
    app.run(debug=True, port=5001, host='0.0.0.0')