import React, { useContext } from 'react'
import './Main.css'
import { assets } from '../../assets/assets'
import { Context } from '../../context/Context'

const Main = ({ toggleSidebar, isMobileView, sidebarVisible }) => {
  const {
    onSent, 
    recentPrompt, 
    showResult, 
    loading, 
    resultData, 
    input, 
    setInput, 
    isListening, 
    toggleVoiceInput,
    imageData,
    openGallery,
    clearImage,
    fileInputRef,
    handleImageUpload,
    greetingText,
    greetingComplete
  } = useContext(Context)
  
  return (
    <div className="main">
      <div className="nav">
          {isMobileView && (
            <div className="mobile-menu" onClick={toggleSidebar}>
              <img src={assets.menu_icon} alt="Menu" />
            </div>
          )}
          <p>Kriti<span className="logo-dot">.</span>AI</p>
          <img src={assets.user_icon} alt="" />
      </div>
      <div className="main-container">
        {!showResult ? (
          <>
            <div className="greet">
              {greetingText.split('\n').map((line, index) => (
                line ? 
                  <p key={index} className={index === 0 ? 'greeting-name' : ''}>
                    {index === 0 ? <span>{line}</span> : line}
                    {index === greetingText.split('\n').length - 1 && !greetingComplete && 
                      <span className="typing-cursor">|</span>}
                  </p>
                : <br key={index} />
              ))}
            </div>
            <div className="cards">
              <div className="card">
                  <p>Suggest beautiful places to see on an upcoming road trip</p>
                  <img src={assets.compass_icon} alt="" />
              </div>
              <div className="card">
                  <p>Briefly summarize this concept: urban planning</p>
                  <img src={assets.bulb_icon} alt="" />
              </div>
              <div className="card">
                  <p>Brainstorm team bonding activities for our work retreat</p>
                  <img src={assets.message_icon} alt="" />
              </div>
              <div className="card">
                  <p>Improve the readability of the following code</p>
                  <img src={assets.code_icon} alt="" />
              </div>
            </div>
          </>
        ) : (
          <div className='result'>
            <div className="result-title">
                <img src={assets.user_icon} alt="" />
                <p>{recentPrompt}</p>
            </div>
            <div className="result-data">
                <img src={assets.gemini_icon} alt="" />
                {loading ? (
                  <div className='loader'>
                    <hr />
                    <hr />
                    <hr />
                  </div>
                ) : (
                  <p dangerouslySetInnerHTML={{__html:resultData}}></p>
                )}
            </div>
          </div>
        )}
        
        {/* Image preview */}
        {imageData && (
          <div className="image-preview">
            <img src={imageData.url} alt={imageData.alt} />
            <button onClick={clearImage} className="clear-image">×</button>
          </div>
        )}
        
        <div className="main-bottom">
              <div className="search-box">
                  <input 
                    onChange={(e)=>setInput(e.target.value)} 
                    value={input} 
                    type="text" 
                    placeholder='Enter a prompt here'
                  />
                  <div>
                      {/* Hidden file input */}
                      <input 
                        type="file" 
                        accept="image/*" 
                        style={{ display: 'none' }}
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                      />
                      <img 
                        src={assets.gallery_icon} 
                        alt="Upload image" 
                        onClick={openGallery}
                        className={imageData ? 'gallery-active' : ''}
                      />
                      <img 
                        src={assets.mic_icon} 
                        alt="Voice input" 
                        onClick={toggleVoiceInput} 
                        className={isListening ? 'mic-active' : ''}
                      />
                      <img onClick={()=>onSent()} src={assets.send_icon} alt="" />
                  </div>
              </div>
              <p className="bottom-info">Kriti.AI may display inaccurate info, including about people, so double-check its responses. Your privacy and Kriti.AI Apps</p>
          </div>
      </div>
    </div>
  )
}

export default Main