#NoEnv
#SingleInstance Force
SetTitleMatchMode, 2
DetectHiddenWindows, On
SetWorkingDir %A_ScriptDir%

; === Settings ===
inlabPath := "C:\Users\User\Desktop\inLab.exe"  ; <<< CHANGE THIS to actual inLab path
nircmdPath := "C:\Users\User\Desktop\nircmd.exe"
rowY := 224
rowHeight := 43
rowImage := "row1.png"
rowText := "row1.txt"

; Activate the inLab window by its window title (or part of it)
WinActivate, inLab
Sleep, 3000

; === Step 3: Click to open case list ===
Click, 65, 240
Sleep, 4000

; === Step 4: Take full screenshot ===
RunWait, %ComSpec% /c ""%nircmdPath%" savescreenshotfull temp_full.png", , Hide

; === Step 5: Crop to one row (using Tesseract's built-in area config) ===
; Coordinates of row 1: x = 105 to 1259, y = 224 to 267 (height = 43)
x := 105
y := 224
w := 1259 - 105
h := 43

; Run Tesseract with region
RunWait, %ComSpec% /c tesseract temp_full.png %rowText% -l eng --psm 6 -c tessedit_create_txt=1 -c tessedit_write_images=0 --oem 3 -c page_separator="" -c preserve_interword_spaces=1 --dpi 300 --tessdata-dir "C:\Program Files\Tesseract-OCR\tessdata" nobatch stdout > %rowText%, , Hide

MsgBox, Finished! Check row1.txt for OCR result.
