import { GoogleGenerativeAI } from '@google/generative-ai';
import { useCallback, useEffect, useState } from 'react';
import { FaMagic } from 'react-icons/fa';

const genAI = new GoogleGenerativeAI("AIzaSyBo_ZicREeAqKGxQGpoq4AgKxstxd2flO4");

function App() {
  const [inputText, setInputText] = useState('');
  const [enhancedText, setEnhancedText] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [error, setError] = useState('');
  const [enhancementLevel, setEnhancementLevel] = useState('default');

  // Debounce and fetch suggestions as the user types
  useEffect(() => {
    const getSuggestions = async () => {
      if (!inputText.trim()) {
        setSuggestions([]);
        return;
      }
      try {
        setIsLoading(true);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = `Provide concise writing suggestions for this text: "${inputText}". 
List up to 3 improvements in short phrases. Format as bullet points. 
Highlight grammatical errors if present.`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        // Split the result into separate suggestions (filtering out any empty lines)
        const suggestionList = text.split('\n').map(s => s.trim()).filter(Boolean);
        setSuggestions(suggestionList);
        setError('');
      } catch (err) {
        console.error('Error fetching suggestions:', err);
        setError('Failed to get suggestions. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      getSuggestions();
    }, 1000); // 1 second debounce

    return () => clearTimeout(timeoutId);
  }, [inputText]);

  // Enhance the text using the AI model
  const enhanceText = async () => {
    if (!inputText.trim()) return;

    try {
      setIsEnhancing(true);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `Enhance this text to be more ${enhancementLevel} while preserving its meaning: 
"${inputText}". 
Improve grammar, clarity, and overall quality. 
Return only the enhanced text without additional commentary.`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      setEnhancedText(text);
      setError('');
    } catch (err) {
      console.error('Error enhancing text:', err);
      setError('Enhancement failed. Please try again.');
    } finally {
      setIsEnhancing(false);
    }
  };

  // When clicking on a suggestion, replace the entire text in the textarea
  const handleSuggestionClick = useCallback((suggestion) => {
    setInputText(suggestion.trim());
    setSuggestions([]); // Optionally clear suggestions after click
  }, []);

  return (
    <div className="container" style={{ maxWidth: '800px', margin: 'auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>
        AI Writing Assistant <FaMagic />
      </h1>
      
      <div className="input-section">
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Start typing here..."
          rows="6"
          style={{ width: '100%', padding: '10px', fontSize: '16px', boxSizing: 'border-box' }}
        />
        
        <div className="controls" style={{ marginTop: '10px' }}>
          
          
          <button 
            onClick={enhanceText}
            disabled={isEnhancing || !inputText.trim()}
            style={{ padding: '8px 16px', fontSize: '16px', cursor: isEnhancing ? 'not-allowed' : 'pointer' }}
          >
            {isEnhancing ? 'Enhancing...' : 'Enhance'}
          </button>
        </div>
      </div>

      {isLoading && <div className="loading" style={{ marginTop: '10px' }}>Generating suggestions...</div>}
      
      {suggestions.length > 0 && (
        <div className="suggestions" style={{ marginTop: '20px' }}>
          <h3>Suggestions:</h3>
          {suggestions.map((suggestion, index) => (
            <div 
              key={index}
              className="suggestion"
              onClick={() => handleSuggestionClick(suggestion)}
              style={{
                cursor: 'pointer',
                padding: '8px',
                backgroundColor: '#f7f7f7',
                marginBottom: '4px',
                borderRadius: '4px'
              }}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}

      {enhancedText && (
        <div className="enhanced-section" style={{ marginTop: '20px', border: '1px solid #ddd', padding: '15px', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
          <h3>Enhanced Text:</h3>
          <div className="enhanced-text">{enhancedText}</div>
        </div>
      )}

      {error && <div className="error" style={{ marginTop: '10px', color: 'red' }}>{error}</div>}
    </div>
  );
}

export default App;