import gradio as gr
import numpy as np
from PIL import Image
import keras

model = keras.models.load_model('model_final.h5')
print("Model loaded successfully!")

def classify_image(img):
    if img is None:
        return "No image provided", 0
    
    img = Image.fromarray(img).convert('L')
    img = img.resize((150, 150))
    
    img_array = np.array(img)
    img_array = img_array.reshape(1, 150, 150, 1)
    img_array = img_array.astype('float32') / 255.0
    
    prediction = model.predict(img_array)
    confidence = float(prediction[0][0])
    
    if confidence >= 0.5:
        return "Normal", confidence
    else:
        return "Pneumonia Detected", 1 - confidence

demo = gr.Interface(
    fn=classify_image,
    inputs=gr.Image(),
    outputs=[
        gr.Textbox(label="Prediction"),
        gr.Number(label="Confidence")
    ],
    title="PneumoAI - Pneumonia Detection",
    description="Upload a chest X-ray image to detect pneumonia"
)

demo.launch()
