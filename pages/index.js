// import { Inter } from '@next/font/google'
// const inter = Inter({ subsets: ['latin'] })
import Image from 'next/image'
import { useState, useEffect } from 'react'
import axios from 'axios'
import qs from "qs"
// import RecordRTC from 'recordrtc';
import { useRef } from 'react';
import MicRecorder from "mic-recorder-to-mp3"


const assembly = axios.create({
  baseURL: "https://api.assemblyai.com/v2",
  headers: {
    authorization: "8fe530afb4ff43b19a218382a5a0402e",
    // "content-type": "application/json",
    // "transfer-encoding": "chunked",
  },
})
// assembly
//     .post("/transcript", {
//         audio_url: "https://bit.ly/3yxKEIY"
//     })
//     .then((res) => console.log(res.data))
//     .catch((err) => console.error(err))

export default function Home() {

  const [question, setQuestion]=useState("")
  const [answer, setAnswer]=useState("")
  const recorder = useRef(null)
  const audioRef = useRef();
  const [blobURL, setBlobUrl] = useState(null)
  const [audioFile, setAudioFile] = useState(null)
  const [isRecording, setIsRecording] = useState(false)
  const [uploadURL, setUploadURL] = useState("")
  const [transcriptID, setTranscriptID] = useState("nope")
  const [transcriptData, setTranscriptData] = useState("not yet")
  const [transcript, setTranscript] = useState("Aabracadaabra...")
  const [btn, setBtn] = useState("Start")

  function questionUpdate(e){
    setQuestion(e.target.value)
    e.preventDefault()
  }

  useEffect(() => {
    recorder.current = new MicRecorder({ bitRate: 128 })
  }, [])

  // const startstopRecording = async () =>{
  //   if(!isRecording){
  //     recorder.current.start().then(() => {
  //       setIsRecording(true)
  //       setBtn("Pause")
  //     })
  //   }else{
  //     setBtn("Start")
  //     recorder.current
  //     .stop()
  //     .getMp3()
  //     .then(([buffer, blob]) => {
  //       const file = new File(buffer, "audio.mp3", {
  //         type: blob.type,
  //         lastModified: Date.now(),
  //       })
  //       const newBlobUrl = URL.createObjectURL(blob)
  //       setBlobUrl(newBlobUrl)
  //       setIsRecording(false)
  //       setAudioFile(file)
  //       console.log(audioFile)
    
  //     })
  //     .catch((e) => console.log(e))
      
  //   }
  // }

  const startRecording = () => {
    // Check if recording isn't blocked by browser
    recorder.current.start().then(() => {
      setIsRecording(true)
    })
  }

  const stopRecording = () => {
    recorder.current
      .stop()
      .getMp3()
      .then(([buffer, blob]) => {
        const file = new File(buffer, "audio.mp3", {
          type: blob.type,
          lastModified: Date.now(),
        })
        const newBlobUrl = URL.createObjectURL(blob)
        setBlobUrl(newBlobUrl)
        setIsRecording(false)
        setAudioFile(file)
        console.log("This is url: "+blobURL)
      })
      .catch((e) => console.log(e))
  }


  useEffect(() => {
    if (audioFile) {
      assembly
        .post("/upload", audioFile)
        .then((res) => {
          setUploadURL(res.data.upload_url)
          submitTranscriptionHandler()
          console.log("uploaded")
        })
        .catch((err) => console.error(err))
    }
  }, [audioFile])


  const submitTranscriptionHandler = async () => {
    assembly
      .post("/transcript", {
        audio_url: uploadURL,
      })
      .then((res) => {
        setTranscriptID(res.data.id)
        console.log(transcriptID)

        // try {
        //   assembly.get(`/transcript/${transcriptID}`).then((res) => {
        //     setTranscriptData(res.data)
        //     if(transcriptData.status==="completed"){
        //       setTranscript(transcriptData.text)
        //     }else{
        //       setTranscript("Aabracadaabra...")
        //     }		
        //     console.log(transcript)
        //   })
        // } catch (err) {
        //   console.error(err)
        // }
        
      })
      .catch((err) => console.error(err))


      // try {
      //   await assembly.get(`/transcript/${transcriptID}`).then((res) => {
      //     setTranscriptData(res.data)
      //     if(transcriptData.status==="completed"){
      //       setTranscript(transcriptData.text)
      //     }else{
      //       setTranscript("Aabracadaabra...")
      //     }		
      //   })
      // } catch (err) {
      //   console.error(err)
      // }
  }
  const checkStatusHandler = async () => {
    try {
      await assembly.get(`/transcript/${transcriptID}`).then((res) => {
        setTranscriptData(res.data)
        if(transcriptData.status==="completed"){
          setTranscript(transcriptData.text)
        }else{
          setTranscript("Aabracadaabra...")
        }		
        console.log(transcriptData)
      })
    } catch (err) {
      console.error(err)
    }
  }

  async function sendQuestion(){
    if(transcriptData.status==="completed"){
      var data = {
        question: transcriptData.text
      };
      await axios.post("http://localhost:5080", qs.stringify(data))
      .then((response)=>{
        setAnswer(response.data.data)
        })
    }else{
      console.log("not yet")
    }
    
  }


  return (
    <>
    
      <h1>Heyyy</h1>
      <h2>Ask me anything!</h2>
      <audio ref={audioRef} src={blobURL} controls='controls' />
      <br></br>
      <button onClick={startRecording}>
        start
      </button>
      <button onClick={stopRecording}>
        stop
      </button>
      <p>{transcript}</p>
      
      <button onClick={submitTranscriptionHandler}> Submit </button>
      <button onClick={checkStatusHandler}>CHECK STATUS</button>
      <button onClick={sendQuestion}>ASK GPT!</button>
      <h2>{answer}</h2>

      

    </>
  )
}




// const axios = require("axios");
  
// const assembly = axios.create({
//     baseURL: "https://api.assemblyai.com/v2",
//     headers: {
//         authorization: "YOUR-API-TOKEN",
//     },
// });
// assembly
//     .post("/transcript", {
//         audio_url: "https://bit.ly/3yxKEIY"
//     })
//     .then((res) => console.log(res.data))
//     .catch((err) => console.error(err));
