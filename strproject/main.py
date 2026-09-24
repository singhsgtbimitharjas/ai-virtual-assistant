import random
import pyttsx3
import speech_recognition 
import datetime
import webbrowser
from wikipedia import wikipedia
import requests
from bs4 import BeautifulSoup
import pywhatkit
import pyautogui
from time import sleep
import os
import matplotlib.pyplot as pt
from pynput.keyboard import Key ,Controller
engine = pyttsx3.init("sapi5")
voices = engine.getProperty("voices")
engine.setProperty("voice", voices[0].id)
engine.setProperty("rate",150)
engine.setProperty("volume",1)

dictapp={
    "notepad": "notepad.exe",
    "calculator": "calc.exe",
    "paint": "mspaint.exe",
    "file explorer": "explorer.exe",
    "settings": "ms-settings:",
    "chrome": "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "vscode":"C:\\Users\\Hp\\AppData\\Roaming\\Microsoft\\Windows\\Start Menu\\Programs\\Visual Studio Code",
    "psp": "D:\\PPSSPP\\PPSSPPWindows64.exe"

}

def speak(audio):
    engine.say(audio)
    engine.runAndWait()
   


def takeCommand():
    r = speech_recognition.Recognizer()
    with speech_recognition.Microphone() as source:
        print("Listening.....")
        r.pause_threshold = 0.6
        r.adjust_for_ambient_noise(source,duration=0.5)
        audio = r.listen(source,timeout=5,phrase_time_limit=10)

    try:
   
        print("Understanding..")
        query  = r.recognize_google(audio,language='en-in')
        print(f"You Said: {query}\n")
    
    except Exception as e:
        print("Say that again")
        return "None"
    return query
def greetMe():
    hour  = int(datetime.datetime.now().hour)
    if hour>=0 and hour<=12:
        speak("Good Morning,sir")
    elif hour >12 and hour<=18:
        speak("Good Afternoon ,sir")

    else:
        speak("Good Evening,sir")

    speak("Please tell me, How can I help you ?")
def searchGoogle(query):
    if "google" in query:
        import wikipedia as googleScrap
        query = query.replace("omega","")
        query = query.replace("google search","")
        query = query.replace("google","")
        speak("This is what I found on google")

        try:
            pywhatkit.search(query)
            result = googleScrap.summary(query,1)
            speak(result)

        except:
            speak("No speakable output available")

def searchYoutube(query):
    if "youtube" in query:
        speak("This is what I found for your search!") 
        query = query.replace("youtube search","")
        query = query.replace("youtube","")
        query = query.replace("omega","")
        web  = "https://www.youtube.com/results?search_query=" + query

        webbrowser.open(web)

        pywhatkit.playonyt(query)
        speak("Done, Sir")

def searchWikipedia(query):
    if "wikipedia" in query:
        speak("Searching from wikipedia....")
        query = query.replace("wikipedia","")
        query = query.replace("search wikipedia","")
        query = query.replace("omega","")
        results = wikipedia.summary(query,sentences = 2)
        speak("According to wikipedia..")
        print(results)
        speak(results)
        
def weather():
    speak("Getting weather information")
    url = "https://www.google.com/search?q=weather"
    headers = {'User-Agent': 'Mozilla/5.0'}
    response = requests.get(url, headers=headers)
    soup = BeautifulSoup(response.text, "html.parser")
    temp = soup.find("span", class_="BNeawe iBp4i AP7Wnd")
    if temp:
            temperature = temp.text
            speak(f"Current temperature is {temperature}")
            print(f"Temperature: {temperature}")
    else:
            speak("Unable to fetch weather at the moment")

def getTechNews():
    speak("Fetching the latest BBC news")
    try:
        feed_url = "https://feeds.bbci.co.uk/news/rss.xml"
        response = requests.get(
            feed_url,
            headers={"User-Agent": "Mozilla/5.0"},
            timeout=10
        )
        response.raise_for_status()
        feed = BeautifulSoup(response.content, "html.parser") 
        headlines = feed.find_all("item")[:5]

        if not headlines:
            speak("No BBC news headlines were found")
            return

        speak("Here are the latest BBC headlines")
        for index, item in enumerate(headlines, 1):
            title = item.find("title")
            if title and title.get_text(strip=True):
                headline = title.get_text(strip=True) 
                print(f"{index}. {headline}")
                speak(f"News {index}: {headline}")

    except requests.Timeout:
        speak("News fetch timed out, try again")
    except requests.ConnectionError:
        speak("No internet connection")
    except requests.RequestException as e:
        speak("Unable to fetch news right now")
        print(f"News fetch error: {e}")

def openappweb(query):
    speak("Launching, sir")
    if ".com" in query or ".co.in" in query or ".org" in query:
        query = query.replace("open","")
        query = query.replace("omega","")
        query = query.replace("launch","")
        query = query.replace(" ","")
        webbrowser.open(f"https://www.{query}")
    else:
        keys = list(dictapp.keys())
        for app in keys:
            if app in query:
                os.system(f"start {dictapp[app]}")

def closeappweb(query):
    speak("Closing, sir")
    for num_word, count in [("one",1),("1",1),("2",2),("3",3),("4",4),("5",5)]:
        if f"{num_word} tab" in query or f"{count} tab" in query:
            for _ in range(count):
                pyautogui.hotkey("ctrl", "w")
                sleep(0.4)
            speak("Tabs closed")
            return
   
    for app, exe in dictapp.items():
        if app in query:
            os.system(f"taskkill /f /im {exe}.exe")
keyboard=Controller()
def volumeup():
    for i in range(5):
        keyboard.press(Key.media_volume_up)
        keyboard.release(Key.media_volume_up)
        sleep(0.1)
def volumedown():
    for i in range(5):
        keyboard.press(Key.media_volume_down)
        keyboard.release(Key.media_volume_down)
        sleep(0.1)
def focus_graph():
    file = open("focus.txt","r")
    content = file.read()
    file.close()

    content = content.split(",")
    x1 = []
    for i in range(0,len(content)):
        content[i] = float(content[i])
        x1.append(i)

    print(content)
    y1 = content

    pt.plot(x1,y1,color = "red",marker = "o")
    pt.title("YOUR FOCUSED TIME",fontsize = 16)
    pt.xlabel("Times",fontsize = 14)
    pt.ylabel("Focus Time", fontsize = 14)
    pt.grid()
    pt.show()
if __name__ == "__main__":
    while True:
        query = takeCommand().lower()
    
        if "wake up" in query:
            greetMe()

            while True:
                query = takeCommand().lower()
             
                if "go to sleep" in query:
                    speak("Ok sir , You can me call anytime")
                    raise SystemExit
                elif "hello" in query:
                    speak("Hello sir, how are you?")
                elif "how are you" in query:
                    speak("I am doing great, sir. How can I help you?")
                elif "thank you" in query:
                    speak("You are welcome, sir")
                elif "your name" in query:
                    speak("I am omega, your personal assistant")
                elif "who are you" in query:
                    speak("I am omega, an AI voice assistant created to help you")
                elif "weather " in query:
                    weather()
                elif "news" in query or "headlines" in query:
                    getTechNews()
                elif "the time" in query:
                    strTime = datetime.datetime.now().strftime("%H:%M")    
                    speak(f"Sir, the time is {strTime}")
                elif "open" in query:
                    openappweb(query)
                elif"close"in query:
                    closeappweb(query)
                elif "pause" in query:
                    pyautogui.press("k")
                    speak("video paused")
                elif "play" in query:
                    pyautogui.press("k")
                    speak("video played")
                elif "mute" in query:
                    pyautogui.press("m")
                    speak("video muted")

                elif "volume up" in query:
                    from keyboard import volumeup
                    speak("Turning volume up,sir")
                    volumeup()
                elif "volume down" in query:
                    from keyboard import volumedown
                    speak("Turning volume down, sir")
                    volumedown()
                elif "remember that" in query:
                    rememberMessage = query.replace("remember that","")
                    rememberMessage = query.replace("omega","")
                    speak("You told me to remember that"+rememberMessage)
                    remember = open("Remember.txt","a")
                    remember.write(rememberMessage)
                    remember.close()
                elif "what do you remember" in query:
                    remember = open("Remember.txt","r")
                    speak("You told me to remember that" + remember.read())
                elif "music" in query:
                    speak("Playing your favourite songs, sir")
                    a = (1,2,3) 
                    b = random.choice(a)
                    if b==1:
                        webbrowser.open("https://youtu.be/jL57dghpf50","https://youtu.be/rXLcHtVbtJE","https://youtu.be/yM5APO87aNU")
                                    
                elif " screenshot" in query:
                    im=pyautogui.screenshot()
                    im.save("SS.jpg")
                elif "focus mode" in query:
                    a = int(input("Are you sure that you want to enter focus mode :- [1 for YES / 2 for NO "))
                    if (a==1):
                        speak("Entering the focus mode....")
                        os.startfile("C:\\Users\\Hp\\OneDrive\\Desktop\\harjas bca\\strproject\\focus.py")
                        exit()
                    else:
                        pass
                elif "show my focus" in query:
                    focus_graph()
