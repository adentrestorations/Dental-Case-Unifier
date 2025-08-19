; =================================
; Run testWinvoice.js on Ctrl+Alt+Y
; =================================

^!y::  ; Ctrl + Alt + Y
{
    ; Change directory to where your JS file is
    SetWorkingDir, C:\Users\User\Desktop\BotWIP\dental-case-unifier\server

    ; Run Node.js script and keep the console open
    Run, cmd.exe /k node testWinvoice.js
    return
}
