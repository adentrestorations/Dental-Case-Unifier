#Persistent
#SingleInstance Force
SetTitleMatchMode, 2

; === SETTINGS ===
rowX := 300                      ; X coordinate within a row
startY := 224                   ; Y position of the first row
rowHeight := 43                 ; Height between each row
numRows := 7                    ; Number of rows visible at once
highlightColor := "0xCDB67E"    ; Your confirmed highlight color (RGB)

; === Main Loop ===
Loop %numRows%
{
    rowNum := A_Index
    rowY := startY + (rowHeight * (rowNum - 1))

    MouseMove, %rowX%, %rowY%, 0
    Sleep, 300  ; Wait for hover effect to apply

    PixelGetColor, foundColor, %rowX%, %rowY%, RGB
    ToolTip, Row %rowNum% @ Y=%rowY% - Color: %foundColor%

    if (foundColor = highlightColor)
    {
        SoundBeep, 1000, 150
        MsgBox, 64, Match Found, Row %rowNum% is highlighted!
        ; Optional: Click the row
        ; MouseClick, left, %rowX%, %rowY%
    }

    Sleep, 200
}

ToolTip
return
