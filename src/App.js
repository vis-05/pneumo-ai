import React, { useState, useEffect, useRef } from 'react';
import { Upload, Activity, Brain, Database, Github, AlertCircle, CheckCircle, XCircle, ChevronDown, Menu, X, ArrowUp } from 'lucide-react';

// Main component for pneumonia detection web application
// Handles image upload, ML prediction, and displays educational content about pneumonia
const PneumoniaDetectionSite = () => {
  // State management for the application
  const [activeSection, setActiveSection] = useState('home');  // Track current section for nav highlighting
  const [uploadedImage, setUploadedImage] = useState(null);    // Store uploaded file object
  const [prediction, setPrediction] = useState(null);          // Store ML model prediction results
  const [loading, setLoading] = useState(false);               // Loading state during API call
  const [menuOpen, setMenuOpen] = useState(false);             // Mobile hamburger menu toggle
  const [imagePreview, setImagePreview] = useState(null);      // Base64 image preview URL
  const [scrolled, setScrolled] = useState(false);             // Track scroll position for navbar shrink effect
  const [showScrollTop, setShowScrollTop] = useState(false);   // Show/hide scroll-to-top button

  // Refs for smooth scrolling navigation between sections
  const sectionsRef = {
    home: useRef(null),
    understanding: useRef(null),
    testing: useRef(null),
    technical: useRef(null)
  };

  // Handle scroll events for navbar effects and section tracking
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      
      // Shrink navbar after scrolling past 50px
      setScrolled(scrollPosition > 50);
      
      // Show scroll-to-top button after 300px
      setShowScrollTop(scrollPosition > 300);

      // Detect which section is currently in view for nav highlighting
      const sections = Object.entries(sectionsRef);
      const current = sections.find(([, ref]) => {
        if (ref.current) {
          const rect = ref.current.getBoundingClientRect();
          return rect.top <= 150 && rect.bottom >= 150;
        }
        return false;
      });
      if (current) setActiveSection(current[0]);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Smooth scroll to specific section
  const scrollToSection = (section) => {
    sectionsRef[section].current?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);  // Close mobile menu after navigation
  };

  // Scroll back to top of page
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Process uploaded image file and generate preview
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
      setUploadedImage(file);
      
      // Convert image to base64 for preview
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
      
      setPrediction(null);  // Reset previous predictions
    }
  };

  // Enable drag and drop functionality
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // Handle dropped image files
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
      setUploadedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
      setPrediction(null);
    }
  };

  // Send image to Flask backend for pneumonia prediction
  const analyzeImage = async () => {
    if (!uploadedImage) return;
    
    setLoading(true);
    const formData = new FormData();
    formData.append('image', uploadedImage);

    try {
      // Switch between local development and production API endpoints
      const apiUrl = process.env.NODE_ENV === 'production' 
        ? '/api/predict' 
        : 'http://localhost:5001/api/predict';
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      setPrediction(data);
    } catch (error) {
      console.error('Prediction error:', error);
      setPrediction({ 
        prediction: 'Error', 
        confidence: 0,
        error: 'Failed to analyze image. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-slate-900 text-white">
      {/* Fixed Navigation Bar - shrinks on scroll */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-slate-900/95 backdrop-blur-xl border-b border-blue-500/20 py-3' 
          : 'bg-slate-900/80 backdrop-blur-lg border-b border-blue-500/20 py-4'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo/Brand */}
            <div className={`font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent transition-all duration-300 ${
              scrolled ? 'text-lg' : 'text-xl'
            }`}>
              PneumoAI
            </div>
            
            {/* Desktop Navigation Menu */}
            <div className="hidden md:flex space-x-2">
              {[
                { id: 'home', label: 'Home' },
                { id: 'understanding', label: 'About Disease' },
                { id: 'testing', label: 'Detection' },
                { id: 'technical', label: 'Model Info' }
              ].map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => scrollToSection(id)}
                  className={`px-4 py-2 rounded-full transition-all duration-300 text-sm ${
                    activeSection === id
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/50'
                      : 'text-blue-200 hover:bg-blue-500/20'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {menuOpen && (
          <div className="md:hidden bg-slate-900 border-t border-blue-500/20">
            <div className="px-4 py-4 space-y-2">
              {[
                { id: 'home', label: 'Home' },
                { id: 'understanding', label: 'About Disease' },
                { id: 'testing', label: 'Detection' },
                { id: 'technical', label: 'Model Info' }
              ].map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => scrollToSection(id)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                    activeSection === id
                      ? 'bg-blue-500 text-white'
                      : 'text-blue-200 hover:bg-blue-500/20'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Scroll to Top Button - appears after scrolling down */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 p-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full shadow-2xl shadow-blue-500/50 hover:shadow-cyan-500/50 transition-all duration-300 hover:scale-110 group"
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-6 h-6 text-white group-hover:animate-bounce" />
        </button>
      )}

      {/* Hero Section - Landing page with animated background */}
      <section ref={sectionsRef.home} className="min-h-screen flex items-center justify-center relative overflow-hidden pt-16">
        {/* Animated gradient background orbs */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500 rounded-full filter blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="relative z-10 text-center px-4">
          <div className="mb-8 flex justify-center">
            <Activity className="w-20 h-20 text-cyan-400 animate-pulse" />
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent animate-gradient">
            Pneumonia Detection AI
          </h1>
          <p className="text-xl md:text-2xl text-blue-200 mb-12 max-w-2xl mx-auto">
            Advanced machine learning for rapid and accurate pneumonia screening from chest X-rays
          </p>
          <button
            onClick={() => scrollToSection('understanding')}
            className="group px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full font-semibold text-lg shadow-lg shadow-blue-500/50 hover:shadow-cyan-500/50 transition-all duration-300 hover:scale-105"
          >
            Explore Technology
            <ChevronDown className="inline ml-2 group-hover:translate-y-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* Understanding Pneumonia Section - Educational content about the disease */}
      <section ref={sectionsRef.understanding} className="min-h-screen py-20 px-4 flex items-center">
        <div className="max-w-7xl mx-auto w-full">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent pb-2">
            Understanding Pneumonia
          </h2>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Column - Information Cards */}
            <div className="space-y-6">
              <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-5 border border-blue-500/20 hover:border-blue-500/40 transition-all">
                <h3 className="text-xl font-semibold mb-3 text-cyan-400">What is Pneumonia?</h3>
                <p className="text-blue-100 leading-relaxed text-sm">
                  Pneumonia is an infection that inflames the air sacs in one or both lungs. The air sacs may fill with fluid or pus, causing cough with phlegm, fever, chills, and difficulty breathing.
                </p>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-5 border border-blue-500/20 hover:border-blue-500/40 transition-all">
                <h3 className="text-xl font-semibold mb-3 text-cyan-400">Common Symptoms</h3>
                <ul className="space-y-2 text-blue-100 text-sm">
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-cyan-400 mr-2 mt-1 flex-shrink-0" />
                    <span>Chest pain when breathing or coughing</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-cyan-400 mr-2 mt-1 flex-shrink-0" />
                    <span>Cough with phlegm or pus</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-cyan-400 mr-2 mt-1 flex-shrink-0" />
                    <span>Fever, sweating, and chills</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-cyan-400 mr-2 mt-1 flex-shrink-0" />
                    <span>Shortness of breath and fatigue</span>
                  </li>
                </ul>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-5 border border-blue-500/20 hover:border-blue-500/40 transition-all">
                <h3 className="text-xl font-semibold mb-3 text-cyan-400">Why Early Detection Matters</h3>
                <p className="text-blue-100 leading-relaxed text-sm">
                  Early and accurate diagnosis of pneumonia is crucial for effective treatment and preventing complications. Chest X-rays remain the gold standard for pneumonia detection.
                </p>
              </div>
            </div>

            {/* Right Column - X-ray Examples and Statistics */}
            <div className="space-y-6">
              {/* Side-by-side X-ray comparison */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="relative group overflow-hidden rounded-2xl shadow-2xl">
                  <div className="aspect-square bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                    <img
                      src="/images/normal.jpeg"
                      alt="Normal Chest X-Ray"
                      className="w-auto h-full object-cover"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
                    <p className="p-4 text-sm">Normal Chest X-Ray</p>
                  </div>
                </div>

                <div className="relative group overflow-hidden rounded-2xl shadow-2xl">
                  <div className="aspect-square bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                    <img
                      src="/images/virus.jpeg"
                      alt="Pneumonia Affected X-Ray"
                      className="w-auto h-full object-cover"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
                    <p className="p-4 text-sm">Pneumonia-Affected X-Ray</p>
                  </div>
                </div>
              </div>

              {/* Global statistics */}
              <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl p-6 border border-blue-500/30">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-3xl font-bold text-cyan-400">450M</div>
                    <div className="text-sm text-blue-200">Annual Cases Globally</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-cyan-400">2.1M</div>
                    <div className="text-sm text-blue-200">Annual Deaths (2021)</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testing Section - Image upload and prediction results */}
      <section ref={sectionsRef.testing} className="min-h-screen py-20 px-4 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent pb-2">
            Test Your X-Ray
          </h2>

          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* Left Column - Result interpretation guide */}
            <div className="space-y-6">
              <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-blue-500/20">
                <h3 className="text-xl font-semibold mb-4 text-cyan-400">How to Interpret Results</h3>
                <p className="text-blue-100 leading-relaxed mb-4">
                  Our AI model analyzes your chest X-ray and provides a prediction with a confidence score. Think of it like this: if we tested 100 X-rays, the model would correctly identify approximately 87 out of 100 cases.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 rounded-full bg-green-500"></div>
                    <span className="text-sm text-blue-100">Normal: No signs of pneumonia detected</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 rounded-full bg-red-500"></div>
                    <span className="text-sm text-blue-100">Pneumonia: Potential indicators found</span>
                  </div>
                </div>
              </div>

              {/* Visual indicators */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-4 border border-green-500/30">
                  <div className="text-center mb-2">
                    <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-2" />
                    <div className="font-semibold text-green-400">Normal</div>
                  </div>
                  <div className="text-xs text-blue-200">Clear lung fields with no abnormal opacities</div>
                </div>
                <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-4 border border-red-500/30">
                  <div className="text-center mb-2">
                    <XCircle className="w-12 h-12 text-red-400 mx-auto mb-2" />
                    <div className="font-semibold text-red-400">Pneumonia</div>
                  </div>
                  <div className="text-xs text-blue-200">Visible infiltrates or consolidation patterns</div>
                </div>
              </div>

              {/* Example scenario explanation */}
              <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl p-6 border border-blue-500/30">
                <h3 className=" text-xl font-semibold mb-2 text-cyan-400">Example Scenario</h3>
                <p className="text-blue-100 leading-relaxed">
                  If the model shows "Pneumonia Detected" with 85% confidence, it means the AI model found patterns in your X-ray that match pneumonia characteristics with high certainty. However, this is still a screening and decision support tool, not a final diagnosis.
                </p>
              </div>
            </div>

            {/* Right Column - Upload interface and results */}
            <div className="space-y-6">
              <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-blue-500/20">
                <h3 className="text-xl font-semibold mb-6 text-cyan-400">Upload X-Ray Image</h3>
                
                {/* Drag and drop upload area */}
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className="border-2 border-dashed border-blue-500/50 rounded-xl p-8 text-center hover:border-cyan-500 transition-colors cursor-pointer bg-slate-900/50"
                >
                  {!imagePreview ? (
                    <>
                      <Upload className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                      <p className="text-blue-200 mb-2">Drag and drop your X-ray here</p>
                      <p className="text-sm text-blue-300 mb-4">or</p>
                      <label className="inline-block px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg cursor-pointer transition-colors">
                        Browse Files
                        <input
                          type="file"
                          accept="image/jpeg,image/png"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                      <p className="text-xs text-blue-300 mt-4">Supported formats: JPEG, PNG</p>
                    </>
                  ) : (
                    <div className="space-y-3">
                      <img src={imagePreview} alt="Preview" className="max-h-16 mx-auto rounded-lg" />
                      <div className="flex gap-2 justify-center">
                        <label className="inline-block px-3 py-1.5 bg-blue-500 hover:bg-blue-600 rounded-lg cursor-pointer transition-colors text-xs">
                          Change Image
                          <input
                            type="file"
                            accept="image/jpeg,image/png"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </label>
                        <button
                          onClick={() => {
                            setUploadedImage(null);
                            setImagePreview(null);
                            setPrediction(null);
                          }}
                          className="px-3 py-1.5 bg-red-500 hover:bg-red-600 rounded-lg transition-colors text-xs"
                        >
                          Remove Image
                        </button>
                      </div>
                      <p className="text-xs text-blue-300 text-center">{uploadedImage?.name}</p>
                    </div>
                  )}
                </div>

                {/* Analyze button - appears only when image is uploaded */}
                {uploadedImage && !prediction && (
                  <button
                    onClick={analyzeImage}
                    disabled={loading}
                    className="w-full mt-4 px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl font-semibold text-lg shadow-lg shadow-blue-500/50 hover:shadow-cyan-500/50 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <Brain className="w-5 h-5 mr-2 animate-pulse" />
                        Analyzing...
                      </span>
                    ) : (
                      'Analyze X-Ray'
                    )}
                  </button>
                )}
              </div>

              {/* Prediction results display - appears after analysis */}
              {prediction && (
                <div className={`bg-slate-800/50 backdrop-blur-lg rounded-2xl p-4 border-2 ${
                  prediction.error 
                    ? 'border-yellow-500/50' 
                    : prediction.prediction?.toLowerCase().includes('normal') 
                      ? 'border-green-500/50' 
                      : 'border-red-500/50'
                }`}>
                  <h3 className="text-xl font-semibold mb-3 text-cyan-400">Analysis Results</h3>
                  
                  {prediction.error ? (
                    <div className="text-yellow-400 flex items-center">
                      <AlertCircle className="w-6 h-6 mr-2" />
                      {prediction.error}
                    </div>
                  ) : (
                    <>
                      {/* Prediction result with icon */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          {prediction.prediction?.toLowerCase().includes('normal') ? (
                            <CheckCircle className="w-10 h-10 text-green-400" />
                          ) : (
                            <XCircle className="w-10 h-10 text-red-400" />
                          )}
                          <div>
                            <div className="text-ml font-bold">{prediction.prediction || 'Unknown'}</div>
                            <div className="text-sm text-blue-300">Classification Result</div>
                          </div>
                        </div>
                      </div>

                      {/* Confidence level progress bar */}
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-blue-200">Confidence Level</span>
                          <span className="font-semibold text-cyan-400">
                            {prediction.confidence ? `${(prediction.confidence * 100).toFixed(1)}%` : 'N/A'}
                          </span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-1000 ${
                              prediction.prediction?.toLowerCase().includes('normal')
                                ? 'bg-gradient-to-r from-green-500 to-green-400'
                                : 'bg-gradient-to-r from-red-500 to-red-400'
                            }`}
                            style={{ width: `${(prediction.confidence || 0) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </>
                  )}
                  
                  {/* Medical disclaimer - important for legal compliance */}
                  <div className="mt-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                      <h4 className="font-semibold text-yellow-400 text-sm">Important Medical Disclaimer</h4>
                    </div>
                    <p className="text-xs text-yellow-100 leading-relaxed mb-2">
                      This is a preliminary screening tool only and should not be used as a substitute for professional medical advice. Always consult a qualified healthcare professional for accurate diagnosis.
                    </p>
                  </div>  
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Technical Documentation Section - Model architecture and dataset details */}
      <section ref={sectionsRef.technical} className="min-h-screen py-20 pb-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent pb-2">
            Technical Documentation
          </h2>

          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* Left Column - Model visualization and metrics */}
            <div className="space-y-6">
              {/* Model architecture diagram */}
              <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-blue-500/20">
                <div className="aspect-video bg-black rounded-lg flex items-center justify-center mb-4 overflow-hidden">
                  <img
                    src="/images/modelarch.png"
                    alt="Model Architecture Diagram"
                    className="w-auto h-auto object-cover"
                  />
                </div>
                <p className="text-center text-sm text-blue-200">Model Architecture Diagram</p>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-4 border border-blue-500/20 text-center">
                  <Database className="w-10 h-10 text-cyan-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-cyan-400">5,216</div>
                  <div className="text-xs text-blue-200">Training Images</div>
                </div>
                <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-4 border border-blue-500/20 text-center">
                  <Activity className="w-10 h-10 text-cyan-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-cyan-400">87.36%</div>
                  <div className="text-xs text-blue-200">Accuracy</div>
                </div>
              </div>

              {/* Performance Metrics Card */}
              <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-blue-500/20">
                <h4 className="font-semibold mb-4 text-cyan-400">Performance Metrics</h4>
                {/* Metrics list container */}
                <div className="space-y-3">
                  {/* Map through performance metrics array and render each metric */}
                  {[
                    { label: 'Accuracy', value: '87.36%' },
                    { label: 'Precision', value: '89.22%' },
                    { label: 'Recall', value: '89.62%' },
                    { label: 'F1-Score', value: '89.42%' }
                  ].map((metric, i) => (
                    // Individual metric row with label and value
                    <div key={i} className="flex justify-between items-center">
                      <span className="text-blue-200">{metric.label}</span>
                      <span className="font-semibold text-cyan-400">{metric.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Training Details Card */}
              <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-blue-500/20">
                <h3 className="text-2xl font-semibold mb-4 text-cyan-400">Training Details</h3>
                <div className="space-y-4">
                  {/* Framework Section */}
                  <div>
                    <h4 className="font-semibold text-blue-300 mb-2">Framework</h4>
                    <p className="text-blue-100">TensorFlow 2.18</p>
                  </div>
                  {/* Hyperparameters Section */}
                  <div>
                    <h4 className="font-semibold text-blue-300 mb-2">Hyperparameters</h4>
                    {/* List of training hyperparameters used for the model */}
                    <ul className="space-y-2 text-blue-100 text-sm">
                      <li>• Optimizer: Adam</li>
                      <li>• Learning Rate: 0.0001</li>
                      <li>• Batch Size: 32</li>
                      <li>• Epochs: 50</li>
                      <li>• Loss Function: Binary Crossentropy</li>
                    </ul>
                  </div>
                  {/* Data Augmentation Section */}
                  <div>
                    <h4 className="font-semibold text-blue-300 mb-2">Data Augmentation</h4>
                    {/* Description of augmentation techniques applied during training */}
                    <p className="text-blue-100 text-sm">
                      Applied rotation, zoom, horizontal flip, and brightness adjustments to improve model generalization and reduce overfitting.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Dataset, Architecture, and GitHub sections */}
            <div className="space-y-6">
              {/* Dataset Information Card */}
              <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-blue-500/20">
                <h3 className="text-2xl font-semibold mb-4 text-cyan-400 flex items-center">
                  {/* Database icon from Lucide React */}
                  <Database className="w-6 h-6 mr-2" />
                  Dataset Information
                </h3>
                <div className="space-y-4">
                  {/* Dataset Name */}
                  <div>
                    <h4 className="font-semibold text-blue-300 mb-2">Dataset Name</h4>
                    <p className="text-blue-100">Chest X-Ray Images (Pneumonia) Dataset</p>
                  </div>
                  {/* Dataset Source Link */}
                  <div>
                    <h4 className="font-semibold text-blue-300 mb-2">Source</h4>
                    {/* External link to Kaggle dataset - opens in new tab */}
                    <a 
                      href="https://www.kaggle.com/datasets/paultimothymooney/chest-xray-pneumonia" target="_blank"
                      className="inline-flex items-center px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg border border-blue-500/30 transition-colors text-cyan-400"
                    >
                      View Dataset on Kaggle
                      <Github className="w-4 h-4 ml-2" />
                    </a>
                  </div>
                  {/* Dataset Statistics */}
                  <div>
                    <h4 className="font-semibold text-blue-300 mb-2">Dataset Statistics</h4>
                    {/* Breakdown of dataset composition and image specifications */}
                    <ul className="space-y-2 text-blue-100 text-sm">
                      <li>• Total Images: 5,856</li>
                      <li>• Training Set: 5,216 images </li>
                      <li>• Validation Set: 1,248 images </li>
                      <li>• Test Set: 2,589 images </li>
                      <li>• Image Resolution: 256 x 256 pixels</li>
                      <li>• Format: JPEG</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Model Architecture Card */}
              <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-blue-500/20">
                <h3 className="text-2xl font-semibold mb-4 text-cyan-400 flex items-center">
                  {/* Brain icon representing AI/ML */}
                  <Brain className="w-6 h-6 mr-2" />
                  Model Architecture
                </h3>
                <div className="space-y-4">
                  {/* Network Type */}
                  <div>
                    <h4 className="font-semibold text-blue-300 mb-2">Network Type</h4>
                    <p className="text-blue-100">Custom VGG-Inspired Convolutional Neural Network (CNN)</p>
                  </div>
                  {/* Base Model */}
                  <div>
                    <h4 className="font-semibold text-blue-300 mb-2">Base Model</h4>
                    <p className="text-blue-100">VGG16</p>
                  </div>
                  {/* Architecture Details */}
                  <div>
                    <h4 className="font-semibold text-blue-300 mb-2">Architecture Details</h4>
                    {/* Detailed breakdown of neural network layers and parameters */}
                    <ul className="space-y-2 text-blue-100 text-sm">
                      <li>• Input Layer: 150 x 150 x 1 (Grayscale)</li>
                      <li>• Convolutional Layers: 5 layers with increasing filters (32 → 256)</li>
                      <li>• Pooling Layers: Max pooling with 2 x 2 kernels</li>
                      <li>• Fully Connected Layers: 1 hidden dense layer (128 neurons)</li>
                      <li>• Output Layer: Sigmoid activation (Binary classification)</li>
                      <li>• Total Parameters: ~ 2.3–2.6 Million</li>
                    </ul>
                  </div>
                  {/* Code Snippet Section */}
                  <div>
                    <h4 className="font-semibold text-blue-300 mb-2">Code Snippet</h4>
                    {/* Code block showing model definition in TensorFlow/Keras syntax */}
                    <div className="bg-slate-900 rounded-lg p-4 text-xs font-mono overflow-x-auto border border-blue-500/30">
                      <pre className="text-cyan-400">
{`model = Sequential([
    layers.Conv2D(32, kernel_size = (3,3), activation='relu', strides = 1, padding = 'same', input_shape=(150,150,1)),
    layers.BatchNormalization(),
    layers.MaxPooling2D((2, 2), strides = 2, padding = 'same'),
    ...
    layers.Dropout(0.2),
    layers.Dense(1, activation='sigmoid'), ])
`}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>

              {/* GitHub Repository Link Card */}
              <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-4 border border-blue-500/20">
                <h4 className="font-semibold text-blue-300 mb-2">GitHub Repository</h4>
                {/* Link to project's GitHub repository */}
                <a 
                  href="https://github.com/vis-05/pneumo-ai.git" target="_blank" 
                  className="inline-flex items-center px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-cyan-400 text-sm"
                >
                  <Github className="w-4 h-4 mr-2" />
                  View on GitHub
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="bg-slate-900 border-t border-blue-500/20 py-5 px-4">
        <div className="max-w-7xl mx-auto text-center">
          {/* Copyright notice */}
          <p className="text-blue-300 text-ml">
            © 2024 PneumoAI Detection System
          </p>
          {/* Medical disclaimer - important for healthcare-related applications */}
          <p className="text-blue-400 text-xs mt-2">
            Not intended for clinical diagnosis. Always consult healthcare professionals.
          </p>
        </div>
      </footer>

      {/* Custom CSS for gradient animation */}
      {/* This creates an animated gradient effect used elsewhere in the component */}
      <style jsx>{`
        /* Keyframe animation for gradient background movement */
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        /* Class to apply the gradient animation */
        .animate-gradient {
          background-size: 200% auto;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
};

// Export the component as default for use in other parts of the application
export default PneumoniaDetectionSite;
