; 3Shape Automation Script
#NoEnv
SendMode Input
SetWorkingDir %A_ScriptDir%

^!t::

; === 1. Look for latest iTero ZIP file ===
zipFolder := "C:\Users\User\Downloads"
foundZip := ""
lastModified := ""  ; Initialize for comparison

Loop, Files, %zipFolder%\*.zip, R
{
    if (A_LoopFileTimeModified > lastModified)
    {
        lastModified := A_LoopFileTimeModified
        foundZip := A_LoopFileFullPath
    }
}

if (foundZip = "")
{
    MsgBox, 16, ❌ Error, No iTero ZIP file found!
    return
}

; === 2. Extract ID from filename ===
SplitPath, foundZip, zipFileName
RegExMatch(zipFileName, "iTero_Export_(\d+)", match)
id := match1

; If no match is found, just use the full filename (without extension) as ID fallback
if (id = "")
{
    ; Remove extension from the filename for fallback ID
    SplitPath, zipFileName,,,, nameNoExt
    id := nameNoExt
}

; === 3. Define unique output folder based on ID ===
outputFolder := zipFolder "\iTeroCase_" . id

; === 4. Unzip using PowerShell ===
RunWait, powershell -command "Expand-Archive -Path '%foundZip%' -DestinationPath '%outputFolder%' -Force"

; === 5. Find the PDF inside the extracted folder ===
pdfPath := ""
Loop, Files, %outputFolder%\*.pdf, R
{
    pdfPath := A_LoopFileFullPath
    break  ; only open the first one
}

if (pdfPath = "")
{
    MsgBox, 16, ❌ Error, No PDF file found in extracted folder!
    return
}

; === 6. Run extractTreatments.js on the PDF ===
pdfExtractionCmd := "node C:\Users\User\Desktop\BotWIP\dental-case-unifier\server\services\extractTreatments.js """ . pdfPath . """"
RunWait, %ComSpec% /c %pdfExtractionCmd%, , Hide


; === 7. Open PDF in browser (or default app) ===
Run, %pdfPath%

Sleep, 2000

WinActivate, 3Shape Dental Manager
Sleep, 1000
WinMaximize

; Wait a little (e.g., 2 seconds)
Sleep, 1000

; Move mouse and click at (70, 70) - absolute screen coordinates
Click, 70, 70

; Wait again after click (e.g., 3 seconds)
Sleep, 5000

Click, 571, 385

Sleep, 200

; Set the path to the file Puppeteer writes
filePath := "C:\Users\User\Desktop\Case Automation\patient_info.txt"

; Check if file exists
If !FileExist(filePath) {
    MsgBox, 16, Error, Patient info file not found: %filePath%
    Return
}

; Read the file contents (expecting two lines: patientName, doctorName)
FileRead, fileContent, %filePath%
; Split lines into an array
patientName := ""
doctorName := ""
lines := StrSplit(fileContent, "`n")
if (lines.Length() >= 2) {
    patientName := Trim(lines[1])
    doctorName := Trim(lines[2])
} else {
    MsgBox, 16, Error, File format incorrect in patient_info.txt
    Return
}

; Type patient name
SendInput, %patientName%
Sleep, 500

Click, 530, 215

Sleep, 500
SendInput, %doctorName%   ; This is "Vahid Varasteh"
Sleep, 500
SendInput, {Enter}

Sleep, 500
Click, 1900, 70
Sleep, 500
Click, 1800, 95
Sleep, 500
Click, 1850, 100
Sleep, 500
Click, 1850, 130
Sleep, 200
Click, 600, 300
Sleep, 200

; Model creation
Click, 760, 400
Sleep, 200
Click, 920, 570
Sleep, 200
Click, 1580, 780
Sleep, 200
Click, 760, 400
Sleep, 200
Click, 920, 650
Sleep, 200
Click, 1580, 780
Sleep, 200
Click, 760, 400

; Read treatment data
toothTreatmentMap := Object()
FileRead, rawText, C:\Users\User\Desktop\Case Automation\treatments.txt
Loop, Parse, rawText, `n, `r
{
    line := A_LoopField
    if (line = "")
        continue
    StringSplit, parts, line, `,
    toothNum := parts1 + 0
    treatment := parts2
    toothTreatmentMap[toothNum] := treatment
}

; Define tooth coordinates
toothCoords := Object()
toothCoords[1] := [915, 570]
toothCoords[2] := [915, 510]
toothCoords[3] := [915, 470]
toothCoords[4] := [925, 410]
toothCoords[5] := [940, 380]
toothCoords[6] := [970, 350]
toothCoords[7] := [1000, 320]
toothCoords[8] := [1050, 320]
toothCoords[9] := [1090, 320]
toothCoords[10] := [1140, 320]
toothCoords[11] := [1157, 363]
toothCoords[12] := [1195, 366]
toothCoords[13] := [1200, 420]
toothCoords[14] := [1200, 460]
toothCoords[15] := [1200, 520]
toothCoords[16] := [1200, 570]
toothCoords[17] := [1210, 640]
toothCoords[18] := [1210, 700]
toothCoords[19] := [1200, 750]
toothCoords[20] := [1200, 800]
toothCoords[21] := [1180, 840]
toothCoords[22] := [1150, 880]
toothCoords[23] := [1111, 892]
toothCoords[24] := [1080, 900]
toothCoords[25] := [1050, 900]
toothCoords[26] := [1016, 898]
toothCoords[27] := [977, 892]
toothCoords[28] := [966, 833]
toothCoords[29] := [945, 793]
toothCoords[30] := [920, 744]
toothCoords[31] := [915, 690]
toothCoords[32] := [920, 640]

; Helper functions
ClickTooth(toothNum) {
    global toothCoords
    if ObjHasKey(toothCoords, toothNum) {
        coords := toothCoords[toothNum]
        x := coords[1]
        y := coords[2]
        Click, %x%, %y%
        Sleep, 200
    }
}

ClickCoordinates(x, y) {
    Click, %x%, %y%
    Sleep, 500
}

; Parse all treatments into groups
implants := []
missing := []
crowns := []
veneers := []

for toothNum, treatment in toothTreatmentMap {
    if InStr(treatment, "Missing")
        missing.Insert(toothNum)
    else if (InStr(treatment, "Implant") || InStr(treatment, "Implant Based"))
        implants.Insert(toothNum)
    else if InStr(treatment, "Crown")
        crowns.Insert(toothNum)
    else if InStr(treatment, "Veneer")
        veneers.Insert(toothNum)
}

; Convert to quick lookup sets
implantsSet := Object()
missingSet := Object()
Loop % implants.MaxIndex() {
    t := implants[A_Index]
    implantsSet[t] := true
}
Loop % missing.MaxIndex() {
    t := missing[A_Index]
    missingSet[t] := true
}

visited := Object()
bridgeSets := []

; Bridge detection helpers
IsAdjacent(t1, t2) {
    return Abs(t1 - t2) = 1
}

BuildBridgeGroup(startTooth, ByRef currentGroup) {
    global implantsSet, missingSet, visited
    if ObjHasKey(visited, startTooth)
        return
    visited[startTooth] := true
    currentGroup.Insert(startTooth)
    neighbors := [-1, 1]
    Loop, % neighbors.MaxIndex() {
        offset := neighbors[A_Index]
        neighbor := startTooth + offset
        if (ObjHasKey(implantsSet, neighbor) || ObjHasKey(missingSet, neighbor))
            BuildBridgeGroup(neighbor, currentGroup)
    }
}

; Find bridge sets
for missingIndex, missingTooth in missing {
    if !ObjHasKey(visited, missingTooth) {
        group := []
        BuildBridgeGroup(missingTooth, group)
        bridgeSets.Insert(group)
    }
}

; --- Handle Bridges ---
for bIdx, bridge in bridgeSets {
    bridgeImplants := []
    bridgeMissing := []

    Loop % bridge.MaxIndex() {
        t := bridge[A_Index]
        if ObjHasKey(implantsSet, t)
            bridgeImplants.Insert(t)
        else if ObjHasKey(missingSet, t)
            bridgeMissing.Insert(t)
    }

    for i, t in bridgeImplants
        ClickTooth(t)
    ClickCoordinates(1570, 400)
    ClickCoordinates(1640, 385)
    ClickCoordinates(1565, 250)

    for i, t in bridgeMissing
        ClickTooth(t)
    ClickCoordinates(1575, 250)
    ClickCoordinates(1670, 230)

    ClickCoordinates(760, 320)

    for i, t in bridge
        ClickTooth(t)
    ClickCoordinates(1600, 550)
}

; --- Handle Standalone Implants ---
implantClicked := false

Loop % implants.MaxIndex() {
    t := implants[A_Index]
    inBridge := false
    Loop % bridgeSets.MaxIndex() {
        bridge := bridgeSets[A_Index]
        if (bridge.MaxIndex() > 0) {
            Loop % bridge.MaxIndex() {
                if (bridge[A_Index] = t) {
                    inBridge := true
                    break
                }
            }
        }
        if inBridge
            break
    }
    if !inBridge {
        ClickTooth(t)
        implantClicked := true
    }
}

if implantClicked
    ClickCoordinates(1560, 400)

; --- Handle Crowns ---
crownClicked := false

Loop % crowns.MaxIndex() {
    ClickTooth(crowns[A_Index])
    crownClicked := true
}

if crownClicked
    ClickCoordinates(1565, 250)
    ClickCoordinates(1730, 775)


; --- Handle Veneers ---
veneerClicked := false

Loop % veneers.MaxIndex() {
    ClickTooth(veneers[A_Index])
    veneerClicked := true
}

if veneerClicked {
    ClickCoordinates(1565, 250)
    ClickCoordinates(1730, 225)
}


Sleep, 200

Click, 1750, 1025

return