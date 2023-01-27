import MicRecorder from "mic-recorder-to-mp3"
import { useEffect, useState, useRef } from "react"
import axios from "axios"
import Image from 'next/image'
import mic from '../assets/mic.png'
import mic1 from '../assets/mic1.png'



const assembly = axios.create({
    baseURL: "https://api.assemblyai.com/v2",
    headers: {
      authorization: "8fe530afb4ff43b19a218382a5a0402e",
      "content-type": "application/json",
      "transfer-encoding": "chunked",
    },
  })


const App = () => {
  // Mic-Recorder-To-MP3
  const recorder = useRef(null) //Recorder
  const audioPlayer = useRef(null) //Ref for the HTML Audio Tag
  const [blobURL, setBlobUrl] = useState(null)
  const [audioFile, setAudioFile] = useState(null)
  const [isRecording, setIsRecording] = useState(null)
  const [isListening, setIsListening] = useState(false)
  useEffect(() => {
    //Declares the recorder object and stores it inside of ref
    recorder.current = new MicRecorder({ bitRate: 128 })
  }, [])

  
    // useEffect(()=>{
        
    // })

    const handleClick = () => {
        if(isListening){
            stopRecording()
        }
        else{
            startRecording()
        }
    setIsListening(!isListening)
    }

  const startRecording = () => {
    // Check if recording isn't blocked by browser
    recorder.current.start().then(() => {
      setIsRecording(true)
      console.log("recording...")
    })
  }

  const stopRecording = () => {
    recorder.current
      .stop()
      .getMp3()
      .then(([buffer, blob]) => {
        console.log("stopped.")

        const file = new File(buffer, "audio.mp3", {
          type: blob.type,
          lastModified: Date.now(),
        })
        const newBlobUrl = URL.createObjectURL(blob)
        setBlobUrl(newBlobUrl)
        setIsRecording(false)
        setAudioFile(file)
        console.log(file)
      })
      .catch((e) => console.log(e))
  }

  

  const [uploadURL, setUploadURL] = useState("")
  const [transcriptID, setTranscriptID] = useState("")
  const [transcriptData, setTranscriptData] = useState("")
  const [transcript, setTranscript] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (audioFile) {
      assembly
        .post("/upload", audioFile)
        .then((res) => {setUploadURL(res.data.upload_url)})
        .catch((err) => console.error(err))
    }
  }, [audioFile])

  console.log(uploadURL)

  const submitTranscriptionHandler = () => {
    assembly
      .post("/transcript", {
        audio_url: uploadURL,
      })
      .then((res) => {
        setTranscriptID(res.data.id)
      })
      .catch((err) => console.error(err))
  }

//   const checkStatusHandler = async () => {
//     try {
//       await assembly.get(`/transcript/${transcriptID}`).then((res) => {
//         setTranscriptData(res.data)
// 		setTranscript(transcriptData.text)
//       })
//     } catch (err) {
//       console.error(err)
//     }
//   }

//   useEffect(() => {
//     const interval = setInterval(() => {
//       if (transcriptData.status !== "completed" && isLoading) {
//         checkStatusHandler()
//       } else {
//         setIsLoading(false)
//         setTranscript(transcriptData.text)

//         clearInterval(interval)
//       }
//     }, 1000)
//     return () => clearInterval(interval)
//   },)


  return (
    <div className="flex flex-col bg-black h-screen items-center p-20 text-white">

        <div className="flex flex-col items-center mt-40 p-10">
            <text className="text-2xl">Hey GPT!</text>

            <text className="p-2">Talk to chatGPT and here the answer through audio while you continue your work!</text>
        </div>
      

      <button onClick={handleClick}>

      {isListening?
        <div className="bg-black p-4 rounded-full border-2 border-gray-700">
            <Image
                src={mic1}
                alt="Mic"
                height="40"
                width="40"
            /> 
        </div>
       : 
       <div className="bg-white p-4 rounded-full">
        <Image
            src={mic}
            alt="Mic"
            height="40"
            width="40"
        />
       </div>
        
        }
      </button>
      {/* <audio ref={audioPlayer} src={blobURL} controls='controls' /> */}

      <div>
        {/* <button onClick={submitTranscriptionHandler}>SUBMIT</button>
        <button onClick={checkStatusHandler}>CHECK STATUS</button> */}
      </div>

      {/* <div>
      {transcriptData.status === "completed" ? (
        <p>{transcript}</p>
      ) : (
        <p>{transcriptData.status}</p>
      )}
    
      </div> */}
    </div>
  )
}

export default App
