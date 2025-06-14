import { createContext, useState, useEffect, useRef } from "react";
import runChat from "../config/gemini";

export const Context= createContext();

const ContextProvider=(props)=>{

    const [input,setInput]=useState("");
    const [recentPrompt, setRecentPrompt]=useState("");
    const [prevPrompts, setPrevPrompts]=useState([]);
    const [prevResponses, setPrevResponses]=useState([]);
    const [showResult, setShowResult]=useState(false);
    const [loading, setLoading]=useState(false);
    const [resultData, setResultData]=useState("");
    const [isListening, setIsListening] = useState(false);
    const [recognition, setRecognition] = useState(null); 

    const [imageData, setImageData] = useState(null);
    const fileInputRef = useRef(null);

    const [greetingText, setGreetingText] = useState("");
    const [greetingComplete, setGreetingComplete] = useState(false);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (SpeechRecognition) {
            const recognitionInstance = new SpeechRecognition();
            recognitionInstance.continuous = false;
            recognitionInstance.interimResults = true;
            recognitionInstance.lang = 'en-US';
            
            recognitionInstance.onstart = () => {
                setIsListening(true);
                console.log("Voice recognition started");
            };
            
            recognitionInstance.onresult = (event) => {
                const transcript = Array.from(event.results)
                    .map(result => result[0])
                    .map(result => result.transcript)
                    .join('');
                
                setInput(transcript);
            };
            
            recognitionInstance.onend = () => {
                setIsListening(false);
                console.log("Voice recognition ended");
            };
            
            recognitionInstance.onerror = (event) => {
                console.error("Voice recognition error:", event.error);
                setIsListening(false);
            };
            
            setRecognition(recognitionInstance);
        } else {
            console.error("Speech recognition not supported in this browser");
        }
        
        return () => {
            if (recognition) {
                recognition.stop();
            }
        };
    }, []);

    const toggleVoiceInput = () => {
        if (!recognition) {
            alert("Speech recognition is not supported in your browser");
            return;
        }
        
        if (isListening) {
            recognition.stop();
        } else {
            setInput("");
            recognition.start();
        }
    }

    const delayPara=(index,nextWord)=>{
        setTimeout(function(){
            setResultData((prev) => prev + nextWord);
        },75 * index);
    }

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            setImageData({
                url: e.target.result,
                alt: file.name,
                type: file.type,
                file: file
            });
        };
        reader.readAsDataURL(file);
    };
    
    const clearImage = () => {
        setImageData(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };
    
    const openGallery = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const onSent=async(prompt)=>{
        setResultData("")
        setLoading(true);
        setShowResult(true)
        setRecentPrompt(input)
        setPrevPrompts((prev) => [...prev, input]);
        
        const response = await runChat(input, imageData);
        
        setPrevResponses(prev => [...prev, response]);
        
        clearImage();
        
        let responseArray = response.split("**");
        let newResponse="";
        for(let i=0;i<responseArray.length;i++)
            {
                if(i===0||i%2!==1){
                    newResponse+= responseArray[i];
                }
                else{
                    newResponse+= "<b>"+responseArray[i]+"</b>";
                }
        }
        let newResponse2=newResponse.split("*").join("<br/>");
        let newResponseArray = newResponse2.split(" ");
        for(let i=0;i<newResponseArray.length;i++){
            const nextWord = newResponseArray[i];
            delayPara(i, nextWord+" ");
        }
        setLoading(false);
        setInput("");
    }

    const loadPreviousPrompt = (index) => {
        const prompt = prevPrompts[index];
        const response = prevResponses[index] || "";
        
        setRecentPrompt(prompt);
        setShowResult(true);

        setResultData("");
        
        let responseArray = response.split("**");
        let newResponse="";
        for(let i=0;i<responseArray.length;i++) {
            if(i===0||i%2!==1){
                newResponse+= responseArray[i];
            }
            else{
                newResponse+= "<b>"+responseArray[i]+"</b>";
            }
        }
        
        let newResponse2=newResponse.split("*").join("<br/>");
        let newResponseArray = newResponse2.split(" ");
        
        for(let i=0;i<newResponseArray.length;i++){
            const nextWord = newResponseArray[i];
            delayPara(i, nextWord+" ");
        }
    }

    const animateGreeting = () => {
        const greeting = " Hello, Kartikey.\n\nHow can I help you today?";
        setGreetingText("");
        setGreetingComplete(false);
        
        let i = 0;
        const typingInterval = setInterval(() => {
            if (i < greeting.length) {
                setGreetingText(prev => prev + greeting.charAt(i));
                i++;
            } else {
                clearInterval(typingInterval);
                setGreetingComplete(true);
            }
        }, 50); 
    };
    
    useEffect(() => {
        animateGreeting();
    }, []);

    const startNewChat = () => {
        setShowResult(false); 
        setResultData(""); 
        setRecentPrompt(""); 
        setInput("");
        animateGreeting();
    }

    const contextValue={
        prevPrompts,
        setPrevPrompts,
        onSent,
        setRecentPrompt,
        recentPrompt,
        showResult,
        loading,
        resultData,
        input,
        setInput,
        loadPreviousPrompt,
        startNewChat,
        isListening,
        toggleVoiceInput,
        imageData,
        openGallery,
        clearImage,
        fileInputRef,
        handleImageUpload,
        greetingText,
        greetingComplete,
    }
    return(
        <Context.Provider value={contextValue}>
            {props.children}
        </Context.Provider>
    )
}


export default ContextProvider;