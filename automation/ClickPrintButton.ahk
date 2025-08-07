#Persistent
SetTimer, CheckPrintSignal, 500
return

CheckPrintSignal:
If FileExist("C:\Users\User\Desktop\BotWIP\dental-case-unifier\server\print_signal.txt")
{
    FileDelete, C:\Users\User\Desktop\BotWIP\dental-case-unifier\server\print_signal.txt

    ; Bring Chrome to front
    WinActivate, dashboard · My iTero
    Sleep, 500  ; Wait a bit for activation
    
    ; Press Enter to trigger print
    SendInput {Enter}{Enter}
    
    ; Optional: show feedback
    SoundBeep
    MsgBox, AHK: Sent Enter to Chrome!
}
return
